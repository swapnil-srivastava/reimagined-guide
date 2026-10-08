import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { getAuthedRequest } from "../../../lib/server/supabase-user";
import { isUncountable, visitorHash } from "../../../lib/server/visitor";

// Pages whose views and link clicks are counted
const TRACKED_PAGES = new Set(["links"]);
const LINK_ID = /^[a-z0-9_-]{1,60}$/;

// POST /api/views/event { page, linkId? }
//   No linkId: a view of the page. With linkId: a click on that link.
//   Counted once per visitor, page (and link) and day, from an anonymous
//   daily hash (see supabase/migrations/20261008120000_newsletter_and_page_stats.sql).
//   Admins' own visits are skipped (send the usual Authorization header).
//   Always answers 204 so tracking can never break the page.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  // sendBeacon posts text/plain, so the body may arrive as a string
  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { page, linkId } = body;

  if (typeof page !== "string" || !TRACKED_PAGES.has(page)) {
    return res.status(400).json({ error: "Unknown page." });
  }
  if (linkId !== undefined && (typeof linkId !== "string" || !LINK_ID.test(linkId))) {
    return res.status(400).json({ error: "Invalid linkId." });
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaServerClient || !secret || isUncountable(req)) {
    return res.status(204).end();
  }

  const viewer = await getAuthedRequest(req);

  const { error } = await supaServerClient.rpc("record_page_event", {
    p_page: page,
    p_link_id: linkId ?? null,
    p_visitor_hash: visitorHash(req, secret, "page-views"),
    p_viewer: viewer?.user.id ?? null,
  });

  if (error) console.error("record_page_event failed", error);
  return res.status(204).end();
}
