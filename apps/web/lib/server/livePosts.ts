import { supaClient } from "../../supa-client";
import { POST } from "../../database.types";

/** Approved, published posts, newest first. Used by the sitemap and RSS feed. */
export async function getLivePosts(limit = 500): Promise<POST[]> {
  const { data, error } = await supaClient
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLivePosts: failed to load posts", error);
    return [];
  }
  return data ?? [];
}

export function escapeXml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
