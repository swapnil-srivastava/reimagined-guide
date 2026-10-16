import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { sendCancelledEmails } from "../../../lib/server/booking";

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
  const emailed = await sendCancelledEmails(authed.client, booking);
  return res.status(200).json({ ok: true, emailed });
}
