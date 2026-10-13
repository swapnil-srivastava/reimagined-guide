import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../../supa-server-client";
import { bookingUrl, canChange, inviteIdentity, loadByToken, publicBooking } from "../../../../lib/server/booking";
import { sendBookingEmails } from "../../../../lib/server/bookingEmails";

// The buyer cancels their call: POST { bookingId, reason }. The credit goes
// back on the link, so they can pick a new time later.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method" });
  }
  const { bookingId, reason } = req.body ?? {};
  if (typeof bookingId !== "string") return res.status(400).json({ error: "bad_booking" });
  if (reason != null && (typeof reason !== "string" || reason.length > 500)) return res.status(400).json({ error: "bad_reason" });

  try {
    const token = String(req.query.token ?? "");
    const ctx = await loadByToken(token);
    if (!ctx) return res.status(404).json({ error: "not_found" });
    if (ctx.state === "revoked") return res.status(410).json({ error: "invalid_link" });
    const current = ctx.bookings.find((b) => b.id === bookingId);
    if (!current || current.status !== "confirmed") return res.status(409).json({ error: "not_active" });
    if (!canChange(ctx.type, current)) return res.status(409).json({ error: "too_late" });

    const { data: booking, error } = await supaServerClient!.rpc("booking_cancel", {
      p_booking_id: current.id,
      p_cancelled_by: "invitee",
      p_reason: typeof reason === "string" ? reason : null,
    });
    if (error || !booking) {
      if (error?.code === "P0002") return res.status(409).json({ error: "not_active" });
      console.error("booking_cancel failed", error);
      return res.status(500).json({ error: "server" });
    }

    const host = [...ctx.hosts, ...ctx.bookedHosts].find((h) => h.id === booking.host_id) ?? (await hostById(booking.host_id));
    if (host) {
      await sendBookingEmails({
        event: "cancelled",
        booking,
        type: ctx.type,
        host,
        identity: await inviteIdentity(booking),
        manageUrl: ctx.state === "ok" ? bookingUrl(token) : undefined,
        cancelledBy: "invitee",
        reason: booking.cancel_reason,
      });
    }
    return res.status(200).json({ booking: publicBooking(ctx.type, booking) });
  } catch (error) {
    console.error("booking cancel failed", error);
    return res.status(500).json({ error: "server" });
  }
}

async function hostById(id: string) {
  const { data } = await supaServerClient!.from("booking_hosts").select("*").eq("id", id).maybeSingle();
  return data;
}
