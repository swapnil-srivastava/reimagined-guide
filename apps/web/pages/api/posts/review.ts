import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import {
  SITE_URL,
  escapeHtml,
  getUserEmail,
  sendMail,
} from "../../../lib/server/mailer";
import { isUuid, revalidatePost } from "../../../lib/server/posts";

type ReviewAction = "approve" | "request_changes" | "unpublish";

const ACTIONS: ReviewAction[] = ["approve", "request_changes", "unpublish"];

// POST /api/posts/review { postId, action, note? }
//   approve          admin only: copies the Web Ready draft to the live post
//   request_changes  admin only: sends the draft back to the author with a note
//   unpublish        author or admin: takes the live post off the website
// Permissions are enforced by the database functions, which run as the caller.
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

  const { postId, action, note } = req.body ?? {};
  if (!isUuid(postId) || !ACTIONS.includes(action)) {
    return res
      .status(400)
      .json({ error: "A valid postId and action are required." });
  }

  const { client } = authed;

  const rpc =
    action === "approve"
      ? client.rpc("approve_post", { p_post_id: postId })
      : action === "request_changes"
        ? client.rpc("request_post_changes", {
            p_post_id: postId,
            p_note: typeof note === "string" ? note : "",
          })
        : client.rpc("unpublish_post", { p_post_id: postId });

  const { error: rpcError } = await rpc;
  if (rpcError) {
    const status = rpcError.code === "42501" ? 403 : 400;
    return res.status(status).json({ error: rpcError.message });
  }

  const { data: post } = await client
    .from("posts")
    .select("id, uid, slug, username, title, profiles!posts_uid_fkey(email)")
    .eq("id", postId)
    .maybeSingle();

  if (action !== "request_changes") {
    await revalidatePost(res, post?.username ?? null, post?.slug ?? null);
  }

  let emailSent = false;
  if (post?.uid && action !== "unpublish") {
    const profile = Array.isArray(post.profiles)
      ? post.profiles[0]
      : post.profiles;
    const authorEmail = await getUserEmail(post.uid, profile?.email);
    const title = escapeHtml(post.title);

    if (authorEmail) {
      emailSent =
        action === "approve"
          ? await sendMail(
              authorEmail,
              `Your post is live: ${post.title}`,
              `<p>Good news! "<strong>${title}</strong>" was approved and is now live.</p>
               <p><a href="${SITE_URL}/${encodeURIComponent(
                 post.username ?? ""
               )}/${encodeURIComponent(post.slug ?? "")}">Read it on the website</a></p>`
            )
          : await sendMail(
              authorEmail,
              `Changes requested: ${post.title}`,
              `<p>Swapnil reviewed "<strong>${title}</strong>" and asked for some changes:</p>
               <blockquote>${escapeHtml(note)}</blockquote>
               <p><a href="${SITE_URL}/admin/${encodeURIComponent(
                 post.slug ?? ""
               )}">Edit your post</a></p>`
            );
    }
  }

  return res.status(200).json({ ok: true, emailSent });
}
