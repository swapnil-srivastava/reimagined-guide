import type { NextApiRequest, NextApiResponse } from "next";
import { supaServerClient } from "../../../supa-server-client";
import { visitorHash } from "../../../lib/server/visitor";
import {
  MAX_SIGNUPS_PER_IP_PER_HOUR,
  RESEND_AFTER_MS,
  newToken,
  normalizeEmail,
  sendConfirmationEmail,
} from "../../../lib/server/newsletter";

const SOURCE_RE = /^[a-z0-9-]{1,40}$/;
const LOCALE_RE = /^[a-zA-Z-]{2,10}$/;

// POST /api/newsletter/subscribe { email, website, source?, locale? }
//   Saves a pending subscriber and emails a confirmation link (double opt-in).
//   The answer is the same whether or not the address is already subscribed,
//   so the form can't be used to look up who is on the list.
//   `website` is a honeypot: people never see it, bots fill it in.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  const { email: rawEmail, website, source, locale } = req.body ?? {};
  const ok = () => res.status(200).json({ ok: true });

  // Pretend success to bots so they don't retry
  if (typeof website === "string" && website.trim() !== "") return ok();

  const email = normalizeEmail(rawEmail);
  if (!email) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaServerClient || !secret) {
    console.error("newsletter/subscribe: SUPABASE_SERVICE_ROLE_KEY is not configured");
    return res.status(503).json({ error: "Signups are not available right now. Please try again later." });
  }

  const ipHash = visitorHash(req, secret, "newsletter-signup");
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supaServerClient
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("signup_ip_hash", ipHash)
    .gte("confirmation_sent_at", hourAgo);
  if ((count ?? 0) >= MAX_SIGNUPS_PER_IP_PER_HOUR) {
    return res.status(429).json({ error: "Too many signups from your network. Please try again later." });
  }

  const { data: existing, error: readError } = await supaServerClient
    .from("newsletter_subscribers")
    .select("id, status, token, confirmation_sent_at")
    .eq("email", email)
    .maybeSingle();
  if (readError) {
    console.error("newsletter/subscribe: read failed", readError);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  // Already confirmed: nothing to do, and say nothing different
  if (existing?.status === "confirmed") return ok();

  // Don't let the form be used to flood someone's inbox
  if (
    existing?.status === "pending" &&
    existing.confirmation_sent_at &&
    Date.now() - new Date(existing.confirmation_sent_at).getTime() < RESEND_AFTER_MS
  ) {
    return ok();
  }

  const token = newToken();
  const fields = {
    status: "pending",
    token,
    source: typeof source === "string" && SOURCE_RE.test(source) ? source : null,
    locale: typeof locale === "string" && LOCALE_RE.test(locale) ? locale : null,
    signup_ip_hash: ipHash,
    confirmation_sent_at: new Date().toISOString(),
    unsubscribed_at: null,
  };

  const { error: writeError } = existing
    ? await supaServerClient.from("newsletter_subscribers").update(fields).eq("id", existing.id)
    : await supaServerClient.from("newsletter_subscribers").insert({ email, ...fields });

  // 23505: the same address was inserted by a parallel request; treat as done
  if (writeError && writeError.code !== "23505") {
    console.error("newsletter/subscribe: write failed", writeError);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  if (writeError) return ok();

  const sent = await sendConfirmationEmail(email, token);
  if (!sent) {
    return res.status(502).json({ error: "We couldn't send the confirmation email. Please try again later." });
  }

  return ok();
}
