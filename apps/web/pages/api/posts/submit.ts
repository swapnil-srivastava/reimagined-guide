import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import {
  ADMIN_EMAIL,
  escapeHtml,
  sendMail,
} from "../../../lib/server/mailer";
import { isUuid, requestOrigin } from "../../../lib/server/posts";

// POST /api/posts/submit { postId }
// Called by the author after marking their draft Web Ready. Emails the admin
// a link to review it.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authed = await getAuthedRequest(req);
  if (!authed) {
    return res.status(401).json({ error: "Please sign in and try again." });
  }

  const { postId } = req.body ?? {};
  if (!isUuid(postId)) {
    return res.status(400).json({ error: "A valid postId is required." });
  }

  const { data: draft, error } = await authed.client
    .from("post_drafts")
    .select("post_id, uid, title, status, posts(slug, username)")
    .eq("post_id", postId)
    .maybeSingle();

  if (error || !draft || draft.uid !== authed.user.id) {
    return res.status(404).json({ error: "Post not found." });
  }

  if (draft.status !== "web_ready") {
    return res
      .status(409)
      .json({ error: "Mark the post Web Ready before submitting it." });
  }

  const post = Array.isArray(draft.posts) ? draft.posts[0] : draft.posts;
  const origin = requestOrigin(req);
  const reviewUrl = `${origin}/approve/${encodeURIComponent(
    post?.slug ?? ""
  )}?id=${draft.post_id}`;

  const emailSent = await sendMail(
    ADMIN_EMAIL,
    `Ready for approval: ${draft.title}`,
    `<p><strong>Hello</strong> Swapnil Srivastava,</p>
     <p><strong>${escapeHtml(post?.username)}</strong> submitted
     "<strong>${escapeHtml(draft.title)}</strong>" for approval.</p>
     <p><a href="${reviewUrl}">Review and approve the post</a></p>`
  );

  return res.status(200).json({ emailSent });
}
