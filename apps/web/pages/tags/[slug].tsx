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
import { POST_WITH_TAGS, fetchPostsByTags } from "../../lib/tags";
import { SITE_URL } from "../../lib/site";

// e.g. localhost:3000/tags/java
// Every live post with one tag: a stable, indexable page for the topic.
// Combining topics happens on the home page (/?tags=java,frontend).

const LIMIT = 100;

type TagPageProps = { tag: TAG; posts: POST_WITH_TAGS[] };

export const getServerSideProps: GetServerSideProps<TagPageProps> = async ({ params, res }) => {
  const slug = String(params?.slug ?? "").toLowerCase();

  const { data: tag } = await supaClient
    .from("tags")
    .select("slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!tag) return { notFound: true };

  const posts = await fetchPostsByTags(supaClient, { tags: [tag.slug], limit: LIMIT });
  if (posts.length === 0) return { notFound: true };

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return { props: { tag, posts } };
};

export default function TagPage({ tag, posts }: TagPageProps) {
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
        <p className="text-[var(--text-muted)]">
          <FormattedMessage
            id="tag-page-count"
            description="Number of articles on a topic page"
            defaultMessage="{count, plural, one {# article} other {# articles}}"
            values={{ count: posts.length }}
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
    </main>
  );
}
