import { createHmac } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { isUuid } from "../../../lib/server/posts";

// Crawlers, link previews and automated browsers don't count as readers
const BOT_UA =
  /bot|crawl|spider|slurp|preview|fetch|facebookexternalhit|embedly|headless|lighthouse|pingdom|monitor|curl|wget|python|java\/|axios|node-fetch/i;

// Vercel sets x-real-ip / x-forwarded-for itself, overwriting any value the
// client sends, so they can't be used to fake new readers
function clientIp(req: NextApiRequest): string {
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0];
  return (first || req.socket.remoteAddress || "").trim();
}

/**
 * Anonymous id for "this reader, today": a keyed hash of the IP address with
 * the date in the key, so it can't be reversed or linked across days.
 * The user agent is left out on purpose: it's set by the client, so a script
 * could send a new one with every request and count as a new reader.
 * Nothing is stored in the browser.
 */
function visitorHash(req: NextApiRequest, secret: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", `${secret}:post-views:${day}`)
    .update(clientIp(req))
    .digest("hex");
}

// POST /api/posts/view { postId }
//   Counts a view once per reader, post and day. The author's and admins'
//   own visits are skipped (send the usual Authorization header).
//   Responds with { views } — the post's total, or null when not counted.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  const { postId } = req.body ?? {};
  if (!isUuid(postId)) {
    return res.status(400).json({ error: "A valid postId is required." });
  }

  const userAgent = req.headers["user-agent"] ?? "";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaServerClient || !secret || !userAgent || BOT_UA.test(userAgent) || !clientIp(req)) {
    return res.status(200).json({ views: null });
  }

  const viewer = await getAuthedRequest(req);

  const { data, error } = await supaServerClient.rpc("record_post_view", {
    p_post_id: postId,
    p_visitor_hash: visitorHash(req, secret),
    p_viewer: viewer?.user.id ?? null,
  });

  if (error) {
    console.error("record_post_view failed", error);
    return res.status(200).json({ views: null });
  }

  return res.status(200).json({ views: data });
}
