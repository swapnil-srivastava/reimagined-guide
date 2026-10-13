import type { NextApiRequest, NextApiResponse } from "next";
import { DateTime } from "luxon";
import { supaServerClient } from "../../../../supa-server-client";
import {
  bookingError,
  bookingUrl,
  busyRange,
  EMAIL_RE,
  findSlot,
  inviteIdentity,
  isTimeZone,
  loadByToken,
  oneLine,
  publicBooking,
} from "../../../../lib/server/booking";
import { sendBookingEmails } from "../../../../lib/server/bookingEmails";

// Books a call: POST { hostId, start, name, email, timezone, notes }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method" });
  }
  const { hostId, start, email, timezone, notes } = req.body ?? {};
  if (typeof start !== "string" || typeof hostId !== "string") return res.status(400).json({ error: "bad_slot" });
  // The name goes into email subjects and calendar invites, so one line only
  const name = typeof req.body?.name === "string" ? oneLine(req.body.name) : "";
  if (!name || name.length > 100) return res.status(400).json({ error: "bad_name" });
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "bad_email" });
  }
  if (notes != null && (typeof notes !== "string" || notes.length > 1000)) return res.status(400).json({ error: "bad_notes" });

  try {
    const token = String(req.query.token ?? "");
    const ctx = await loadByToken(token);
    if (!ctx) return res.status(404).json({ error: "not_found" });
    if (ctx.state !== "ok" || !ctx.type.active) return res.status(410).json({ error: "invalid_link" });
    if (ctx.entitlement.used >= ctx.entitlement.quantity) return res.status(409).json({ error: "used_up" });
    const host = ctx.hosts.find((h) => h.id === hostId);
    if (!host) return res.status(400).json({ error: "bad_host" });

    const slot = await findSlot(ctx.type, host, start);
    if (!slot) return res.status(409).json({ error: "taken" });

    const busy = busyRange(ctx.type, DateTime.fromISO(slot.start), DateTime.fromISO(slot.end));
    const { data: booking, error } = await supaServerClient!.rpc("booking_book", {
      p_entitlement_id: ctx.entitlement.id,
      p_host_id: host.id,
      p_starts_at: slot.start,
      p_ends_at: slot.end,
      p_busy_from: busy.busy_from,
      p_busy_until: busy.busy_until,
      p_name: name,
      p_email: email,
      p_timezone: isTimeZone(timezone) ? timezone : host.timezone,
      p_notes: typeof notes === "string" ? notes : "",
    });
    if (error || !booking) {
      const mapped = bookingError(error?.code);
      if (mapped.status === 500) console.error("booking_book failed", error);
      return res.status(mapped.status).json({ error: mapped.error });
    }

    await sendBookingEmails({
      event: "booked",
      booking,
      type: ctx.type,
      host,
      identity: await inviteIdentity(booking),
      manageUrl: bookingUrl(token),
    });
    return res.status(200).json({ booking: publicBooking(ctx.type, booking) });
  } catch (error) {
    console.error("booking failed", error);
    return res.status(500).json({ error: "server" });
  }
}
