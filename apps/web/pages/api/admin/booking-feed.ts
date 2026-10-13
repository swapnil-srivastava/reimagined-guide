import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { hashToken } from "../../../lib/server/booking";
import { SITE_URL } from "../../../lib/site";

// Turns a host's private calendar feed on (a new link each time, so the old
// one stops working) or off: POST { hostId, action: "new" | "off" }.
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

  const { hostId, action } = req.body ?? {};
  if (typeof hostId !== "string" || (action !== "new" && action !== "off")) return res.status(400).json({ error: "bad_request" });

  const token = action === "new" ? randomBytes(24).toString("base64url") : null;
  const { data, error } = await authed.client
    .from("booking_hosts")
    .update({ feed_token_hash: token ? hashToken(token) : null })
    .eq("id", hostId)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("booking feed update failed", error);
    return res.status(500).json({ error: "server" });
  }
  if (!data) return res.status(404).json({ error: "not_found" });
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ url: token ? `${SITE_URL}/api/booking/feed/${token}.ics` : null });
}
