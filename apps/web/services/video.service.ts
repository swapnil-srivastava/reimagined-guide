import { supaClient } from "../supa-client";
import type { VideoMeta } from "../lib/tiptap/VideoEmbed";

/** Title and thumbnail of a video link, or null when the lookup fails. */
export async function fetchVideoMeta(url: string): Promise<VideoMeta | null> {
  const {
    data: { session },
  } = await supaClient.auth.getSession();

  try {
    const response = await fetch(`/api/video-meta?url=${encodeURIComponent(url)}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    });
    if (!response.ok) return null;
    const { title, thumbnail } = await response.json();
    return { title: title ?? undefined, thumbnail: thumbnail ?? undefined };
  } catch {
    return null;
  }
}
