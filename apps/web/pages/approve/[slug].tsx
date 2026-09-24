import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

// Supabase
import { supaClient } from "../../supa-client";

// React Components
import Metatags from "../../components/Metatags";
import AuthCheck from "../../components/AuthCheck";
import PostContent from "../../components/PostContent";

// Interfaces
import { POST, POST_DRAFT_WITH_POST } from "../../database.types";

// Library
import { generateMetaDescription } from "../../lib/library";
import { sanitizePostHtml } from "../../lib/sanitize";
import { isLive } from "../../lib/postWorkflow";

// e.g. localhost:3000/approve/article-slug?id=<post id>

const ApproveSlug: NextPage = () => {
  return (
    <div className="bg-blog-white dark:bg-fun-blue-500 min-h-screen text-blog-black dark:text-blog-white">
      <AuthCheck>
        <PostApprover />
      </AuthCheck>
    </div>
  );
};

function PostApprover() {
  const [draft, setDraft] = useState<POST_DRAFT_WITH_POST | null>(null);
  const [isSwapnil, setIsSwapnil] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { slug, id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    fetchApprovalPost();
  }, [router.isReady, slug, id]);

  const fetchApprovalPost = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    const admin = user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;
    setIsSwapnil(admin);

    if (!admin) {
      setLoading(false);
      return;
    }

    // Links from the approval email carry the post id; the slug alone is
    // only unique per author.
    let query = supaClient.from("post_drafts").select("*, posts!inner(*)");
    query =
      typeof id === "string"
        ? query.eq("post_id", id)
        : query.eq("posts.slug", Array.isArray(slug) ? slug[0] : slug);

    const { data } = await query.limit(1).maybeSingle();
    setDraft((data as POST_DRAFT_WITH_POST) ?? null);
    setLoading(false);
  };

  if (loading) return null;

  if (!isSwapnil || !draft) {
    return (
      <main className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-xl">
          {isSwapnil ? (
            <FormattedMessage
              id="approve-slug-not-found"
              description="Post to approve was not found"
              defaultMessage="Post not found."
            />
          ) : (
            <FormattedMessage
              id="approve-slug-admin-only"
              description="Only the admin can approve posts"
              defaultMessage="Only Swapnil can review posts."
            />
          )}
        </p>
        <Link href="/approve" className="underline">
          <FormattedMessage
            id="approve-slug-back"
            description="Link back to the approval queue"
            defaultMessage="Back to the approval queue"
          />
        </Link>
      </main>
    );
  }

  const live = draft.posts;
  // Preview the submitted draft with the live post's metadata
  const submitted: POST = {
    ...(live as POST),
    title: draft.title,
    content: draft.content,
    audio: draft.audio,
    videoLink: draft.videoLink,
  };
  const liveDiffers =
    isLive(live) &&
    (live?.content !== draft.content || live?.title !== draft.title);

  return (
    <>
      <main className="flex justify-center">
        <Metatags
          title={draft.title}
          description={generateMetaDescription(draft.content)}
        />
        <section className="basis-2/3 p-3 bg-blog-white text-[var(--text-primary)] flex flex-col gap-4">
          {draft.status !== "web_ready" && (
            <p className="p-3 rounded-lg bg-slate-100 dark:bg-fun-blue-700 text-sm">
              <FormattedMessage
                id="approve-slug-not-submitted"
                description="Explains that only Web Ready posts can be approved"
                defaultMessage="This post is not waiting for approval. The author has to mark it Web Ready first."
              />
            </p>
          )}

          <PostContent
            post={submitted}
            approve={isSwapnil}
            onReviewed={fetchApprovalPost}
          />

          {liveDiffers && (
            <details className="p-3 rounded-lg border border-gray-200 dark:border-fun-blue-400">
              <summary className="cursor-pointer font-medium">
                <FormattedMessage
                  id="approve-slug-live-version"
                  description="Toggle to show the version currently on the website"
                  defaultMessage="Compare with the version currently live"
                />
              </summary>
              <h2 className="mt-3 text-xl font-bold">{live?.title}</h2>
              <div
                className="post-content mt-2"
                dangerouslySetInnerHTML={{ __html: sanitizePostHtml(live?.content) }}
              />
            </details>
          )}
        </section>
      </main>
    </>
  );
}
export default ApproveSlug;
