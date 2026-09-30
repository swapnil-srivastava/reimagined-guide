import { RefObject, useEffect } from "react";
import { useIntl } from "react-intl";

import {
  VIDEO_PROVIDER_NAMES,
  autoplaySrc,
  defaultThumbnail,
  isAllowedThumbnail,
  parseVideoUrl,
} from "../lib/videoEmbed";

const PLAYER_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/**
 * Swaps each video embed inside `ref` for a click-to-play preview: the
 * thumbnail and title, with the provider's player (and its scripts and
 * cookies) only loaded once the reader presses play.
 *
 * The sanitized HTML keeps a working lazy iframe, so readers without
 * JavaScript and feed readers still get the video. Rerun when `html` changes,
 * since React replaces the content then.
 */
export function useVideoFacades(ref: RefObject<HTMLElement>, html: string) {
  const intl = useIntl();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    root.querySelectorAll<HTMLElement>("[data-video-embed]").forEach((embed) => {
      // Embeds already turned into a preview (or playing) are left alone
      if ("facade" in embed.dataset) return;
      const iframe = embed.querySelector("iframe");
      const video = parseVideoUrl(iframe?.getAttribute("src"));
      if (!iframe || !video) return;
      embed.dataset.facade = "";

      const provider = VIDEO_PROVIDER_NAMES[video.provider];
      const title = embed.dataset.title;
      const thumbnail = isAllowedThumbnail(embed.dataset.thumbnail)
        ? embed.dataset.thumbnail
        : defaultThumbnail(video);

      // Built with DOM APIs (textContent), so titles are never parsed as HTML
      const button = document.createElement("button");
      button.type = "button";
      button.className = "video-facade";
      const untitled = intl.formatMessage(
        {
          id: "video-facade-untitled",
          description: "Name of an embedded video whose title is unknown, e.g. YouTube video",
          defaultMessage: "{provider} video",
        },
        { provider }
      );
      button.setAttribute(
        "aria-label",
        intl.formatMessage(
          {
            id: "video-facade-play",
            description: "Accessible name of the button that plays an embedded video",
            defaultMessage: "Play video: {title} ({provider})",
          },
          { title: title || untitled, provider }
        )
      );

      if (thumbnail) {
        const image = document.createElement("img");
        image.src = thumbnail;
        image.alt = "";
        image.width = 480;
        image.height = 270;
        image.loading = "lazy";
        image.decoding = "async";
        // Deleted videos and blocked CDNs fall back to the plain background
        image.addEventListener("error", () => image.remove());
        button.append(image);
      }

      const play = document.createElement("span");
      play.className = "video-facade-play";
      play.setAttribute("aria-hidden", "true");

      const caption = document.createElement("span");
      caption.className = "video-facade-caption";
      caption.setAttribute("aria-hidden", "true");
      const captionTitle = document.createElement("span");
      captionTitle.className = "video-facade-title";
      captionTitle.textContent = title || untitled;
      const captionProvider = document.createElement("span");
      captionProvider.className = "video-facade-provider";
      captionProvider.translate = false;
      captionProvider.textContent = provider;
      caption.append(captionTitle, captionProvider);

      button.append(play, caption);

      // Warm up the connection to the player while the reader is about to play
      const preconnect = () => {
        const origin = new URL(video.embedSrc).origin;
        if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = origin;
        document.head.append(link);
      };
      button.addEventListener("pointerenter", preconnect, { once: true });
      button.addEventListener("focus", preconnect, { once: true });

      button.addEventListener("click", () => {
        const player = document.createElement("iframe");
        player.src = autoplaySrc(video.embedSrc);
        player.title = title || untitled;
        player.allow = PLAYER_ALLOW;
        player.allowFullscreen = true;
        player.referrerPolicy = "strict-origin-when-cross-origin";
        button.replaceWith(player);
        // Keep keyboard users where they were: on the video
        player.focus();
      });

      iframe.replaceWith(button);
    });
  }, [ref, html, intl]);
}
