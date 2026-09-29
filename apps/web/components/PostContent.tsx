import Link from "next/link";
import { FormattedMessage, useIntl } from 'react-intl';
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart, faPenToSquare, faThumbsUp, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";

// React Components
import HeartButton, { HeartCount, heartPillClass } from "./HeartButton";
import BasicTooltip from "./Tooltip";
import Video from "./Video";
import AudioPlayer from "./AudioPlayer";
import ViewCount from "./ViewCount";
import { TagList } from "./TagChip";

// Interface
import { RootState } from "../lib/interfaces/interface";
import { POST, POST_DRAFT, TAG } from "../database.types";

// Supabase
import { supaClient } from "../supa-client";

// Services
import { reviewPost } from "../services/email.service";

// Library
import { sanitizePostHtml } from "../lib/sanitize";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  WORKFLOW_STEPS,
  isLive,
  workflowStep,
} from "../lib/postWorkflow";

// UI component for main post content
export default function PostContent({
  post,
  approve = false,
  audioUrl = "",
  onReviewed,
}: {
  post: POST & { tags?: TAG[] };
  /** Show Swapnil's review actions. The server re-checks the permission. */
  approve?: boolean;
  audioUrl?: string;
  onReviewed?: () => void;
}) {
  const intl = useIntl();
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const wordCount = (post?.content ?? "").trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post?.created_at).isValid()
    ? moment(post?.created_at).format("MMM DD")
    : "";

  const isAuthor = Boolean(profile?.id && profile.id === post?.uid);
  // Guest (anonymous) sessions cannot like posts; the database enforces it too
  const canReact = Boolean(profile?.id && !session?.user?.is_anonymous);
  const isAdmin = Boolean(
    profile?.id && profile.id === process.env.NEXT_PUBLIC_SWAPNIL_ID
  );

  // Workflow status is private: only the author and Swapnil can read drafts
  const [draft, setDraft] = useState<POST_DRAFT | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [heartCount, setHeartCount] = useState(post?.heart_count ?? 0);

  useEffect(() => setHeartCount(post?.heart_count ?? 0), [post?.heart_count]);

  useEffect(() => {
    if (!post?.id || !(isAuthor || isAdmin)) {
      setDraft(null);
      return;
    }
    supaClient
      .from("post_drafts")
      .select("*")
      .eq("post_id", post.id)
      .maybeSingle()
      .then(({ data }) => setDraft(data ?? null));
  }, [post?.id, isAuthor, isAdmin]);

  const review = async (action: "approve" | "request_changes") => {
    let note: string | undefined;
    if (action === "request_changes") {
      note = window.prompt(
        intl.formatMessage({
          id: "postcontent-request-changes-prompt",
          description: "Prompt asking what the author should change",
          defaultMessage: "What should the author change?",
        })
      ) ?? undefined;
      if (!note?.trim()) return;
    }

    setReviewing(true);
    try {
      const { emailSent } = await reviewPost(post.id, action, note);
      toast.success(
        action === "approve"
          ? intl.formatMessage({
              id: "postcontent-post-approved",
              description: "Post approved successfully!",
              defaultMessage: "Post approved successfully!"
            })
          : intl.formatMessage({
              id: "postcontent-changes-requested",
              description: "Toast after sending a post back to its author",
              defaultMessage: "Sent back to the author"
            })
      );
      if (emailSent) {
        toast.success(intl.formatMessage({
          id: "postcontent-email-confirmation-sent",
          description: "Email confirmation sent!",
          defaultMessage: "Email confirmation sent!"
        }));
      }
      onReviewed?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setReviewing(false);
    }
  };

  const canReview = approve && isAdmin && draft?.status === "web_ready";
  const step = draft ? workflowStep(draft.status) : 0;

  return <>
    <div className="relative p-3 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-lg drop-shadow-lg hover:drop-shadow-xl dark:hover:brightness-125">
      {/* Floating Engagement Sidebar - Top left side of card */}
      {heartCount > 0 && (
        <div className="absolute -left-16 top-20 z-50 hidden lg:flex flex-col items-center bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col items-center gap-2">
            <FontAwesomeIcon 
              icon={faHeart} 
              className="h-5 w-5 text-red-500 animate-pulse" 
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {heartCount}
            </span>
          </div>
        </div>
      )}
      {/* Workflow status - only for the author and Swapnil */}
      {draft && (
        <div className="relative mb-6 p-4 bg-gradient-to-br from-fun-blue-50 to-caribbean-green-50 dark:from-fun-blue-600 dark:to-fun-blue-700 rounded-xl border border-fun-blue-100 dark:border-fun-blue-400 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${STATUS_BADGE_CLASSES[draft.status]}`}>
              {STATUS_LABELS[draft.status]}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium shadow-sm ${
              isLive(post)
                ? 'bg-caribbean-green-500 text-white'
                : 'bg-hit-pink-500 text-white'
            }`}>
              {isLive(post) ? (
                <FormattedMessage
                  id="postcontent-published-status"
                  description="● Published"
                  defaultMessage="● Published"
                />
              ) : (
                <FormattedMessage
                  id="postcontent-draft-status"
                  description="● Draft"
                  defaultMessage="● Draft"
                />
              )}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-fun-blue-600 dark:text-caribbean-green-300 mb-2">
              <span>
                <FormattedMessage
                  id="postcontent-workflow-progress"
                  description="Workflow Progress"
                  defaultMessage="Workflow Progress"
                />
              </span>
              <span className="font-medium">
                <FormattedMessage
                  id="postcontent-workflow-steps"
                  description="How many workflow steps are complete, e.g. 2/4 Complete"
                  defaultMessage="{step}/{total} Complete"
                  values={{ step, total: WORKFLOW_STEPS.length }}
                />
              </span>
            </div>
            <div className="w-full bg-fun-blue-100 dark:bg-fun-blue-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-fun-blue-500 to-caribbean-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / WORKFLOW_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Review actions - Swapnil only, for posts waiting for approval */}
          {canReview && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => review("approve")}
                disabled={reviewing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="postcontent-approve-button"
                    description="Approve"
                    defaultMessage="Approve"
                  />
                </span>
              </button>
              <button
                onClick={() => review("request_changes")}
                disabled={reviewing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="postcontent-request-changes-button"
                    description="Button to send a post back to its author"
                    defaultMessage="Request changes"
                  />
                </span>
              </button>
            </div>
          )}

          {draft.status === "changes_requested" && draft.review_note && (
            <p className="mt-3 text-sm text-red-700 dark:text-red-300">
              {draft.review_note}
            </p>
          )}
        </div>
      )}

      {/* Byline: author, post facts and the reader's actions. Colours come
          from the theme variables (.byline-* in globals.css): the theme class
          is `theme-<color>-<mode>`, never `dark`, so `dark:` utilities don't apply. */}
      <header className="flex flex-col gap-4 pb-4 mb-2 border-b byline-rule lg:flex-row lg:items-center lg:justify-between">

        {/* Author */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/${post?.username}`}
            className="byline-focus shrink-0 rounded-full"
            aria-label={post?.username}
          >
            {post?.photo_url ? (
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-fun-blue-200 ring-offset-2 ring-offset-blog-white">
                <Image
                  width={96}
                  height={96}
                  src={post?.photo_url}
                  alt=""
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-fun-blue-400 flex items-center justify-center text-white font-bold text-lg ring-2 ring-fun-blue-200 ring-offset-2 ring-offset-blog-white">
                {post?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="flex flex-col min-w-0">
            <Link
              href={`/${post?.username}`}
              className="byline-focus self-start max-w-full truncate rounded font-semibold text-base sm:text-lg leading-tight text-blog-black hover:underline underline-offset-4 decoration-2 decoration-hit-pink-500"
            >
              {post?.username}
            </Link>

            <p className="byline-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm mt-1">
              <span>{dateFormat}</span>
              <span className="byline-dot inline-block" aria-hidden="true" />
              <span className="whitespace-nowrap">
                {minutesToRead} <FormattedMessage
                  id="postcontent-min-read"
                  description="min read"
                  defaultMessage="min read"
                />
              </span>
              <span className="byline-dot hidden sm:inline-block" aria-hidden="true" />
              <span className="hidden sm:inline whitespace-nowrap">
                {wordCount} <FormattedMessage
                  id="postcontent-words"
                  description="words"
                  defaultMessage="words"
                />
              </span>
              {(post?.view_count ?? 0) > 0 && (
                <>
                  <span className="byline-dot inline-block" aria-hidden="true" />
                  <span className="whitespace-nowrap">
                    <ViewCount count={post?.view_count} />
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Actions - a single row at every width: heart and edit on the
            left, sharing on the right */}
        <div className="flex flex-nowrap items-center justify-between gap-2 lg:justify-end lg:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {/* Liking needs a signed-in (non-guest) account */}
            {canReact ? (
              <HeartButton
                post={post}
                userId={profile.id}
                count={heartCount}
                onCountChange={setHeartCount}
              />
            ) : (
              <BasicTooltip title={intl.formatMessage({
                id: "postcontent-heart-signin",
                description: "Tooltip on the heart button for readers who are not signed in",
                defaultMessage: "Sign in to heart this post"
              })} placement="bottom">
                <Link href="/enter" className={heartPillClass()}>
                  <FontAwesomeIcon icon={faHeartOutline} className="h-4 w-4 text-hit-pink-600" />
                  <span>
                    <FormattedMessage
                      id="heart-button-heart"
                      description="text on heart button to heart"
                      defaultMessage="Heart"
                    />
                  </span>
                  <HeartCount count={heartCount} />
                </Link>
              </BasicTooltip>
            )}

            {isAuthor && (
              <Link
                href={`/admin/${post?.slug}`}
                className="byline-action byline-ghost byline-focus inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium"
                aria-label={intl.formatMessage({
                  id: "postcontent-edit-post",
                  description: "Accessible name of the edit button on a post",
                  defaultMessage: "Edit post"
                })}
              >
                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                <span className="hidden min-[380px]:inline" aria-hidden="true">
                  <FormattedMessage
                    id="postcontent-edit"
                    description="Edit button on a post"
                    defaultMessage="Edit"
                  />
                </span>
              </Link>
            )}
          </div>

          <div
            className="flex shrink-0 items-center gap-0.5 border-l byline-rule pl-1.5 sm:border-l-0 sm:pl-0"
            role="group"
            aria-label={intl.formatMessage({
              id: "postcontent-share-group",
              description: "Accessible name of the share buttons",
              defaultMessage: "Share this post"
            })}
          >
            <span className="byline-muted text-xs font-medium mr-1.5 hidden sm:inline" aria-hidden="true">
              <FormattedMessage
                id="postcontent-share-label"
                description="Share:"
                defaultMessage="Share:"
              />
            </span>
            {[
              {
                icon: faLinkedin,
                href: `https://www.linkedin.com/sharing/share-offsite/?url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`,
                label: intl.formatMessage({
                  id: "postcontent-share-linkedin",
                  description: "Share on LinkedIn",
                  defaultMessage: "Share on LinkedIn"
                }),
              },
              {
                icon: faXTwitter,
                href: `https://twitter.com/intent/tweet?text=Hi%2C%20checkout%20this%20post%20&url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}&via=swapnil_sri&hashtags=reactjs,nextjs,blog`,
                label: intl.formatMessage({
                  id: "postcontent-share-twitter",
                  description: "Share on Twitter",
                  defaultMessage: "Share on Twitter"
                }),
              },
              {
                icon: faFacebook,
                href: `https://facebook.com/sharer/sharer.php?u=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`,
                label: intl.formatMessage({
                  id: "postcontent-share-facebook",
                  description: "Share on Facebook",
                  defaultMessage: "Share on Facebook"
                }),
              },
            ].map(({ icon, href, label }) => (
              <BasicTooltip key={label} title={label} placement="bottom">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="byline-ghost byline-focus w-9 h-9 flex items-center justify-center rounded-full"
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </a>
              </BasicTooltip>
            ))}
          </div>
        </div>
      </header>

      {/* ARTICLE SECTION */}
      <div className="bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white p-3 flex flex-col gap-5">
        {/* TITLE SECTION */}
        <div className="lg:text-3xl text-xl font-extrabold self-center">
          {post?.title}
        </div>

        {/* Topics - link to every article with the tag */}
        <TagList
          tags={post?.tags}
          linkTags={isLive(post) && !approve}
          className="justify-center"
        />

        {/* Audio Player // Only show if the URL exists */}
        <div>
          {audioUrl ? (
            <>
              <AudioPlayer audioSource={audioUrl} />
            </>
          ) : (
            <></>
          )}
        </div>

        {/* POST SECTION */}
        <div
          className="post-content lg:text-xl"
          dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post?.content) }}
        ></div>
      </div>

      <Video videoSrc={post?.videoLink} />
    </div>
  </>;
}
