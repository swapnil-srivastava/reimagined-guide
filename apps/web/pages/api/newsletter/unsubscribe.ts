import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { TOKEN_RE } from "../../../lib/server/newsletter";

// POST /api/newsletter/unsubscribe?token=… (or { token } in the body)
//   Unsubscribes. Takes the token from the query too, so newsletter emails can
//   offer one-click unsubscribe (List-Unsubscribe-Post), which mail apps send
//   as a POST to the link. A plain GET (a link scanner) changes nothing.
//   Answers { status: "unsubscribed" | "invalid" }.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  const token =
    (typeof req.query.token === "string" && req.query.token) ||
    (typeof req.body === "object" && req.body?.token);
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    return res.status(400).json({ status: "invalid" });
  }
  if (!supaServerClient) {
    return res.status(503).json({ error: "Not available right now." });
  }

  const { data, error } = await supaServerClient
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .neq("status", "unsubscribed")
    .select("id");

  if (error) {
    console.error("newsletter/unsubscribe: update failed", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  if (!data || data.length === 0) {
    // Already unsubscribed is fine; an unknown token is not
    const { data: row } = await supaServerClient
      .from("newsletter_subscribers")
      .select("id")
      .eq("token", token)
      .maybeSingle();
    if (!row) return res.status(404).json({ status: "invalid" });
  }

  return res.status(200).json({ status: "unsubscribed" });
}
