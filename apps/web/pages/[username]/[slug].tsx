// Translated

import React, { useEffect, useState } from "react";

// Styles
import styles from "../../styles/Post.module.css";

// React Components
import PostContent from "../../components/PostContent";
import Metatags from "../../components/Metatags";

// Supabase
import { supaClient } from "../../supa-client";

// Library
import { generateMetaDescription } from "../../lib/library";
import { stripHtml } from "../../lib/postWorkflow";
import { SITE_NAME, postUrl } from "../../lib/site";
import { POST } from "../../database.types";

// e.g. localhost:3000/swapnil/page1
// e.g. localhost:3000/swapnil/page2

// Only approved, published posts have a public page. Row level security
// enforces the same rule for the anonymous client used here.
async function getLivePost(username: string, slug: string): Promise<POST | null> {
  const { data } = await supaClient
    .from("posts")
    .select("*")
    .eq("username", username)
    .eq("slug", slug)
    .eq("published", true)
    .eq("approved", true)
    .maybeSingle();

  return data ?? null;
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const post = await getLivePost(username, slug);

  if (!post) {
    // Re-checked on the next request after a minute; approving a post also
    // revalidates this page straight away (see /api/posts/review).
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: { post },
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

function Post(props: { post: POST }) {
  const [post, setPost] = useState(props.post);
  const [postAudioUrl, setPostAudioUrl] = useState("");

  // Refresh counts on the client; the cached page may be a little stale
  const fetchPost = async () => {
    const { data: freshPost } = await supaClient
      .from("posts")
      .select("*")
      .eq("id", props.post.id)
      .maybeSingle();

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
          publisher: { "@type": "Organization", name: SITE_NAME },
          ...(post.photo_url ? { image: post.photo_url } : {}),
        }}
      />

      <section className="basis-3/5 p-3">
        <PostContent post={post} audioUrl={postAudioUrl} />
      </section>
    </main>
  );
}

export default Post;
