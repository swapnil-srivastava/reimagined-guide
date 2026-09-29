import Link from "next/link";
import { useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import type { TAG } from "../database.types";

const BASE =
  "font-poppins touch-manipulation relative z-10 inline-flex items-center gap-1 max-w-full rounded-full border font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2";

// Small chips stay compact but get a 44px tall hit area
const SIZES = {
  sm: "min-h-[1.75rem] px-2.5 text-xs after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
  md: "min-h-[2.75rem] px-4 text-sm",
};

const UNSELECTED =
  "border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)] hover:border-[var(--color-primary)]";
// Selected chips differ by fill, a strong border and a check mark, not color alone
const SELECTED =
  "border-[var(--text-primary)] bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:brightness-110";

type TagChipProps = {
  tag: TAG;
  size?: keyof typeof SIZES;
  /** Number of posts, shown after the name */
  count?: number;
} & (
  | { /** Toggle button for filters */ selected: boolean; onToggle: (slug: string) => void; href?: never }
  | { /** Link to a filtered list */ href: string; selected?: never; onToggle?: never }
  | { /** Plain label, e.g. for unpublished drafts */ selected?: never; onToggle?: never; href?: never }
);

/**
 * A topic tag. Renders a toggle button (`aria-pressed`) when given `onToggle`,
 * a link when given `href`, and a plain label otherwise.
 */
export default function TagChip({ tag, size = "sm", count, selected, onToggle, href }: TagChipProps) {
  const intl = useIntl();

  const label = (
    <>
      {selected ? (
        <FontAwesomeIcon icon={faCheck} aria-hidden="true" className="h-3 w-3" />
      ) : (
        <span aria-hidden="true">#</span>
      )}
      <span className="truncate" translate="no">{tag.name}</span>
      {count !== undefined && (
        <>
          {/* A compact badge on screen; the full phrase for screen readers */}
          <span
            aria-hidden="true"
            className="ml-1 min-w-[1.375rem] px-1.5 rounded-full text-xs text-center tabular-nums font-normal bg-[color-mix(in_srgb,currentColor_14%,transparent)]"
          >
            {count}
          </span>
          <span className="sr-only">
            {", "}
            {intl.formatMessage(
              {
                id: "tag-chip-post-count",
                description: "Number of articles with a tag, after the tag name",
                defaultMessage: "{count, plural, one {# article} other {# articles}}",
              },
              { count }
            )}
          </span>
        </>
      )}
    </>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle(tag.slug)}
        className={`${BASE} ${SIZES[size]} ${selected ? SELECTED : UNSELECTED}`}
      >
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={`${BASE} ${SIZES[size]} ${UNSELECTED}`}>
        {label}
      </Link>
    );
  }

  return <span className={`${BASE} ${SIZES[size]} ${UNSELECTED}`}>{label}</span>;
}

/** A row of tags under a post card or title */
export function TagList({
  tags,
  selected = [],
  onToggle,
  linkTags = true,
  className = "",
}: {
  tags?: TAG[] | null;
  selected?: string[];
  /** Toggle the tag in the current filter instead of linking to it */
  onToggle?: (slug: string) => void;
  /** Link to the tag page; otherwise plain labels */
  linkTags?: boolean;
  className?: string;
}) {
  const intl = useIntl();
  if (!tags?.length) return null;

  return (
    <ul
      className={`font-poppins flex flex-wrap gap-1.5 ${className}`}
      aria-label={intl.formatMessage({
        id: "tag-list-label",
        description: "Accessible name of the list of tags on a post",
        defaultMessage: "Topics",
      })}
    >
      {tags.map((tag) => (
        <li key={tag.slug} className="max-w-full">
          {onToggle ? (
            <TagChip tag={tag} selected={selected.includes(tag.slug)} onToggle={onToggle} />
          ) : linkTags ? (
            <TagChip tag={tag} href={tagHref(tag.slug)} />
          ) : (
            <TagChip tag={tag} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** Page listing every live post with this tag */
export function tagHref(slug: string): string {
  return `/tags/${encodeURIComponent(slug)}`;
}
