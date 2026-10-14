import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { bookingUrl, hashToken } from "../../../lib/server/booking";
import { sendLinkEmail } from "../../../lib/server/bookingEmails";

// Emails a buyer their booking link again: POST { entitlementId }.
// Only the hash of each link is stored, so this makes a fresh one in the
// second link slot (the one the "not booked yet" reminder uses). The order
// email's link keeps working; an earlier reminder or resent link stops.
// Runs as the signed-in admin, so row level security applies.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method" });
  }
  const authed = await getAuthedRequest(req);
  if (!authed) return res.status(401).json({ error: "auth" });
  const { data: isAdmin } = await authed.client.rpc("is_admin");
  if (!isAdmin) return res.status(403).json({ error: "auth" });

  const { entitlementId } = req.body ?? {};
  if (typeof entitlementId !== "string") return res.status(400).json({ error: "bad_request" });
  const db = authed.client;

  const { data: link } = await db.from("booking_entitlements").select("*").eq("id", entitlementId).maybeSingle();
  if (!link) return res.status(404).json({ error: "not_found" });
  if (!link.email) return res.status(400).json({ error: "no_email" });
  if (link.revoked_at) return res.status(400).json({ error: "revoked" });
  if (link.expires_at && Date.parse(link.expires_at) <= Date.now()) return res.status(400).json({ error: "expired" });

  const { data: type } = await db.from("booking_types").select("*").eq("id", link.booking_type_id).maybeSingle();
  if (!type) return res.status(404).json({ error: "not_found" });

  const token = randomBytes(24).toString("base64url");
  const { error } = await db.from("booking_entitlements").update({ nudge_token_hash: hashToken(token) }).eq("id", link.id);
  if (error) {
    console.error("booking resend: new token failed", error);
    return res.status(500).json({ error: "server" });
  }
  const { count } = await db.from("bookings").select("id", { count: "exact", head: true }).eq("entitlement_id", link.id);
  const sent = await sendLinkEmail({ email: link.email, name: link.name, type, url: bookingUrl(token), booked: (count ?? 0) > 0 });
  if (!sent) return res.status(502).json({ error: "email_failed" });
  return res.status(200).json({ ok: true });
}
