import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";

import TagChip from "./TagChip";
import type { TAG_COUNT } from "../database.types";
import { parseTagQuery } from "../lib/tags";

/**
 * Selected tag slugs, kept in the URL as `?tags=java,frontend` so filtered
 * lists can be shared and the back button works. Uses shallow routing: the
 * page loads the matching posts itself.
 */
export function useTagFilter(): [string[], (slugs: string[]) => void] {
  const router = useRouter();
  const tagsParam = router.query.tags;
  const selected = useMemo(() => parseTagQuery(tagsParam), [tagsParam]);

  const setSelected = useCallback(
    (slugs: string[]) => {
      const { tags: _omit, ...rest } = router.query;
      const unique = Array.from(new Set(slugs)).sort();
      router.push(
        {
          pathname: router.pathname,
          query: unique.length ? { ...rest, tags: unique.join(",") } : rest,
        },
        undefined,
        { shallow: true, scroll: false }
      );
    },
    [router]
  );

  return [selected, setSelected];
}

/** Adds the tag when it is not selected, removes it otherwise */
export function toggleTag(selected: string[], slug: string): string[] {
  return selected.includes(slug)
    ? selected.filter((s) => s !== slug)
    : [...selected, slug];
}

/**
 * Chips for filtering a post list by topic. Selecting several tags shows
 * posts that have all of them; clearing the selection shows every post.
 */
export default function TagFilterBar({
  tags,
  selected,
  onChange,
  resultCount,
  loading = false,
}: {
  tags: TAG_COUNT[];
  selected: string[];
  onChange: (slugs: string[]) => void;
  /** Number of posts shown; announced to screen readers after a change */
  resultCount?: number;
  loading?: boolean;
}) {
  const intl = useIntl();

  // Selected tags first, including ones from a shared link that no post uses
  const ordered = useMemo(() => {
    const bySlug = new Map(tags.map((tag) => [tag.slug, tag]));
    const chosen = selected.map(
      (slug) => bySlug.get(slug) ?? { slug, name: slug, post_count: 0 }
    );
    const others = tags.filter((tag) => !selected.includes(tag.slug));
    return [...chosen, ...others];
  }, [tags, selected]);

  if (ordered.length === 0) return null;

  const groupLabel = intl.formatMessage({
    id: "tag-filter-label",
    description: "Label of the row of topic chips that filter the articles",
    defaultMessage: "Filter articles by topic",
  });

  return (
    <div className="font-poppins w-full max-w-5xl flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p className="text-sm font-medium text-[var(--text-muted)]" aria-hidden="true">
          <FormattedMessage
            id="tag-filter-heading"
            description="Short heading above the topic chips"
            defaultMessage="Topics"
          />
        </p>
        {selected.length > 1 && (
          <p className="text-xs text-[var(--text-muted)]">
            <FormattedMessage
              id="tag-filter-match-all-hint"
              description="Explains that selecting several topics shows articles having all of them"
              defaultMessage="Showing articles tagged with all selected topics"
            />
          </p>
        )}
      </div>

      <div
        role="group"
        aria-label={groupLabel}
        aria-busy={loading || undefined}
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible [scrollbar-width:thin]"
      >
        {ordered.map((tag) => (
          <span key={tag.slug} className="shrink-0">
            <TagChip
              tag={tag}
              size="md"
              count={tag.post_count || undefined}
              selected={selected.includes(tag.slug)}
              onToggle={(slug) => onChange(toggleTag(selected, slug))}
            />
          </span>
        ))}

        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-poppins shrink-0 min-h-[2.25rem] px-3.5 rounded-full text-sm font-medium underline underline-offset-4 text-[var(--text-primary)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <FormattedMessage
              id="tag-filter-clear"
              description="Button that removes every selected topic filter"
              defaultMessage="Clear filters"
            />
          </button>
        )}
      </div>

      {/* Announces the result of a filter change */}
      <p role="status" className="sr-only">
        {!loading && resultCount !== undefined && selected.length > 0
          ? intl.formatMessage(
              {
                id: "tag-filter-result-count",
                description: "Screen reader announcement after filtering articles by topic",
                defaultMessage:
                  "{count, plural, =0 {No articles match these topics} one {Showing # article} other {Showing # articles}}",
              },
              { count: resultCount }
            )
          : ""}
      </p>
    </div>
  );
}
