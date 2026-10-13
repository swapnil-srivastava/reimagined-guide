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

export interface MailAttachment {
  Name: string;
  /** Base64 encoded file content */
  Content: string;
  ContentType: string;
}

/** Sends an email through Postmark. Returns false instead of throwing. */
export async function sendMail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string,
  attachments?: MailAttachment[]
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
      ...(textBody ? { TextBody: textBody } : {}),
      ...(attachments?.length ? { Attachments: attachments.map((a) => ({ ...a, ContentID: null })) } : {}),
      MessageStream: "outbound",
    });
    return true;
  } catch (error) {
    // Postmark puts the reason (bad sender, inactive recipient, …) in code and message
    const { code, message } = (error ?? {}) as { code?: number; message?: string };
    console.error(`sendMail: failed to send "${subject}" to ${to}: ${code ?? ""} ${message ?? String(error)}`);
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
