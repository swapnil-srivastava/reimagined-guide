import { randomBytes } from "crypto";
import type { NextApiRequest } from "next";
import { SITE_NAME } from "../site";
import { emailLayout, paragraph } from "./emailLayout";
import { ADMIN_EMAIL, SITE_URL, escapeHtml, sendMail } from "./mailer";

// Shared helpers for the /api/newsletter routes

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const TOKEN_RE = /^[0-9a-f]{64}$/;

// A repeat signup for the same address re-sends the confirmation at most this often
export const RESEND_AFTER_MS = 10 * 60 * 1000;
// Confirmation emails one IP may trigger per hour
export const MAX_SIGNUPS_PER_IP_PER_HOUR = 5;

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

// This project's Vercel preview deployments, and local development
const PREVIEW_HOST = /^[a-z0-9-]+-swapnil-srivastavas-projects-c9797073\.vercel\.app$/;
const LOCAL_HOST = /^localhost(:\d+)?$/;

/**
 * Where links in emails should point. A signup made on a preview deployment
 * links back to that preview (the live site may not have the page yet);
 * everything else links to the live site. Only known hosts are trusted, so a
 * forged Host header can't make the email link somewhere else.
 */
export function siteUrlFor(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-host"];
  const host = ((Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.headers.host || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (PREVIEW_HOST.test(host)) return `https://${host}`;
  if (LOCAL_HOST.test(host)) return `http://${host}`;
  return SITE_URL;
}

export function confirmUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/newsletter/confirm?token=${token}`;
}

export function unsubscribeUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/newsletter/unsubscribe?token=${token}`;
}

export function sendConfirmationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  const link = confirmUrl(baseUrl, token);
  const html = emailLayout({
    preheader: "One tap to confirm your subscription to weekly tech insights.",
    title: "Confirm your subscription",
    subtitle: "Weekly tech insights from Swapnil Srivastava",
    bodyHtml:
      paragraph("Hi there,") +
      paragraph(
        "Thanks for signing up! Tap the button below to confirm your email address and start getting weekly tech insights in your inbox."
      ),
    button: { label: "Confirm subscription", href: link },
    footnoteHtml: `If the button doesn't work, copy this link into your browser:<br>
      <a href="${escapeHtml(link)}" style="color: #00539c; word-break: break-all;">${escapeHtml(link)}</a>`,
    footerHtml: `You're getting this because ${escapeHtml(email)} was entered on ${escapeHtml(
      SITE_NAME
    )}. If that wasn't you, ignore this email and you won't hear from us again.`,
  });
  const text = [
    "Confirm your subscription",
    "",
    "Thanks for signing up for weekly tech insights from Swapnil Srivastava.",
    "Open this link to confirm your email address:",
    link,
    "",
    "If you didn't sign up, ignore this email and you won't hear from us again.",
  ].join("\n");
  return sendMail(email, "Confirm your subscription to weekly tech insights", html, text);
}

export function sendNewSubscriberNotice(email: string, source: string | null): Promise<boolean> {
  const where = source ? ` on /${escapeHtml(source)}` : "";
  const html = emailLayout({
    preheader: `${email} just confirmed their newsletter subscription.`,
    title: "New subscriber",
    bodyHtml:
      paragraph(`<strong>${escapeHtml(email)}</strong> confirmed their newsletter subscription${where}.`) +
      paragraph("Subscriber counts are on the Links page card in your admin dashboard."),
    button: { label: "Open admin dashboard", href: `${SITE_URL}/admin` },
  });
  const text = `${email} confirmed their newsletter subscription${
    source ? ` on /${source}` : ""
  }.\n\nAdmin dashboard: ${SITE_URL}/admin`;
  return sendMail(ADMIN_EMAIL, `New newsletter subscriber: ${email}`, html, text);
}
