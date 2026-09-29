import type { SupabaseClient } from "@supabase/supabase-js";

import { supaClient } from "../supa-client";
import type { Database } from "../database.types";
import { POST_WITH_TAGS, POST_WITH_TAGS_SELECT, withSortedTags } from "./tags";

// Post view counts (see supabase/migrations/20260929200000_post_views.sql).

const SESSION_KEY = "post-views-recorded";

/**
 * Counts a view of a live post. The server counts each reader once per post
 * per day; the session guard just avoids repeat requests while browsing.
 * Resolves to the post's total views, or null when the view wasn't counted.
 */
export async function recordPostView(postId: string): Promise<number | null> {
  let seen: string[] = [];
  try {
    seen = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]");
    if (seen.includes(postId)) return null;
  } catch {
    // Storage unavailable (private mode): the server still de-duplicates
  }

  try {
    // Signed-in authors and admins are recognised and not counted
    const {
      data: { session },
    } = await supaClient.auth.getSession();

    const response = await fetch("/api/posts/view", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({ postId }),
    });
    if (!response.ok) return null;

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen, postId].slice(-50)));
    } catch {
      // ignore
    }

    const { views } = await response.json();
    return typeof views === "number" ? views : null;
  } catch {
    return null;
  }
}

/** Live posts with the most views in the last `days`, tags embedded */
export async function fetchPopularPosts(
  client: SupabaseClient<Database>,
  { days = 30, limit = 3 }: { days?: number; limit?: number } = {}
): Promise<POST_WITH_TAGS[]> {
  const { data, error } = await client
    .rpc("get_popular_posts", { p_days: days, p_limit: limit })
    .select(POST_WITH_TAGS_SELECT);

  if (error) {
    // Also the case before the post views migration is applied
    console.error("fetchPopularPosts: failed to load popular posts", error);
    return [];
  }
  return ((data ?? []) as unknown as POST_WITH_TAGS[]).map(withSortedTags);
}
