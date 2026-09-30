import sanitizeHtml from "sanitize-html";
import {
  VIDEO_IFRAME_HOSTNAMES,
  isAllowedThumbnail,
  parseVideoUrl,
} from "./videoEmbed";

const VIDEO_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

function shortText(value: string | undefined): string | undefined {
  const text = value?.trim().slice(0, 200);
  return text || undefined;
}

// Post HTML comes from the Tiptap editor (StarterKit + video embeds).
// Anything outside that set, such as scripts, inline event handlers or
// javascript: URLs, is stripped before it is saved or rendered.
//
// Video iframes are rebuilt from lib/videoEmbed: the src is parsed into a
// provider and id and the player URL is generated again, so only known
// players (with no extra parameters) can be framed. Anything else is dropped.
const POST_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "iframe",
    "h1",
    "h2",
    "s",
    "u",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "title", "loading", "allow", "allowfullscreen", "referrerpolicy"],
    div: ["data-video-embed", "data-title", "data-thumbnail"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: VIDEO_IFRAME_HOSTNAMES,
  transformTags: {
    iframe: (tagName, attribs) => {
      const video = parseVideoUrl(attribs.src);
      if (!video) return { tagName, attribs: {} };
      const title = shortText(attribs.title);
      return {
        tagName,
        attribs: {
          src: video.embedSrc,
          ...(title ? { title } : {}),
          loading: "lazy",
          allow: VIDEO_IFRAME_ALLOW,
          allowfullscreen: "true",
          referrerpolicy: "strict-origin-when-cross-origin",
        },
      };
    },
    // Embeds made by the old Tiptap YouTube extension used data-youtube-video
    div: (tagName, attribs) => {
      if (!("data-video-embed" in attribs || "data-youtube-video" in attribs)) {
        return { tagName, attribs: {} };
      }
      const title = shortText(attribs["data-title"]);
      const thumbnail = attribs["data-thumbnail"];
      return {
        tagName,
        attribs: {
          "data-video-embed": "",
          ...(title ? { "data-title": title } : {}),
          ...(isAllowedThumbnail(thumbnail) ? { "data-thumbnail": thumbnail } : {}),
        },
      };
    },
  },
  // An iframe whose src wasn't a supported video is removed entirely
  exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
};

export function sanitizePostHtml(html: string | null | undefined): string {
  return sanitizeHtml(html ?? "", POST_HTML_OPTIONS);
}
