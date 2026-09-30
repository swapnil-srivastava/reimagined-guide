import { useEffect, useId, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type { Editor } from "@tiptap/react";

import { VIDEO_PROVIDER_NAMES, defaultThumbnail, parseVideoUrl } from "../../lib/videoEmbed";
import type { VideoMeta } from "../../lib/tiptap/VideoEmbed";
import { fetchVideoMeta } from "../../services/video.service";

/**
 * Panel under the editor toolbar for inserting a video at the cursor.
 * Pasting a link straight into the post does the same thing; this is the
 * discoverable way in.
 */
export default function VideoEmbedPopover({
  editor,
  onClose,
}: {
  editor: Editor;
  /** Called after inserting (inserted = true) or cancelling */
  onClose: (inserted: boolean) => void;
}) {
  const intl = useIntl();
  const headingId = useId();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const video = parseVideoUrl(url);
  const invalid = url.trim() !== "" && !video;

  useEffect(() => inputRef.current?.focus(), []);

  // Look up the title and thumbnail for the preview once typing settles
  const pageUrl = video?.pageUrl;
  useEffect(() => {
    setMeta(null);
    if (!pageUrl) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchVideoMeta(pageUrl).then((result) => {
        if (cancelled) return;
        setMeta(result);
        setLoading(false);
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setLoading(false);
    };
  }, [pageUrl]);

  const insert = () => {
    if (!video) {
      inputRef.current?.focus();
      return;
    }
    editor
      .chain()
      .focus()
      .setVideoEmbed({ url, title: meta?.title, thumbnail: meta?.thumbnail })
      .run();
    onClose(true);
  };

  const thumbnail = meta?.thumbnail ?? (video ? defaultThumbnail(video) : undefined);

  return (
    <form
      role="group"
      aria-labelledby={headingId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        insert();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose(false);
        }
      }}
      className="font-poppins flex flex-col gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-md"
    >
      <p id={headingId} className="font-medium">
        <FormattedMessage
          id="video-embed-heading"
          description="Heading of the panel for adding a video to a post"
          defaultMessage="Add a Video"
        />
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm">
          <FormattedMessage
            id="video-embed-label"
            description="Label of the video link field"
            defaultMessage="Video link"
          />
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="url"
          inputMode="url"
          name="video-url"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
          placeholder="https://www.youtube.com/watch?v=…"
          className="min-h-[2.75rem] px-3 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] placeholder:text-[color-mix(in_srgb,var(--text-primary)_60%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        <p
          id={hintId}
          aria-live="polite"
          className={
            invalid
              ? "text-sm text-red-700 dark:text-red-300"
              : "text-sm text-[color-mix(in_srgb,var(--text-primary)_80%,transparent)]"
          }
        >
          {invalid ? (
            <FormattedMessage
              id="video-embed-invalid"
              description="Error when the pasted link is not from a supported video site"
              defaultMessage="This link isn't from YouTube, Vimeo, Loom or Dailymotion. Paste the link to the video's page."
            />
          ) : (
            <FormattedMessage
              id="video-embed-hint"
              description="Hint under the video link field"
              defaultMessage="Paste a link from YouTube, Vimeo, Loom or Dailymotion. Tip: pasting a link on its own line in the post works too."
            />
          )}
        </p>
      </div>

      {video && (
        <div className="flex items-center gap-3" aria-live="polite">
          <div className="w-28 shrink-0 aspect-video rounded overflow-hidden bg-[var(--color-primary-deep)] flex items-center justify-center">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={thumbnail}
                src={thumbnail}
                alt=""
                width={112}
                height={63}
                className="w-full h-full object-cover"
                onError={(event) => (event.currentTarget.style.visibility = "hidden")}
              />
            ) : (
              <span translate="no" className="text-xs text-[var(--text-on-primary)]">
                {VIDEO_PROVIDER_NAMES[video.provider]}
              </span>
            )}
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-medium truncate">
              {meta?.title ??
                (loading
                  ? intl.formatMessage({
                      id: "video-embed-loading",
                      description: "Shown while the video's title is being looked up",
                      defaultMessage: "Looking up the video…",
                    })
                  : intl.formatMessage(
                      {
                        id: "video-embed-untitled",
                        description: "Preview text when the video title could not be found",
                        defaultMessage: "{provider} video",
                      },
                      { provider: VIDEO_PROVIDER_NAMES[video.provider] }
                    ))}
            </p>
            <p translate="no" className="text-[color-mix(in_srgb,var(--text-primary)_80%,transparent)]">
              {VIDEO_PROVIDER_NAMES[video.provider]}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onClose(false)}
          className="min-h-[2.75rem] px-4 rounded-lg border border-[var(--border-subtle)] hover:bg-[color-mix(in_srgb,var(--text-primary)_8%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <FormattedMessage
            id="video-embed-cancel"
            description="Button closing the add video panel"
            defaultMessage="Cancel"
          />
        </button>
        <button
          type="submit"
          aria-disabled={!video || undefined}
          className="min-h-[2.75rem] px-4 rounded-lg bg-hit-pink-500 text-blog-black font-medium hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] aria-disabled:opacity-60 aria-disabled:cursor-not-allowed"
        >
          <FormattedMessage
            id="video-embed-insert"
            description="Button inserting the video into the post"
            defaultMessage="Insert Video"
          />
        </button>
      </div>
    </form>
  );
}
