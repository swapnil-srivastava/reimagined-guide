import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import BasicTooltip from "./Tooltip";
import { POST } from "../database.types";

import { supaClient } from "../supa-client";

// Allows a signed-in reader to heart a post once. The reader only adds or
// removes their own row in `emotions`; a database trigger keeps the counts
// on `posts` up to date.
export default function Heart({
  post,
  userId,
  count,
  onCountChange,
}: {
  post: POST;
  userId: string;
  /** Current heart count, shown inside the button */
  count?: number;
  onCountChange?: (heartCount: number) => void;
}) {
  const intl = useIntl();
  const [hearted, setHearted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!post?.id || !userId) return;
    supaClient
      .from("emotions")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", userId)
      .eq("emotion_type", "heart")
      .then(({ data }) => setHearted((data?.length ?? 0) > 0));
  }, [post?.id, userId]);

  async function toggleHeart() {
    if (busy) return;
    setBusy(true);

    const { error } = hearted
      ? await supaClient
          .from("emotions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId)
          .eq("emotion_type", "heart")
      : await supaClient
          .from("emotions")
          .insert({ post_id: post.id, user_id: userId, emotion_type: "heart" });

    // 23505: already hearted (e.g. from another tab)
    if (error && error.code !== "23505") {
      toast.error(error.message);
      setBusy(false);
      return;
    }

    setHearted(!hearted);

    const { count } = await supaClient
      .from("emotions")
      .select("id", { count: "exact", head: true })
      .eq("post_id", post.id)
      .eq("emotion_type", "heart");

    onCountChange?.(count ?? 0);
    setBusy(false);
  }

  return (
    <BasicTooltip title={intl.formatMessage({
      id: "heartbutton-like-post-tooltip",
      description: "Do you like the post?",
      defaultMessage: "Do you like the post?"
    })} placement="bottom">
      <button
        className={heartPillClass(hearted)}
        aria-pressed={hearted}
        disabled={busy}
        onClick={toggleHeart}
      >
        <FontAwesomeIcon
          icon={hearted ? faHeart : faHeartOutline}
          className={hearted ? "h-4 w-4" : "h-4 w-4 text-hit-pink-600"}
        />
        <span className="sr-only">
          {hearted ? (
            <FormattedMessage id="heart-button-hearted"
              description="text on heart button when the reader already hearted the post"
              defaultMessage="Hearted"
              />
          ) : (
            <FormattedMessage id="heart-button-heart"
              description="text on heart button to heart" // Description should be a string literal
              defaultMessage="Heart" // Message should be a string literal
              />
          )}
        </span>
        <HeartCount count={count} />
      </button>
    </BasicTooltip>
  );
}

// Shared with the signed-out heart link in PostContent so both look the same
export function heartPillClass(hearted = false) {
  return `byline-action byline-focus inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150 disabled:opacity-60 ${
    hearted
      ? "bg-hit-pink-500 text-neutral-900 hover:bg-hit-pink-400"
      : "bg-blog-white text-blog-black"
  }`;
}

export function HeartCount({ count }: { count?: number }) {
  if (!count) return null;
  return <span className="tabular-nums">{count}</span>;
}
