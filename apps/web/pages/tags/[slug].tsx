import type { GetServerSideProps } from "next";
import Link from "next/link";
import { FormattedMessage, useIntl } from "react-intl";

// React Components
import Metatags from "../../components/Metatags";
import PostList from "../../components/PostList";

// Supabase
import { supaClient } from "../../supa-client";

// Library
import type { TAG } from "../../database.types";
import { POST_WITH_TAGS, fetchPostsByTags, fetchTagCounts } from "../../lib/tags";
import { SITE_URL } from "../../lib/site";

// e.g. localhost:3000/tags/java
// Every live post with one tag: a stable, indexable page for the topic.
// Combining topics happens on the home page (/?tags=java,frontend).

// Cards need each post's full content (word count, excerpt), so keep the
// serialized page data small
const LIMIT = 48;

type TagPageProps = {
  tag: TAG;
  posts: POST_WITH_TAGS[];
  /** Every live post with the tag; more than `posts` when over the limit */
  total: number;
};

export const getServerSideProps: GetServerSideProps<TagPageProps> = async ({ params, res }) => {
  const slug = String(params?.slug ?? "").toLowerCase();

  // Independent queries: the posts only need the slug from the URL
  const [{ data: tag }, posts, counts] = await Promise.all([
    supaClient.from("tags").select("slug, name").eq("slug", slug).maybeSingle(),
    fetchPostsByTags(supaClient, { tags: [slug], limit: LIMIT }),
    fetchTagCounts(supaClient),
  ]);

  if (!tag || posts.length === 0) return { notFound: true };

  const total = Math.max(
    counts.find((count) => count.slug === slug)?.post_count ?? 0,
    posts.length
  );

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return { props: { tag, posts, total } };
};

export default function TagPage({ tag, posts, total }: TagPageProps) {
  const intl = useIntl();
  const title = intl.formatMessage(
    {
      id: "tag-page-title",
      description: "Title of the page listing every article with a topic",
      defaultMessage: "{tag} articles",
    },
    { tag: tag.name }
  );

  return (
    <main className="font-poppins min-h-screen flex flex-col items-center gap-6 px-4 py-12 bg-blog-white dark:bg-fun-blue-500 text-blog-black dark:text-blog-white">
      <Metatags
        title={title}
        description={intl.formatMessage(
          {
            id: "tag-page-description",
            description: "Meta description of a topic page",
            defaultMessage: "Articles about {tag} on Swapnil's Odyssey.",
          },
          { tag: tag.name }
        )}
        url={`${SITE_URL}/tags/${encodeURIComponent(tag.slug)}`}
      />

      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-poppins text-3xl sm:text-4xl font-bold text-balance">
          <span aria-hidden="true" className="opacity-60">#</span>
          {tag.name}
        </h1>
        <p className="text-[color-mix(in_srgb,var(--text-primary)_80%,transparent)]">
          <FormattedMessage
            id="tag-page-count"
            description="Number of articles on a topic page"
            defaultMessage="{count, plural, one {# article} other {# articles}}"
            values={{ count: total }}
          />
        </p>
        <Link
          href={{ pathname: "/", query: { tags: tag.slug }, hash: "post-list" }}
          className="text-sm underline underline-offset-4 hover:text-[var(--color-primary)]"
        >
          <FormattedMessage
            id="tag-page-combine"
            description="Link to the home page filter, where topics can be combined"
            defaultMessage="Combine with other topics"
          />
        </Link>
      </header>

      <div className="flex flex-wrap gap-5 w-full justify-center">
        <PostList posts={posts} />
      </div>

      {/* The home page filter pages through all of them */}
      {total > posts.length && (
        <Link
          href={{ pathname: "/", query: { tags: tag.slug }, hash: "post-list" }}
          className="px-5 py-2.5 rounded-lg font-medium bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          <FormattedMessage
            id="tag-page-see-all"
            description="Link to every article with the topic when the topic page shows only the newest"
            defaultMessage="See all {count} articles"
            values={{ count: total }}
          />
        </Link>
      )}
    </main>
  );
}
