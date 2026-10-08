import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { isUuid } from "../../../lib/server/posts";
import { isUncountable, visitorHash } from "../../../lib/server/visitor";

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

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaServerClient || !secret || isUncountable(req)) {
    return res.status(200).json({ views: null });
  }

  const viewer = await getAuthedRequest(req);

  const { data, error } = await supaServerClient.rpc("record_post_view", {
    p_post_id: postId,
    p_visitor_hash: visitorHash(req, secret, "post-views"),
    p_viewer: viewer?.user.id ?? null,
  });

  if (error) {
    console.error("record_post_view failed", error);
    return res.status(200).json({ views: null });
  }

  return res.status(200).json({ views: data });
}
