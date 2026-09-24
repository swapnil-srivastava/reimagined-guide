// Public origin of the website, used for canonical URLs, feeds and emails
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.swapnilsrivastava.eu"
).replace(/\/$/, "");

export const SITE_NAME = "Swapnil's Odyssey";

export const SITE_DESCRIPTION =
  "Discover insightful articles on technology. swapnilsrivastava.eu offers engaging content to inspire and inform, curated by Swapnil Srivastava.";

export function postUrl(username: string | null, slug: string | null): string {
  return `${SITE_URL}/${encodeURIComponent(username ?? "")}/${encodeURIComponent(slug ?? "")}`;
}
