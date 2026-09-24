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
  onCountChange,
}: {
  post: POST;
  userId: string;
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
      <div className="flex items-center">
        <button
         className="bg-hit-pink-500 dark:text-blog-black px-3 py-2 mx-1
                          rounded-3xl flex items-center justify-center
                          transition-filter duration-500 hover:filter hover:brightness-125
                          focus:outline-none focus:ring-2
                          focus:ring-fun-blue-400
                          focus:ring-offset-2
                          font-semibold disabled:opacity-60"
          aria-pressed={hearted}
          disabled={busy}
          onClick={toggleHeart}
        >
          <FontAwesomeIcon icon={hearted ? faHeart : faHeartOutline} />
          <div className="ml-2 text-sm md:text-md font-light">
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
          </div>
        </button>
      </div>
    </BasicTooltip>
  );
}
