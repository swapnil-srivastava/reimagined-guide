import type { POST, POST_DRAFT_WITH_POST, POST_STATUS } from "../database.types";

// Editorial workflow shared by the author dashboard, the editor, the approval
// queue and the post page. The database enforces the transitions
// (see supabase/migrations/20260924000001_post_publishing_workflow.sql).

export const WORKFLOW_STEPS: POST_STATUS[] = [
  "draft",
  "copy_ready",
  "web_ready",
  "approved",
];

export const STATUS_LABELS: Record<POST_STATUS, string> = {
  draft: "Draft",
  copy_ready: "Copy Ready",
  web_ready: "Awaiting approval",
  approved: "Approved",
  changes_requested: "Changes requested",
};

export const STATUS_BADGE_CLASSES: Record<POST_STATUS, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-200",
  copy_ready:
    "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
  web_ready: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  approved:
    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  changes_requested:
    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
};

/** 1-based position in Draft → Copy Ready → Web Ready → Approved */
export function workflowStep(status: POST_STATUS): number {
  if (status === "changes_requested") return 1;
  return WORKFLOW_STEPS.indexOf(status) + 1;
}

export function isLive(post: Pick<POST, "published" | "approved"> | null | undefined): boolean {
  return Boolean(post?.published && post?.approved);
}

/** A post card for the author's dashboard: draft text plus its workflow state */
export type WorkflowPost = POST & {
  workflowStatus: POST_STATUS;
  isLive: boolean;
};

export function toWorkflowPost(draft: POST_DRAFT_WITH_POST): WorkflowPost {
  const live = draft.posts;
  return {
    ...(live as POST),
    id: draft.post_id,
    uid: draft.uid,
    title: draft.title,
    content: draft.content,
    updated_at: draft.updated_at,
    workflowStatus: draft.status,
    isLive: isLive(live),
  };
}

/** Plain text preview of post HTML, for cards and meta descriptions */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
