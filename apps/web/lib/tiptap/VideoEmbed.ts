import { Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import {
  VIDEO_PROVIDER_NAMES,
  defaultThumbnail,
  isAllowedThumbnail,
  parseVideoUrl,
} from "../videoEmbed";

export interface VideoMeta {
  title?: string;
  thumbnail?: string;
}

export interface VideoEmbedOptions {
  /** Looks up the title and thumbnail once, when a video is inserted */
  fetchMeta?: (url: string) => Promise<VideoMeta | null>;
}

export interface SetVideoEmbedOptions extends VideoMeta {
  /** Any supported video link: watch/share page or player URL */
  url: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** Inserts a video at the cursor. Does nothing for unsupported links. */
      setVideoEmbed: (options: SetVideoEmbedOptions) => ReturnType;
    };
  }
}

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

// Reads a saved embed back into the editor. The old YouTube extension's
// markup (div[data-youtube-video]) is accepted too.
function attrsFromElement(element: HTMLElement) {
  const iframe =
    element.tagName === "IFRAME" ? element : element.querySelector("iframe");
  const video = parseVideoUrl(iframe?.getAttribute("src"));
  if (!video) return false;
  const thumbnail = element.getAttribute("data-thumbnail");
  return {
    src: video.embedSrc,
    // The iframe title of a saved embed is only a fallback ("YouTube video")
    title:
      element.getAttribute("data-title") ||
      (element === iframe ? iframe.getAttribute("title") : null) ||
      null,
    thumbnail: isAllowedThumbnail(thumbnail) ? thumbnail : defaultThumbnail(video) ?? null,
  };
}

/**
 * Inline video block for YouTube, Vimeo, Loom and Dailymotion.
 * Saved as `<div data-video-embed data-title data-thumbnail><iframe …></div>`,
 * which lib/sanitize.ts keeps and the post page turns into a click-to-play
 * preview (components/useVideoFacades.ts).
 */
export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { fetchMeta: undefined };
  },

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
      thumbnail: { default: null },
    };
  },

  parseHTML() {
    return ["div[data-video-embed]", "div[data-youtube-video]", "iframe"].map(
      (tag) => ({ tag, getAttrs: (node) => attrsFromElement(node as HTMLElement) })
    );
  },

  renderHTML({ node }) {
    const { src, title, thumbnail } = node.attrs;
    const video = parseVideoUrl(src);
    return [
      "div",
      // Null attributes are left out of the HTML
      { "data-video-embed": "", "data-title": title, "data-thumbnail": thumbnail },
      [
        "iframe",
        {
          src,
          title: title ?? `${video ? VIDEO_PROVIDER_NAMES[video.provider] : "Embedded"} video`,
          loading: "lazy",
          allow: IFRAME_ALLOW,
          allowfullscreen: "true",
          referrerpolicy: "strict-origin-when-cross-origin",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        ({ url, title, thumbnail }) =>
        ({ chain, dispatch, editor }) => {
          const video = parseVideoUrl(url);
          if (!video) return false;

          const inserted = chain()
            .insertContent({
              type: this.name,
              attrs: {
                src: video.embedSrc,
                title: title ?? null,
                thumbnail: isAllowedThumbnail(thumbnail)
                  ? thumbnail
                  : defaultThumbnail(video) ?? null,
              },
            })
            // Put the cursor on the line after the video (adding one at the
            // end of the post), so the author can keep writing and typing
            // doesn't replace the selected video
            .command(({ tr }) => {
              const { $to } = tr.selection;
              const after = $to.nodeAfter;
              if (after?.isTextblock) {
                tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1));
              } else {
                const paragraph = tr.doc.type.schema.nodes.paragraph;
                if (!paragraph) return true;
                tr.insert($to.pos, paragraph.create());
                tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1));
              }
              tr.scrollIntoView();
              return true;
            })
            .run();

          // Fill in the title and thumbnail once the lookup returns. Skipped
          // for dry runs (editor.can()) and when the caller already has them.
          const { fetchMeta } = this.options;
          if (inserted && dispatch && fetchMeta && !title) {
            fetchMeta(url).then((meta) => {
              if (!meta || editor.isDestroyed) return;
              const { tr } = editor.state;
              editor.state.doc.descendants((node, pos) => {
                if (node.type.name === this.name && node.attrs.src === video.embedSrc && !node.attrs.title) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    title: meta.title ?? null,
                    thumbnail: isAllowedThumbnail(meta.thumbnail)
                      ? meta.thumbnail
                      : node.attrs.thumbnail,
                  });
                }
              });
              if (tr.docChanged) editor.view.dispatch(tr);
            });
          }
          return inserted;
        },
    };
  },

  // Pasting a supported link on its own becomes a video, like Medium or
  // Substack. Links pasted inside code, or alongside other text, stay text.
  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey("videoEmbedPaste"),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain")?.trim();
            if (!text || view.state.selection.$from.parent.type.spec.code) {
              return false;
            }
            if (!parseVideoUrl(text)) return false;
            return editor.commands.setVideoEmbed({ url: text });
          },
        },
      }),
    ];
  },
});

export default VideoEmbed;
