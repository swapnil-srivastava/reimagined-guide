import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { inviteIdentity } from "../../../lib/server/booking";
import { sendBookingEmails } from "../../../lib/server/bookingEmails";

// The host cancels a call from /admin/booking: POST { bookingId, reason }.
// Runs as the signed-in admin (row level security applies) and emails the
// buyer, so they know and can pick a new time with their link.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method" });
  }
  const authed = await getAuthedRequest(req);
  if (!authed) return res.status(401).json({ error: "auth" });
  const { data: isAdmin } = await authed.client.rpc("is_admin");
  if (!isAdmin) return res.status(403).json({ error: "auth" });

  const { bookingId, reason } = req.body ?? {};
  if (typeof bookingId !== "string") return res.status(400).json({ error: "bad_booking" });
  if (reason != null && (typeof reason !== "string" || reason.length > 500)) return res.status(400).json({ error: "bad_reason" });

  const { data: booking, error } = await authed.client.rpc("booking_cancel", {
    p_booking_id: bookingId,
    p_cancelled_by: "host",
    p_reason: typeof reason === "string" ? reason : null,
  });
  if (error || !booking) {
    if (error?.code === "P0002") return res.status(409).json({ error: "not_active" });
    console.error("admin booking_cancel failed", error);
    return res.status(500).json({ error: "server" });
  }

  // Whether the buyer and host emails went out, so the admin page can say so
  let emailed: boolean | null = null;
  try {
    const [{ data: type }, { data: host }] = await Promise.all([
      authed.client.from("booking_types").select("*").eq("id", booking.booking_type_id).single(),
      authed.client.from("booking_hosts").select("*").eq("id", booking.host_id).single(),
    ]);
    // Past calls are cancelled quietly; the buyer only hears about upcoming ones
    if (type && host && Date.parse(booking.starts_at) > Date.now()) {
      const sent = await sendBookingEmails({
        event: "cancelled",
        booking,
        type,
        host,
        identity: await inviteIdentity(booking),
        cancelledBy: "host",
        reason: booking.cancel_reason,
      });
      emailed = sent.invitee && sent.host;
    }
  } catch (mailError) {
    emailed = false;
    console.error("admin cancel email failed", mailError);
  }
  return res.status(200).json({ ok: true, emailed });
}
