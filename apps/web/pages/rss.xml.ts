import type { GetServerSideProps } from "next";
import { escapeXml, getLivePosts } from "../lib/server/livePosts";
import { sanitizePostHtml } from "../lib/sanitize";
import { stripHtml } from "../lib/postWorkflow";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, postUrl } from "../lib/site";

// e.g. localhost:3000/rss.xml
// RSS 2.0 feed of the latest approved, published posts.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getLivePosts(50);

  const items = posts
    .map((post) => {
      const url = postUrl(post.username, post.slug);
      const date = post.published_at ?? post.created_at;
      const summary = stripHtml(post.content).slice(0, 280);
      // "]]>" would end the CDATA section early
      const html = sanitizePostHtml(post.content).replace(/]]>/g, "]]]]><![CDATA[>");
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <dc:creator>${escapeXml(post.username)}</dc:creator>
      ${date ? `<pubDate>${new Date(date).toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(summary)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`;
    })
    .join("");

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`);
  res.end();

  return { props: {} };
};

export default function Rss() {
  return null;
}
