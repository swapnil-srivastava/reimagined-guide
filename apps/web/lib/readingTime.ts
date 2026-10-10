import { stripHtml } from "./postWorkflow";

const WORDS_PER_MINUTE = 200;

/** Word count and "min read" for post HTML; tags are stripped before counting */
export function readingStats(html: string | null | undefined): {
  wordCount: number;
  minutesToRead: number;
} {
  const text = stripHtml(html);
  const wordCount = text ? text.split(" ").length : 0;
  return {
    wordCount,
    minutesToRead: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  };
}
