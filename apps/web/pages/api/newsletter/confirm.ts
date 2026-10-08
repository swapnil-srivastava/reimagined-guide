import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { TOKEN_RE, sendNewSubscriberNotice } from "../../../lib/server/newsletter";

// POST /api/newsletter/confirm { token }
//   Confirms a pending subscriber. Called by the /newsletter/confirm page
//   rather than straight from the email link, so link scanners that open
//   every URL in an email don't confirm on the reader's behalf.
//   Answers { status: "confirmed" | "invalid" }.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  const { token } = req.body ?? {};
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    return res.status(400).json({ status: "invalid" });
  }
  if (!supaServerClient) {
    return res.status(503).json({ error: "Not available right now." });
  }

  const { data: subscriber } = await supaServerClient
    .from("newsletter_subscribers")
    .select("id, email, status, source")
    .eq("token", token)
    .maybeSingle();

  if (!subscriber || subscriber.status === "unsubscribed") {
    return res.status(404).json({ status: "invalid" });
  }
  if (subscriber.status === "confirmed") {
    return res.status(200).json({ status: "confirmed" });
  }

  const { data: updated, error } = await supaServerClient
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", subscriber.id)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error("newsletter/confirm: update failed", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  // Only the request that actually confirmed it sends the notice
  if (updated && updated.length > 0) {
    await sendNewSubscriberNotice(subscriber.email, subscriber.source);
  }

  return res.status(200).json({ status: "confirmed" });
}
