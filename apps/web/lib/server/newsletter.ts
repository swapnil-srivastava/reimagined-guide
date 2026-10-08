import { randomBytes } from "crypto";
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

export function confirmUrl(token: string): string {
  return `${SITE_URL}/newsletter/confirm?token=${token}`;
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/newsletter/unsubscribe?token=${token}`;
}

export function sendConfirmationEmail(email: string, token: string): Promise<boolean> {
  const link = confirmUrl(token);
  return sendMail(
    email,
    "Confirm your subscription to Swapnil's weekly tech insights",
    `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0a0a0a;">
        <h1 style="font-size: 22px;">One click to confirm</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Thanks for signing up for weekly tech insights from Swapnil Srivastava.
          Please confirm that this is your email address:
        </p>
        <p style="margin: 28px 0;">
          <a href="${escapeHtml(link)}"
             style="background: #00539c; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Confirm subscription
          </a>
        </p>
        <p style="font-size: 14px; color: #555;">
          If you didn't sign up, ignore this email and you won't hear from us again.
        </p>
        <p style="font-size: 12px; color: #888; word-break: break-all;">${escapeHtml(link)}</p>
      </div>
    `
  );
}

export function sendNewSubscriberNotice(email: string, source: string | null): Promise<boolean> {
  return sendMail(
    ADMIN_EMAIL,
    `New newsletter subscriber: ${email}`,
    `<p>${escapeHtml(email)} confirmed their newsletter subscription${
      source ? ` (signed up on /${escapeHtml(source)})` : ""
    }.</p>`
  );
}
