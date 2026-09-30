// Video providers that can be embedded inline in a post.
//
// This is the single allow-list for embeds: the editor, the paste handler,
// the HTML sanitizer and the /api/video-meta route all go through
// parseVideoUrl, so an iframe is only ever built from a provider and id we
// recognise, never from a URL the author typed.

export type VideoProvider = "youtube" | "vimeo" | "loom" | "dailymotion";

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
  /** Vimeo's privacy hash for unlisted videos */
  hash?: string;
  /** Start time in seconds */
  start?: number;
  /** Player URL for the iframe */
  embedSrc: string;
  /** Public page of the video, used for the oEmbed lookup */
  pageUrl: string;
}

export const VIDEO_PROVIDER_NAMES: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  dailymotion: "Dailymotion",
};

/** Hosts the sanitizer lets an iframe point at (the embedSrc hosts below) */
export const VIDEO_IFRAME_HOSTNAMES = [
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "www.loom.com",
  "www.dailymotion.com",
];

const THUMBNAIL_HOSTS = ["i.ytimg.com", "i.vimeocdn.com", "cdn.loom.com"];
const THUMBNAIL_HOST_SUFFIXES = [".dmcdn.net"];

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{1,12}$/;
const VIMEO_HASH = /^[0-9a-f]{6,20}$/i;
const LOOM_ID = /^[0-9a-f]{32}$/i;
const DAILYMOTION_ID = /^x[0-9a-z]{3,12}$/i;

/** "90", "90s", "1m30s", "1h2m3s" → seconds */
function parseTime(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  if (/^\d+s?$/.test(value)) return parseInt(value, 10) || undefined;
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return undefined;
  const [, h = "0", m = "0", s = "0"] = match;
  return +h * 3600 + +m * 60 + +s || undefined;
}

function toUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function host(url: URL): string {
  return url.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
}

function segments(url: URL): string[] {
  return url.pathname.split("/").filter(Boolean);
}

function build(
  provider: VideoProvider,
  id: string,
  { hash, start }: { hash?: string; start?: number } = {}
): ParsedVideo {
  switch (provider) {
    case "youtube":
      return {
        provider,
        id,
        start,
        embedSrc: `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ""}`,
        pageUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    case "vimeo": {
      const query = hash ? `?h=${hash}` : "";
      return {
        provider,
        id,
        hash,
        start,
        embedSrc: `https://player.vimeo.com/video/${id}${query}${start ? `#t=${start}s` : ""}`,
        pageUrl: `https://vimeo.com/${id}${hash ? `/${hash}` : ""}`,
      };
    }
    case "loom":
      return {
        provider,
        id,
        embedSrc: `https://www.loom.com/embed/${id}`,
        pageUrl: `https://www.loom.com/share/${id}`,
      };
    case "dailymotion":
      return {
        provider,
        id,
        start,
        embedSrc: `https://www.dailymotion.com/embed/video/${id}${start ? `?start=${start}` : ""}`,
        pageUrl: `https://www.dailymotion.com/video/${id}`,
      };
  }
}

function parseYoutube(url: URL): ParsedVideo | null {
  const h = host(url);
  const parts = segments(url);
  let id: string | undefined;

  if (h === "youtu.be") {
    id = parts[0];
  } else if (["youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(h)) {
    if (parts[0] === "watch") id = url.searchParams.get("v") ?? undefined;
    else if (["embed", "shorts", "live", "v"].includes(parts[0])) id = parts[1];
  }

  if (!id || !YOUTUBE_ID.test(id)) return null;
  const start = parseTime(url.searchParams.get("start") ?? url.searchParams.get("t"));
  return build("youtube", id, { start });
}

function parseVimeo(url: URL): ParsedVideo | null {
  const h = host(url);
  const parts = segments(url);
  let id: string | undefined;
  let hash: string | undefined;

  if (h === "player.vimeo.com" && parts[0] === "video") {
    id = parts[1];
    hash = url.searchParams.get("h") ?? undefined;
  } else if (h === "vimeo.com") {
    // vimeo.com/123, vimeo.com/123/abcdef (unlisted), vimeo.com/channels/x/123,
    // vimeo.com/showcase/456/video/123 (the showcase id is not the video)
    const videoIndex = parts.indexOf("video");
    const index =
      videoIndex !== -1
        ? videoIndex + 1
        : ["showcase", "album"].includes(parts[0])
          ? -1
          : parts.findIndex((part) => VIMEO_ID.test(part));
    if (index !== -1) {
      id = parts[index];
      hash = parts[index + 1] ?? url.searchParams.get("h") ?? undefined;
    }
  }

  if (!id || !VIMEO_ID.test(id)) return null;
  if (hash && !VIMEO_HASH.test(hash)) hash = undefined;
  const start = parseTime(url.hash.match(/t=([0-9hms]+)/)?.[1]);
  return build("vimeo", id, { hash, start });
}

function parseLoom(url: URL): ParsedVideo | null {
  const parts = segments(url);
  if (host(url) !== "loom.com" || !["share", "embed"].includes(parts[0])) return null;
  // Share links can carry a readable slug: /share/my-title-<id>
  const id = parts[1]?.slice(-32);
  return id && LOOM_ID.test(id) ? build("loom", id) : null;
}

function parseDailymotion(url: URL): ParsedVideo | null {
  const h = host(url);
  const parts = segments(url);
  let id: string | undefined;

  if (h === "dai.ly") id = parts[0];
  else if (h === "geo.dailymotion.com") id = url.searchParams.get("video") ?? undefined;
  else if (h === "dailymotion.com") {
    if (parts[0] === "video") id = parts[1];
    else if (parts[0] === "embed" && parts[1] === "video") id = parts[2];
  }

  // Old links append a slug: /video/x7tgad0_my-title
  id = id?.split("_")[0];
  if (!id || !DAILYMOTION_ID.test(id)) return null;
  const start = parseTime(url.searchParams.get("start"));
  return build("dailymotion", id, { start });
}

const PARSERS = [parseYoutube, parseVimeo, parseLoom, parseDailymotion];

/** Recognises a video link from a supported provider, or returns null. */
export function parseVideoUrl(input: string | null | undefined): ParsedVideo | null {
  const url = input ? toUrl(input) : null;
  if (!url) return null;
  for (const parse of PARSERS) {
    const video = parse(url);
    if (video) return video;
  }
  return null;
}

export function isVideoProvider(value: unknown): value is VideoProvider {
  return typeof value === "string" && value in VIDEO_PROVIDER_NAMES;
}

/** Only https thumbnails served by the providers themselves are kept. */
export function isAllowedThumbnail(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    const h = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (THUMBNAIL_HOSTS.includes(h) ||
        THUMBNAIL_HOST_SUFFIXES.some((suffix) => h.endsWith(suffix)))
    );
  } catch {
    return false;
  }
}

/** YouTube thumbnails can be built from the id, without a network call. */
export function defaultThumbnail(video: ParsedVideo): string | undefined {
  return video.provider === "youtube"
    ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
    : undefined;
}

/** oEmbed endpoint for a video's public page (fixed hosts only). */
export function oEmbedUrl(video: ParsedVideo): string {
  const page = encodeURIComponent(video.pageUrl);
  switch (video.provider) {
    case "youtube":
      return `https://www.youtube.com/oembed?format=json&url=${page}`;
    case "vimeo":
      return `https://vimeo.com/api/oembed.json?url=${page}`;
    case "loom":
      return `https://www.loom.com/v1/oembed?url=${page}`;
    case "dailymotion":
      return `https://www.dailymotion.com/services/oembed?format=json&url=${page}`;
  }
}

/** Player URL that starts playing straight away (used after a facade click). */
export function autoplaySrc(embedSrc: string): string {
  const [base, fragment] = embedSrc.split("#");
  const joined = `${base}${base.includes("?") ? "&" : "?"}autoplay=1`;
  return fragment ? `${joined}#${fragment}` : joined;
}
