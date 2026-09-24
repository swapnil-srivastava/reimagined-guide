import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faGlobe,
  faRotateLeft,
  faEyeSlash,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../supa-client";
import { POST_DRAFT_WITH_POST, POST_STATUS } from "../database.types";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  WORKFLOW_STEPS,
  isLive,
  workflowStep,
} from "../lib/postWorkflow";
import {
  reviewPost,
  submitPostForApproval,
} from "../services/email.service";

interface PostWorkflowBarProps {
  draft: POST_DRAFT_WITH_POST;
  /** True while the editor has changes that are not saved yet */
  dirty: boolean;
  onChange: (draft: POST_DRAFT_WITH_POST) => void;
}

// Author controls for Draft → Copy Ready → Web Ready. Saving any edit moves
// the post back to Draft (enforced by the database), so the buttons only
// work on saved content.
export default function PostWorkflowBar({
  draft,
  dirty,
  onChange,
}: PostWorkflowBarProps) {
  const intl = useIntl();
  const [busy, setBusy] = useState(false);
  const status = draft.status;
  const step = workflowStep(status);
  const live = isLive(draft.posts);

  async function setStatus(next: POST_STATUS) {
    const { data, error } = await supaClient
      .from("post_drafts")
      .update({ status: next })
      .eq("post_id", draft.post_id)
      .select("*, posts(*)")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not update the status.");
    }
    onChange(data as POST_DRAFT_WITH_POST);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const markCopyReady = () =>
    run(async () => {
      await setStatus("copy_ready");
      toast.success(
        intl.formatMessage({
          id: "workflow-copy-ready-success",
          description: "Toast after marking a post copy ready",
          defaultMessage: "Marked as Copy Ready",
        })
      );
    });

  const markWebReady = () =>
    run(async () => {
      await setStatus("web_ready");
      const { emailSent } = await submitPostForApproval(draft.post_id);
      toast.success(
        emailSent
          ? intl.formatMessage({
              id: "workflow-submitted-success",
              description: "Toast after submitting a post for approval",
              defaultMessage: "Submitted! Swapnil has been emailed to approve it.",
            })
          : intl.formatMessage({
              id: "workflow-submitted-no-email",
              description: "Toast when the post was submitted but the email failed",
              defaultMessage: "Submitted for approval, but the notification email could not be sent.",
            })
      );
    });

  const backToDraft = () => run(() => setStatus("draft"));

  const unpublish = () => {
    if (
      !window.confirm(
        intl.formatMessage({
          id: "workflow-unpublish-confirm",
          description: "Confirm dialog before unpublishing",
          defaultMessage:
            "Take this post off the website? It will need a new approval to go live again.",
        })
      )
    ) {
      return;
    }
    run(async () => {
      await reviewPost(draft.post_id, "unpublish");
      const { data } = await supaClient
        .from("post_drafts")
        .select("*, posts(*)")
        .eq("post_id", draft.post_id)
        .single();
      if (data) onChange(data as POST_DRAFT_WITH_POST);
      toast.success("Post unpublished");
    });
  };

  const canCopyReady =
    !dirty && !busy && (status === "draft" || status === "changes_requested");
  const canWebReady = !dirty && !busy && status === "copy_ready";
  const canWithdraw = !busy && (status === "copy_ready" || status === "web_ready");

  const buttonBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section
      aria-label="Publishing workflow"
      className="lg:mx-36 p-4 rounded-xl border border-fun-blue-100 dark:border-fun-blue-400 bg-gradient-to-br from-fun-blue-50 to-caribbean-green-50 dark:from-fun-blue-600 dark:to-fun-blue-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs">
          {live ? (
            <>
              <FormattedMessage
                id="workflow-live-since"
                description="Shows that an approved version is live"
                defaultMessage="Live version approved {date}"
                values={{
                  date: moment(
                    draft.posts?.updated_at ?? draft.posts?.published_at
                  ).format("DD MMM YYYY"),
                }}
              />{" "}
              <Link
                href={`/${draft.posts?.username}/${draft.posts?.slug}`}
                className="underline"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
              </Link>
            </>
          ) : (
            <FormattedMessage
              id="workflow-not-live"
              description="Shows that the post is not on the website"
              defaultMessage="Not on the website yet"
            />
          )}
        </span>
      </div>

      {/* Stepper */}
      <ol className="mt-4 grid grid-cols-4 gap-2 text-[11px] sm:text-xs">
        {WORKFLOW_STEPS.map((s, i) => (
          <li key={s} className="flex flex-col gap-1">
            <div
              className={`h-2 rounded-full ${
                i < step
                  ? "bg-gradient-to-r from-fun-blue-500 to-caribbean-green-500"
                  : "bg-fun-blue-100 dark:bg-fun-blue-800"
              }`}
            />
            <span className={i < step ? "font-semibold" : "opacity-70"}>
              {STATUS_LABELS[s]}
            </span>
          </li>
        ))}
      </ol>

      {status === "changes_requested" && draft.review_note && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
          <strong>
            <FormattedMessage
              id="workflow-review-note"
              description="Label for the reviewer's note"
              defaultMessage="Changes requested:"
            />
          </strong>{" "}
          {draft.review_note}
        </div>
      )}

      {dirty && (
        <p className="mt-3 text-xs text-orange-700 dark:text-orange-300">
          <FormattedMessage
            id="workflow-save-first"
            description="Hint to save before moving the workflow forward"
            defaultMessage="Save your changes before moving to the next stage. Saving puts the post back to Draft."
          />
        </p>
      )}

      {status === "web_ready" && (
        <p className="mt-3 text-xs">
          <FormattedMessage
            id="workflow-awaiting"
            description="Explains the post waits for approval"
            defaultMessage="Waiting for Swapnil's approval. Editing and saving will withdraw it."
          />
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={markCopyReady}
          disabled={!canCopyReady}
          className={`${buttonBase} bg-orange-500 hover:bg-orange-600`}
        >
          <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
          <FormattedMessage
            id="workflow-mark-copy-ready"
            description="Button to mark a post copy ready"
            defaultMessage="Mark Copy Ready"
          />
        </button>
        <button
          type="button"
          onClick={markWebReady}
          disabled={!canWebReady}
          className={`${buttonBase} bg-emerald-500 hover:bg-emerald-600`}
        >
          <FontAwesomeIcon icon={faGlobe} className="h-3 w-3" />
          <FormattedMessage
            id="workflow-mark-web-ready"
            description="Button to mark a post web ready and submit it"
            defaultMessage="Mark Web Ready & submit for approval"
          />
        </button>
        {canWithdraw && (
          <button
            type="button"
            onClick={backToDraft}
            className={`${buttonBase} bg-slate-500 hover:bg-slate-600`}
          >
            <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
            <FormattedMessage
              id="workflow-back-to-draft"
              description="Button to move a post back to draft"
              defaultMessage="Back to Draft"
            />
          </button>
        )}
        {live && (
          <button
            type="button"
            onClick={unpublish}
            disabled={busy}
            className={`${buttonBase} bg-hit-pink-500 hover:brightness-110 text-blog-black`}
          >
            <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3" />
            <FormattedMessage
              id="workflow-unpublish"
              description="Button to take a live post off the website"
              defaultMessage="Unpublish"
            />
          </button>
        )}
      </div>
    </section>
  );
}
