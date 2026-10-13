import { createHash, randomBytes } from "crypto";
import { DateTime } from "luxon";
import { supaServerClient } from "../../supa-server-client";
import { SITE_URL } from "../site";
import { computeSlots, Slot } from "../booking/slots";
import { rulesOf } from "../booking/types";
import type { Booking, BookingHost, BookingType } from "../booking/types";
import type { Database } from "../../database.types";

// Server side of the buyer's booking page (/book/<token>). Everything here
// uses the service role client, so the API routes must check the token
// before calling in.

type Entitlement = Database["public"]["Tables"]["booking_entitlements"]["Row"];

/** Booking links stay valid this long after the purchase */
export const LINK_VALID_DAYS = 180;

/** Longest range one slots request may ask for */
export const MAX_RANGE_DAYS = 45;

export const TOKEN_RE = /^[A-Za-z0-9_-]{20,100}$/;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const bookingUrl = (token: string) => `${SITE_URL}/book/${token}`;

function db() {
  if (!supaServerClient) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return supaServerClient;
}

export function isTimeZone(zone: unknown): zone is string {
  if (typeof zone !== "string" || zone.length > 64) return false;
  return DateTime.now().setZone(zone).isValid;
}

/**
 * Creates the booking link for a paid order, when its package includes a
 * call. Returns null when it doesn't. Only the token's hash is stored, so
 * the link in the email is the only copy.
 */
export async function createBookingLink(options: {
  orderId: string;
  /** Calls bought; defaults to 1 */
  quantity?: number;
  packageId: string | null | undefined;
  email: string | null | undefined;
  name: string | null | undefined;
}): Promise<{ url: string; type: BookingType } | null> {
  if (!options.packageId) return null;
  const { data: type, error: typeError } = await db()
    .from("booking_types")
    .select("*")
    .eq("package_id", options.packageId)
    .eq("active", true)
    .maybeSingle();
  if (typeError) throw new Error(`Loading the booking type failed: ${typeError.message}`);
  if (!type) return null;

  const token = randomBytes(24).toString("base64url");
  const { error } = await db()
    .from("booking_entitlements")
    .insert({
      order_id: options.orderId,
      booking_type_id: type.id,
      quantity: Math.max(1, Math.floor(options.quantity ?? 1)),
      token_hash: hashToken(token),
      email: options.email?.trim().toLowerCase() || null,
      name: options.name?.trim() || null,
      expires_at: DateTime.now().plus({ days: LINK_VALID_DAYS }).toUTC().toISO(),
    });
  if (error) throw new Error(`Creating the booking link failed: ${error.message}`);
  return { url: bookingUrl(token), type };
}

export type LinkState = "ok" | "expired" | "revoked";

export interface BookingContext {
  entitlement: Entitlement;
  state: LinkState;
  type: BookingType;
  /** Hosts the buyer can book now */
  hosts: BookingHost[];
  /** Hosts of the buyer's bookings who no longer offer the call */
  bookedHosts: BookingHost[];
  defaultHostId: string;
  /** Bookings made with this link, newest first (cancelled ones included) */
  bookings: Booking[];
}

/** Everything the booking page needs for one link, or null if the token is unknown */
export async function loadByToken(token: string): Promise<BookingContext | null> {
  if (!TOKEN_RE.test(token)) return null;
  const { data: entitlement } = await db()
    .from("booking_entitlements")
    .select("*")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!entitlement) return null;

  const [{ data: type }, { data: links }, { data: bookings }] = await Promise.all([
    db().from("booking_types").select("*").eq("id", entitlement.booking_type_id).single(),
    db().from("booking_type_hosts").select("host_id, is_default").eq("booking_type_id", entitlement.booking_type_id),
    db()
      .from("bookings")
      .select("*")
      .eq("entitlement_id", entitlement.id)
      .order("created_at", { ascending: false }),
  ]);
  if (!type) return null;

  // Hosts of the buyer's own bookings are loaded too, so a call stays with its
  // host even after that host stops offering the call
  const offeredIds = (links ?? []).map((l) => l.host_id);
  const hostIds = Array.from(new Set([...offeredIds, ...(bookings ?? []).map((b) => b.host_id)]));
  const { data: hostRows } = hostIds.length
    ? await db().from("booking_hosts").select("*").in("id", hostIds).order("name")
    : { data: [] as BookingHost[] };
  const allHosts = hostRows ?? [];
  const hosts = allHosts.filter((h) => h.active && offeredIds.includes(h.id));
  const bookedHosts = allHosts.filter((h) => !hosts.includes(h));
  const preferred =
    (links ?? []).find((l) => l.is_default && hosts.some((h) => h.id === l.host_id))?.host_id ??
    hosts.find((h) => h.is_default)?.id ??
    hosts[0]?.id ??
    "";

  const now = Date.now();
  const state: LinkState = entitlement.revoked_at
    ? "revoked"
    : entitlement.expires_at && Date.parse(entitlement.expires_at) < now
      ? "expired"
      : "ok";

  return { entitlement, state, type, hosts, bookedHosts, defaultHostId: preferred, bookings: bookings ?? [] };
}

/** Busy range a call at [start, end) takes, with the type's buffers */
export function busyRange(type: BookingType, start: DateTime, end: DateTime) {
  return {
    busy_from: start.minus({ minutes: type.buffer_before_minutes }).toUTC().toISO()!,
    busy_until: end.plus({ minutes: type.buffer_after_minutes }).toUTC().toISO()!,
  };
}

/**
 * Free start times of a host for a booking type in [from, to). When moving a
 * booking, pass its id so its own time counts as free.
 */
export async function availableSlots(
  type: BookingType,
  host: BookingHost,
  from: Date,
  to: Date,
  excludeBookingId?: string
): Promise<Slot[]> {
  // Buffers can reach a little past the range, so load a day either side
  const loadFrom = DateTime.fromJSDate(from).minus({ days: 1 }).toUTC().toISO()!;
  const loadTo = DateTime.fromJSDate(to).plus({ days: 1 }).toUTC().toISO()!;
  const firstDate = DateTime.fromJSDate(from).setZone(host.timezone).minus({ days: 1 }).toISODate()!;
  const lastDate = DateTime.fromJSDate(to).setZone(host.timezone).plus({ days: 1 }).toISODate()!;

  let bookingsQuery = db()
    .from("bookings")
    .select("id, booking_type_id, starts_at, busy_from, busy_until")
    .eq("host_id", host.id)
    .eq("status", "confirmed")
    .lt("busy_from", loadTo)
    .gt("busy_until", loadFrom);
  if (excludeBookingId) bookingsQuery = bookingsQuery.neq("id", excludeBookingId);

  const [weekly, overrides, blocks, bookings] = await Promise.all([
    db().from("booking_weekly_hours").select("weekday, start_time, end_time").eq("host_id", host.id),
    db()
      .from("booking_date_overrides")
      .select("date, start_time, end_time")
      .eq("host_id", host.id)
      .gte("date", firstDate)
      .lte("date", lastDate),
    db()
      .from("booking_blocks")
      .select("starts_at, ends_at")
      .eq("host_id", host.id)
      .lt("starts_at", loadTo)
      .gt("ends_at", loadFrom),
    bookingsQuery,
  ]);
  const failed = weekly.error || overrides.error || blocks.error || bookings.error;
  if (failed) throw new Error(`Loading availability failed: ${failed.message}`);

  return computeSlots({
    timezone: host.timezone,
    weeklyHours: weekly.data ?? [],
    overrides: overrides.data ?? [],
    blocks: blocks.data ?? [],
    bookings: (bookings.data ?? []).map((b) => ({ starts_at: b.busy_from, ends_at: b.busy_until })),
    // A daily limit counts the host's calls of this type only
    limitStarts: (bookings.data ?? []).filter((b) => b.booking_type_id === type.id).map((b) => b.starts_at),
    rules: rulesOf(type),
    now: new Date(),
    from,
    to,
  });
}

/** The free slot starting at `startIso`, or null if it can't be booked */
export async function findSlot(
  type: BookingType,
  host: BookingHost,
  startIso: string,
  excludeBookingId?: string
): Promise<Slot | null> {
  const start = DateTime.fromISO(startIso, { setZone: true });
  if (!start.isValid) return null;
  const slots = await availableSlots(
    type,
    host,
    start.minus({ minutes: 1 }).toJSDate(),
    start.plus({ minutes: 1 }).toJSDate(),
    excludeBookingId
  );
  return slots.find((s) => Date.parse(s.start) === start.toMillis()) ?? null;
}

/** True when the buyer may still cancel or move this booking themselves */
export function canChange(type: BookingType, booking: Booking, now = Date.now()): boolean {
  return (
    booking.status === "confirmed" &&
    Date.parse(booking.starts_at) - now >= type.cancel_cutoff_minutes * 60_000
  );
}

/**
 * Calendar identity of a booking: the first booking's id stays the event's
 * UID across reschedules, and each move raises the sequence.
 */
export async function inviteIdentity(booking: Booking): Promise<{ uid: string; sequence: number }> {
  let rootId = booking.id;
  let previous = booking.rescheduled_from;
  let depth = 0;
  while (previous && depth < 50) {
    const { data } = await db().from("bookings").select("id, rescheduled_from").eq("id", previous).maybeSingle();
    if (!data) break;
    rootId = data.id;
    previous = data.rescheduled_from;
    depth++;
  }
  return { uid: `${rootId}@swapnilsrivastava.eu`, sequence: depth };
}

/** What a failed booking_book / booking_reschedule call means for the buyer */
export function bookingError(code: string | undefined): { status: number; error: string } {
  switch (code) {
    case "23P01":
      return { status: 409, error: "taken" };
    case "P0003":
      return { status: 409, error: "used_up" };
    case "P0002":
      return { status: 410, error: "invalid_link" };
    case "22023":
      return { status: 400, error: "bad_host" };
    default:
      return { status: 500, error: "server" };
  }
}

/** A booking as the buyer's page sees it */
export function publicBooking(type: BookingType, booking: Booking) {
  return {
    id: booking.id,
    host_id: booking.host_id,
    starts_at: booking.starts_at,
    ends_at: booking.ends_at,
    status: booking.status,
    invitee_name: booking.invitee_name,
    invitee_email: booking.invitee_email,
    invitee_timezone: booking.invitee_timezone,
    notes: booking.notes,
    cancelled_by: booking.cancelled_by,
    cancel_reason: booking.cancel_reason,
    rescheduled: !!booking.rescheduled_from,
    can_change: canChange(type, booking),
  };
}

export type PublicBooking = ReturnType<typeof publicBooking>;

/** Everything GET /api/booking/<token> returns */
export function publicContext(ctx: BookingContext) {
  const { entitlement, type } = ctx;
  return {
    state: ctx.state,
    remaining: Math.max(entitlement.quantity - entitlement.used, 0),
    expires_at: entitlement.expires_at,
    prefill: { name: entitlement.name ?? "", email: entitlement.email ?? "" },
    type: {
      name: type.name,
      description: type.description,
      duration_minutes: type.duration_minutes,
      location_kind: type.location_kind,
      cancel_cutoff_minutes: type.cancel_cutoff_minutes,
      max_days_ahead: type.max_days_ahead,
      active: type.active,
    },
    hosts: [
      ...ctx.hosts.map((h) => ({ ...publicHost(h), bookable: true })),
      ...ctx.bookedHosts.map((h) => ({ ...publicHost(h), bookable: false })),
    ],
    default_host_id: ctx.defaultHostId,
    bookings: ctx.bookings.map((b) => publicBooking(type, b)),
  };
}

export type PublicContext = ReturnType<typeof publicContext>;

const publicHost = (h: BookingHost) => ({ id: h.id, name: h.name, title: h.title, photo_url: h.photo_url, timezone: h.timezone });

/** Removes control characters (line breaks included) from a one-line value */
export const oneLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
