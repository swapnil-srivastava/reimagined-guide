import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../../supa-server-client";
import { hashToken, TOKEN_RE } from "../../../../lib/server/booking";
import { rateLimited } from "../../../../lib/server/rateLimit";
import { buildFeed } from "../../../../lib/booking/ics";

// e.g. /api/booking/feed/<token>.ics
// A host's private calendar feed: their booked calls, for subscribing to in
// Google Calendar, Apple Calendar or Outlook. The token in the URL is the key
// (made in /admin/booking > Settings); only its hash is stored.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method" });
  }
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (await rateLimited(req, res, "booking-feed", 30)) return;

  const token = String(req.query.token ?? "").replace(/\.ics$/, "");
  if (!TOKEN_RE.test(token) || !supaServerClient) return res.status(404).json({ error: "not_found" });
  const db = supaServerClient;

  try {
    const { data: host } = await db.from("booking_hosts").select("*").eq("feed_token_hash", hashToken(token)).maybeSingle();
    if (!host) return res.status(404).json({ error: "not_found" });

    // Calls from the last 60 days on, so recent ones stay in view
    const since = new Date(Date.now() - 60 * 86_400_000).toISOString();
    const [{ data: bookings, error }, { data: types }] = await Promise.all([
      db
        .from("bookings")
        .select("*")
        .eq("host_id", host.id)
        .in("status", ["confirmed", "completed"])
        .gte("starts_at", since)
        .order("starts_at")
        .limit(1000),
      db.from("booking_types").select("id, name, location_value"),
    ]);
    if (error) throw new Error(error.message);
    const typeById = new Map((types ?? []).map((t) => [t.id, t]));

    const feed = buildFeed(
      `Bookings: ${host.name}`,
      (bookings ?? []).map((b) => {
        const type = typeById.get(b.booking_type_id);
        return {
          // Not the invite's UID, so the feed and an accepted invite don't fight over one event
          uid: `${b.id}-feed@swapnilsrivastava.eu`,
          start: new Date(b.starts_at),
          end: new Date(b.ends_at),
          summary: `${type?.name ?? "Call"}: ${b.invitee_name}`,
          description: [b.invitee_email, b.notes ? `Notes: ${b.notes}` : ""].filter(Boolean).join("\n\n"),
          location: type?.location_value,
          updated: new Date(b.updated_at),
        };
      })
    );
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="bookings.ics"');
    return res.status(200).send(req.method === "HEAD" ? "" : feed);
  } catch (error) {
    console.error("booking feed failed", error);
    return res.status(500).json({ error: "server" });
  }
}
