import sanitizeHtml from "sanitize-html";

// Post HTML comes from the Tiptap editor (StarterKit + YouTube embeds).
// Anything outside that set, such as scripts, inline event handlers or
// javascript: URLs, is stripped before it is saved or rendered.
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
    iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow"],
    div: ["data-youtube-video"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
  ],
};

export function sanitizePostHtml(html: string | null | undefined): string {
  return sanitizeHtml(html ?? "", POST_HTML_OPTIONS);
}
