import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import { supaServerClient } from "../../supa-server-client";

// Per-visitor request limits for the public booking API, counted in the
// database (booking_rate_hit) so they hold across serverless instances.
// Visitors are told apart by a hash of their IP; the IP itself is never stored.

function visitor(req: NextApiRequest): string {
  const forwarded = req.headers["x-real-ip"] ?? req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  return createHash("sha256").update(`booking:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Counts this request against `bucket` and, when the visitor is over
 * `limit` requests per `windowSeconds`, answers 429 and returns true.
 * `global` counts every visitor together. If the counter itself fails,
 * the request goes through: a broken limit must not break booking.
 */
export async function rateLimited(
  req: NextApiRequest,
  res: NextApiResponse,
  bucket: string,
  limit: number,
  windowSeconds = 60,
  options: { global?: boolean } = {}
): Promise<boolean> {
  if (!supaServerClient) return false;
  const key = options.global ? bucket : `${bucket}:${visitor(req)}`;
  const { data, error } = await supaServerClient.rpc("booking_rate_hit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.message);
    return false;
  }
  if (data !== false) return false;
  res.setHeader("Retry-After", String(windowSeconds));
  res.status(429).json({ error: "rate_limited" });
  return true;
}
