// Translated

import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

// Styles
import styles from "../../styles/Post.module.css";

// React Components
import PostContent from "../../components/PostContent";
import Metatags from "../../components/Metatags";
import PostList from "../../components/PostList";

// Supabase
import { supaClient } from "../../supa-client";

// Library
import { generateMetaDescription } from "../../lib/library";
import { stripHtml } from "../../lib/postWorkflow";
import { SITE_NAME, postUrl } from "../../lib/site";
import {
  POST_WITH_TAGS,
  POST_WITH_TAGS_SELECT,
  withSortedTags,
} from "../../lib/tags";

// e.g. localhost:3000/swapnil/page1
// e.g. localhost:3000/swapnil/page2

// Only approved, published posts have a public page. Row level security
// enforces the same rule for the anonymous client used here.
async function getLivePost(username: string, slug: string): Promise<POST_WITH_TAGS | null> {
  const { data } = await supaClient
    .from("posts")
    .select(POST_WITH_TAGS_SELECT)
    .eq("username", username)
    .eq("slug", slug)
    .eq("published", true)
    .eq("approved", true)
    .maybeSingle();

  return data ? withSortedTags(data as unknown as POST_WITH_TAGS) : null;
}

// Live posts sharing the most tags with this one
async function getRelatedPosts(postId: string): Promise<POST_WITH_TAGS[]> {
  const { data, error } = await supaClient
    .rpc("get_related_posts", { p_post_id: postId, p_limit: 3 })
    .select(POST_WITH_TAGS_SELECT);

  if (error) {
    console.error("getRelatedPosts: failed to load related posts", error);
    return [];
  }
  return ((data ?? []) as unknown as POST_WITH_TAGS[]).map(withSortedTags);
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const post = await getLivePost(username, slug);

  if (!post) {
    // Re-checked on the next request after a minute; approving a post also
    // revalidates this page straight away (see /api/posts/review).
    return { notFound: true, revalidate: 60 };
  }

  const relatedPosts = await getRelatedPosts(post.id);

  return {
    props: { post, relatedPosts },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  // Don't prerender posts at build time: querying Supabase for every post
  // slows down every deploy. Each post is rendered on its first request
  // (fallback: "blocking") and then cached and revalidated via ISR.
  return {
    paths: [],
    fallback: "blocking",
  };
}

function Post(props: { post: POST_WITH_TAGS; relatedPosts: POST_WITH_TAGS[] }) {
  const [post, setPost] = useState(props.post);
  const [postAudioUrl, setPostAudioUrl] = useState("");

  // Refresh counts on the client; the cached page may be a little stale
  const fetchPost = async () => {
    const { data } = await supaClient
      .from("posts")
      .select(POST_WITH_TAGS_SELECT)
      .eq("id", props.post.id)
      .maybeSingle();

    const freshPost = data ? withSortedTags(data as unknown as POST_WITH_TAGS) : null;
    if (freshPost) setPost(freshPost);

    const audio = (freshPost ?? props.post)?.audio;
    if (!audio) return;

    // Get the audio URL of the post.
    // Note Url only valid for 10 mins.
    const { data: dataSignedUrl } = await supaClient.storage
      .from("audio")
      .createSignedUrl(audio, 600); // Valid for 600 seconds = 10 mins

    if (dataSignedUrl?.signedUrl) setPostAudioUrl(dataSignedUrl.signedUrl);
  };

  useEffect(() => {
    setPost(props.post);
    fetchPost();
  }, [props.post.id]);

  const url = postUrl(post.username, post.slug);
  const description = generateMetaDescription(stripHtml(post.content));
  const publishedTime = post.published_at ?? post.created_at;

  return (
    <main className={styles.container}>
      <Metatags
        title={post.title}
        description={description}
        type="article"
        url={url}
        publishedTime={publishedTime}
        modifiedTime={post.updated_at}
        author={post.username}
        tags={(post.tags ?? []).map((tag) => tag.name)}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description,
          url,
          mainEntityOfPage: url,
          datePublished: publishedTime,
          dateModified: post.updated_at ?? publishedTime,
          author: { "@type": "Person", name: post.username },
          ...(post.tags?.length ? { keywords: post.tags.map((tag) => tag.name).join(", ") } : {}),
          publisher: { "@type": "Organization", name: SITE_NAME },
          ...(post.photo_url ? { image: post.photo_url } : {}),
        }}
      />

      <section className="basis-3/5 p-3">
        <PostContent post={post} audioUrl={postAudioUrl} />

        {props.relatedPosts?.length > 0 && (
          <section aria-labelledby="related-posts-heading" className="mt-10">
            <h2
              id="related-posts-heading"
              className="px-3 text-2xl font-bold text-blog-black dark:text-blog-white"
            >
              <FormattedMessage
                id="post-related-articles"
                description="Heading above articles that share topics with the current one"
                defaultMessage="Related articles"
              />
            </h2>
            <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
              <PostList posts={props.relatedPosts} />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default Post;
