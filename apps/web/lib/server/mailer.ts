import * as postmark from "postmark";
import { supaServerClient } from "../../supa-server-client";

export { SITE_URL } from "../site";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "contact@swapnilsrivastava.eu";

export function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sends an email through Postmark. Returns false instead of throwing. */
export async function sendMail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  if (!process.env.EMAIL_KEY || !process.env.EMAIL) {
    console.error("sendMail: EMAIL_KEY or EMAIL is not configured");
    return false;
  }

  try {
    const client = new postmark.ServerClient(process.env.EMAIL_KEY);
    await client.sendEmail({
      From: process.env.EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: "outbound",
    });
    return true;
  } catch (error) {
    console.error("sendMail: failed to send email", error);
    return false;
  }
}

/** Looks up a user's email address, preferring the auth record. */
export async function getUserEmail(
  userId: string,
  fallback?: string | null
): Promise<string | null> {
  if (supaServerClient) {
    const { data } = await supaServerClient.auth.admin.getUserById(userId);
    if (data?.user?.email) return data.user.email;
  }
  return fallback ?? null;
}
