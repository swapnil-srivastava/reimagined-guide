import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../lib/server/supabase-user";
import {
  defaultThumbnail,
  isAllowedThumbnail,
  oEmbedUrl,
  parseVideoUrl,
} from "../../lib/videoEmbed";

// GET /api/video-meta?url=<video link>
//   Title and thumbnail for a video an author is embedding, from the
//   provider's oEmbed endpoint. Only links lib/videoEmbed recognises are
//   looked up, and the request goes to a fixed provider URL built from the
//   video id, never to the URL that was sent. Signed-in users only.
//   Responds with { title, thumbnail } (either may be null).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const video = parseVideoUrl(typeof req.query.url === "string" ? req.query.url : "");
  if (!video) {
    return res.status(400).json({ error: "Not a supported video link." });
  }

  if (!(await getAuthedRequest(req))) {
    return res.status(401).json({ error: "Sign in to embed videos." });
  }

  let title: string | null = null;
  let thumbnail: string | null = defaultThumbnail(video) ?? null;

  try {
    const response = await fetch(oEmbedUrl(video), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (typeof data?.title === "string") title = data.title.trim().slice(0, 200) || null;
      if (isAllowedThumbnail(data?.thumbnail_url)) thumbnail = data.thumbnail_url;
    }
  } catch {
    // Private videos and provider outages just get no title; the embed still works
  }

  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.status(200).json({ title, thumbnail });
}
