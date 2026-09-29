import type { ParsedUrlQuery } from "querystring";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, POST, TAG, TAG_COUNT } from "../database.types";

// Topic tags for posts. The database enforces the same rules
// (see supabase/migrations/20260929174116_post_tags.sql).

export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 32;

/** Embeds a post's approved tags in a `posts` select */
export const POST_WITH_TAGS_SELECT = "*, tags(slug, name)";

export type POST_WITH_TAGS = POST & { tags?: TAG[] };

/**
 * Runs a query with the tags embedded and, if that fails (for example before
 * the tags migration is applied), runs it again without them, so pages keep
 * showing posts.
 */
export async function withTagsFallback<T>(
  run: (select: string) => PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<{ data: T | null; error: { message: string } | null }> {
  const withTags = await run(POST_WITH_TAGS_SELECT);
  if (!withTags.error) return withTags;
  console.error("Loading tags failed; loading posts without them", withTags.error);
  return run("*");
}

/** URL slug for a tag name. Keep in sync with `public.tag_slug` in SQL. */
export function tagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Tidies a typed tag name: trims and collapses spaces */
export function cleanTagName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Selected tag slugs from `?tags=java,frontend`, deduplicated and sorted */
export function parseTagQuery(value: ParsedUrlQuery[string]): string[] {
  const raw = (Array.isArray(value) ? value : [value ?? ""])
    .join(",")
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => SLUG_RE.test(slug));
  return Array.from(new Set(raw)).sort();
}

/** Sorts a post's embedded tags by name so cards render them consistently */
export function withSortedTags<T extends { tags?: TAG[] | null }>(post: T): T {
  if (!post?.tags) return post;
  return {
    ...post,
    tags: [...post.tags].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Tags for a draft, from the names the author typed */
export function draftTags(names: string[] | null | undefined): TAG[] {
  return (names ?? []).map((name) => ({ slug: tagSlug(name), name }));
}

/** True when a post carries every one of the selected tag slugs */
export function hasAllTags(post: { tags?: TAG[] | null }, slugs: string[]): boolean {
  const own = new Set((post.tags ?? []).map((tag) => tag.slug));
  return slugs.every((slug) => own.has(slug));
}

/** Counts tags across posts, most used first, for filtering a list in the browser */
export function countTags(posts: { tags?: TAG[] | null }[]): TAG_COUNT[] {
  const counts = new Map<string, TAG_COUNT>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const entry = counts.get(tag.slug);
      if (entry) entry.post_count += 1;
      else counts.set(tag.slug, { ...tag, post_count: 1 });
    }
  }
  return Array.from(counts.values()).sort(
    (a, b) => b.post_count - a.post_count || a.name.localeCompare(b.name)
  );
}

type Client = SupabaseClient<Database>;

/** Live posts carrying ALL of `tags`, newest first, with their tags embedded */
export async function fetchPostsByTags(
  client: Client,
  {
    tags = [],
    username = null,
    before = null,
    limit = 20,
  }: {
    tags?: string[];
    username?: string | null;
    before?: string | null;
    limit?: number;
  }
): Promise<POST_WITH_TAGS[]> {
  const { data, error } = await client
    .rpc("get_posts_by_tags", {
      p_tags: tags,
      p_username: username,
      p_before: before,
      p_limit: limit,
    })
    .select(POST_WITH_TAGS_SELECT);

  if (!error) {
    return ((data ?? []) as unknown as POST_WITH_TAGS[]).map(withSortedTags);
  }
  console.error("fetchPostsByTags: failed to load posts", error);

  // Without the tag functions (migration not applied yet) posts can't be
  // filtered, but the unfiltered list still works.
  if (tags.length > 0) return [];
  let query = client
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("approved", true);
  if (username) query = query.eq("username", username);
  if (before) query = query.lt("created_at", before);
  const { data: posts, error: fallbackError } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (fallbackError) {
    console.error("fetchPostsByTags: fallback failed", fallbackError);
    return [];
  }
  return posts ?? [];
}

/** Tags used on live posts, most used first */
export async function fetchTagCounts(
  client: Client,
  username: string | null = null
): Promise<TAG_COUNT[]> {
  const { data, error } = await client.rpc("get_tag_counts", {
    p_username: username,
  });
  if (error) {
    console.error("fetchTagCounts: failed to load tags", error);
    return [];
  }
  return (data ?? []).map((row) => ({ ...row, post_count: Number(row.post_count) }));
}
