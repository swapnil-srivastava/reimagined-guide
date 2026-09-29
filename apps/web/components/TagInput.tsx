import { useEffect, useId, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../supa-client";
import type { TAG } from "../database.types";
import { MAX_TAGS, MAX_TAG_LENGTH, cleanTagName, tagSlug } from "../lib/tags";

/**
 * Tag editor for a post draft. Suggests existing tags and lets the author
 * type new ones; new tags are created when the admin approves the post.
 */
export default function TagInput({
  value,
  onChange,
}: {
  /** Tag names, as the author typed them */
  value: string[];
  onChange: (names: string[]) => void;
}) {
  const intl = useIntl();
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  // Screen reader confirmation after adding or removing a tag
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [known, setKnown] = useState<TAG[]>([]);

  useEffect(() => {
    supaClient
      .from("tags")
      .select("slug, name")
      .order("name")
      .then(({ data }) => setKnown(data ?? []));
  }, []);

  const full = value.length >= MAX_TAGS;

  // Adds typed names, skipping duplicates and anything past the limit
  const add = (...raws: string[]) => {
    const next = [...value];
    let invalid = false;
    let overLimit = false;

    for (const raw of raws) {
      const typed = cleanTagName(raw);
      if (!typed) continue;

      const slug = tagSlug(typed);
      if (!slug) {
        invalid = true;
        continue;
      }
      if (next.some((name) => tagSlug(name) === slug)) continue;
      if (next.length >= MAX_TAGS) {
        overLimit = true;
        continue;
      }

      // Reuse the spelling of an existing tag ("java" becomes "Java")
      const existing = known.find((tag) => tag.slug === slug);
      next.push(existing ? existing.name : typed);
    }

    if (next.length !== value.length) {
      onChange(next);
      setAnnouncement(
        intl.formatMessage(
          {
            id: "tag-input-added",
            description: "Screen reader confirmation after tags are added",
            defaultMessage: "Added {names}",
          },
          { names: next.slice(value.length).join(", ") }
        )
      );
    }
    setText("");
    setError(
      invalid
        ? intl.formatMessage({
            id: "tag-input-error-no-letters",
            description: "Error when a typed tag has no letters or numbers",
            defaultMessage: "Tags need at least one letter or number.",
          })
        : overLimit
          ? intl.formatMessage(
              {
                id: "tag-input-error-too-many",
                description: "Error when the author types more tags than allowed",
                defaultMessage: "Only {max} tags fit. Remove one to add another.",
              },
              { max: MAX_TAGS }
            )
          : ""
    );
  };

  const remove = (name: string) => {
    onChange(value.filter((n) => n !== name));
    setError("");
    setAnnouncement(
      intl.formatMessage(
        {
          id: "tag-input-removed",
          description: "Screen reader confirmation after a tag is removed",
          defaultMessage: "Removed {name}",
        },
        { name }
      )
    );
    // The remove button disappears; keep keyboard focus in the field
    inputRef.current?.focus();
  };

  const suggestions = known.filter(
    (tag) => !value.some((name) => tagSlug(name) === tag.slug)
  );

  return (
    <div className="font-poppins flex flex-col gap-2">
      <label htmlFor={inputId} className="font-medium">
        <FormattedMessage
          id="tag-input-label"
          description="Label of the field for a post's topic tags"
          defaultMessage="Tags"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
        {value.length > 0 && (
          <ul className="contents">
            {value.map((name) => (
              <li
                key={name}
                className="inline-flex items-center gap-1 min-h-[2rem] pl-3 pr-1 rounded-full text-sm font-medium bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]"
              >
                <span>
                  <span aria-hidden="true" className="opacity-70">#</span>
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(name)}
                  aria-label={intl.formatMessage(
                    {
                      id: "tag-input-remove",
                      description: "Accessible name of the button removing a tag from the post",
                      defaultMessage: "Remove tag {name}",
                    },
                    { name }
                  )}
                  className="relative w-7 h-7 rounded-full flex items-center justify-center after:absolute after:-inset-2 after:content-[''] hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          list={listId}
          value={text}
          // Stays focusable when full so the hint explaining the limit is still read
          readOnly={full}
          aria-disabled={full || undefined}
          maxLength={MAX_TAG_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          placeholder={
            full
              ? ""
              : intl.formatMessage({
                  id: "tag-input-placeholder",
                  description: "Placeholder of the tag field",
                  defaultMessage: "e.g. Java, Frontend",
                })
          }
          onChange={(event) => {
            const next = event.target.value;
            // Typing or pasting a comma adds the tag before it
            if (next.includes(",")) {
              const parts = next.split(",");
              add(...parts.slice(0, -1));
              setText(parts[parts.length - 1]);
            } else {
              setText(next);
              setError("");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(text);
            } else if (event.key === "Backspace" && !text && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => text.trim() && add(text)}
          className="font-poppins flex-1 min-w-[10rem] min-h-[2.75rem] px-2 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none aria-disabled:cursor-not-allowed"
        />
        <datalist id={listId}>
          {suggestions.map((tag) => (
            <option key={tag.slug} value={tag.name} />
          ))}
        </datalist>
      </div>

      <p id={hintId} className="text-sm text-[var(--text-muted)]">
        {full ? (
          <FormattedMessage
            id="tag-input-full"
            description="Hint when the post already has the maximum number of tags"
            defaultMessage="A post can have up to {max} tags. Remove one to add another."
            values={{ max: MAX_TAGS }}
          />
        ) : (
          <FormattedMessage
            id="tag-input-hint"
            description="Hint below the tag field"
            defaultMessage="Press Enter or type a comma to add a tag. Up to {max} tags; new tags go live when the post is approved."
            values={{ max: MAX_TAGS }}
          />
        )}
      </p>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
