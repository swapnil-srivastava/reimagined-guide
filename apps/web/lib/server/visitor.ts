import { createHmac } from "crypto";
import type { NextApiRequest } from "next";

// Crawlers, link previews and automated browsers don't count as visitors
export const BOT_UA =
  /bot|crawl|spider|slurp|preview|fetch|facebookexternalhit|embedly|headless|lighthouse|pingdom|monitor|curl|wget|python|java\/|axios|node-fetch/i;

// Vercel sets x-real-ip / x-forwarded-for itself, overwriting any value the
// client sends, so they can't be used to fake new visitors
export function clientIp(req: NextApiRequest): string {
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0];
  return (first || req.socket.remoteAddress || "").trim();
}

/**
 * Anonymous id for "this visitor, today": a keyed hash of the IP address with
 * the date in the key, so it can't be reversed or linked across days.
 * The user agent is left out on purpose: it's set by the client, so a script
 * could send a new one with every request and count as a new visitor.
 * `purpose` keeps hashes for different features unrelated to each other.
 */
export function visitorHash(req: NextApiRequest, secret: string, purpose: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", `${secret}:${purpose}:${day}`)
    .update(clientIp(req))
    .digest("hex");
}

/** True for requests that should not be counted: bots, or no user agent or IP */
export function isUncountable(req: NextApiRequest): boolean {
  const userAgent = req.headers["user-agent"] ?? "";
  return !userAgent || BOT_UA.test(userAgent) || !clientIp(req);
}
