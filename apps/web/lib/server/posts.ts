import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Origin of the deployment handling the request, for links in emails, so a
 * preview deployment sends links back to itself instead of production.
 * NEXT_PUBLIC_SITE_URL wins when it is set.
 */
export function requestOrigin(req: NextApiRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.headers.host;
  if (!host) return "https://www.swapnilsrivastava.eu";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host.split(",")[0].trim()}`;
}

// Keep in sync with `i18n.locales` in next.config.js
const LOCALES = ["en-US", "de-DE", "fr-FR", "hi-IN"];
const DEFAULT_LOCALE = "en-US";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Refreshes the statically generated post page (ISR) in every locale so an
 * approved or unpublished post shows up, or disappears, right away.
 * The home and user pages are server rendered and need no revalidation.
 */
export async function revalidatePost(
  res: NextApiResponse,
  username: string | null,
  slug: string | null
): Promise<void> {
  if (!username || !slug) return;

  const path = `/${username}/${slug}`;
  const paths = LOCALES.map((locale) =>
    locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
  );

  await Promise.all(
    paths.map((p) =>
      res.revalidate(p).catch((error) => {
        console.error(`revalidatePost: failed to revalidate ${p}`, error);
      })
    )
  );
}
