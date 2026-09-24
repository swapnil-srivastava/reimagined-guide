import type { GetServerSideProps } from "next";
import { escapeXml, getLivePosts } from "../lib/server/livePosts";
import { SITE_URL, postUrl } from "../lib/site";

// e.g. localhost:3000/sitemap.xml
// Lists the home page and every approved, published post.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getLivePosts();

  const urls = [
    `<url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq></url>`,
    ...posts.map((post) => {
      const lastmod = post.updated_at ?? post.published_at ?? post.created_at;
      return `<url><loc>${escapeXml(postUrl(post.username, post.slug))}</loc>${
        lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
      }</url>`;
    }),
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
