import type { GetServerSideProps } from "next";
import { escapeXml, getLivePosts } from "../lib/server/livePosts";
import { SITE_URL, postUrl } from "../lib/site";
import { supaClient } from "../supa-client";
import { fetchTagCounts } from "../lib/tags";

// e.g. localhost:3000/sitemap.xml
// Lists the home page, every approved, published post and every topic page.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [posts, tags] = await Promise.all([getLivePosts(), fetchTagCounts(supaClient)]);

  const urls = [
    `<url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq></url>`,
    ...posts.map((post) => {
      const lastmod = post.updated_at ?? post.published_at ?? post.created_at;
      return `<url><loc>${escapeXml(postUrl(post.username, post.slug))}</loc>${
        lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
      }</url>`;
    }),
    ...tags.map(
      (tag) =>
        `<url><loc>${escapeXml(`${SITE_URL}/tags/${encodeURIComponent(tag.slug)}`)}</loc><changefreq>weekly</changefreq></url>`
    ),
  ];

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`
  );
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
