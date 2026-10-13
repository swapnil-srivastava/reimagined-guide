import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimited } from "../../../../lib/server/rateLimit";
import { DateTime } from "luxon";
import { supaServerClient } from "../../../../supa-server-client";
import {
  bookingError,
  bookingUrl,
  busyRange,
  canChange,
  findSlot,
  inviteIdentity,
  isTimeZone,
  loadByToken,
  publicBooking,
} from "../../../../lib/server/booking";
import { sendBookingEmails } from "../../../../lib/server/bookingEmails";

// The buyer moves their call: POST { bookingId, hostId, start, timezone }.
// If the new time is gone, the old booking stays as it was.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method" });
  }
  if (await rateLimited(req, res, "booking-write", 10)) return;
  const { bookingId, hostId, start, timezone } = req.body ?? {};
  if (typeof bookingId !== "string") return res.status(400).json({ error: "bad_booking" });
  if (typeof start !== "string" || typeof hostId !== "string") return res.status(400).json({ error: "bad_slot" });

  try {
    const token = String(req.query.token ?? "");
    const ctx = await loadByToken(token);
    if (!ctx) return res.status(404).json({ error: "not_found" });
    if (ctx.state === "revoked" || !ctx.type.active) return res.status(410).json({ error: "invalid_link" });
    const previous = ctx.bookings.find((b) => b.id === bookingId);
    if (!previous || previous.status !== "confirmed") return res.status(409).json({ error: "not_active" });
    if (!canChange(ctx.type, previous)) return res.status(409).json({ error: "too_late" });
    const host = ctx.hosts.find((h) => h.id === hostId);
    if (!host) return res.status(400).json({ error: "bad_host" });

    // The old booking's own time counts as free, so it can move by 30 minutes
    const slot = await findSlot(ctx.type, host, start, previous.id);
    if (!slot) return res.status(409).json({ error: "taken" });
    if (Date.parse(slot.start) === Date.parse(previous.starts_at) && host.id === previous.host_id) {
      return res.status(400).json({ error: "same_time" });
    }

    const busy = busyRange(ctx.type, DateTime.fromISO(slot.start), DateTime.fromISO(slot.end));
    const { data: booking, error } = await supaServerClient!.rpc("booking_reschedule", {
      p_booking_id: previous.id,
      p_host_id: host.id,
      p_starts_at: slot.start,
      p_ends_at: slot.end,
      p_busy_from: busy.busy_from,
      p_busy_until: busy.busy_until,
      p_timezone: isTimeZone(timezone) ? timezone : previous.invitee_timezone ?? host.timezone,
    });
    if (error || !booking) {
      if (error?.code === "P0002") return res.status(409).json({ error: "not_active" });
      const mapped = bookingError(error?.code);
      if (mapped.status === 500) console.error("booking_reschedule failed", error);
      return res.status(mapped.status).json({ error: mapped.error });
    }

    await sendBookingEmails({
      event: "rescheduled",
      booking,
      previous,
      type: ctx.type,
      host,
      identity: await inviteIdentity(booking),
      manageUrl: bookingUrl(token),
    });
    return res.status(200).json({ booking: publicBooking(ctx.type, booking) });
  } catch (error) {
    console.error("booking reschedule failed", error);
    return res.status(500).json({ error: "server" });
  }
}
