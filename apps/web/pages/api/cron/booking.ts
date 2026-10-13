import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { supaServerClient } from "../../../supa-server-client";
import { bookingUrl, hashToken } from "../../../lib/server/booking";
import { rateLimited } from "../../../lib/server/rateLimit";
import {
  ReminderKind,
  sendHostReminderEmail,
  sendNudgeEmail,
  sendReminderEmail,
} from "../../../lib/server/bookingEmails";
import type { BookingHost, BookingType } from "../../../lib/booking/types";

// Sends booking emails that are due: reminders a day and an hour before each
// call, and a nudge to buyers who paid 3+ days ago but haven't picked a time.
// Supabase's pg_cron calls this every 15 minutes (migration
// 20261014120000_booking_reminders.sql). Each email is claimed in the
// database before it is sent, so extra calls never send anything twice.
// Sending a batch of emails can take a while
export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method" });
  }
  res.setHeader("Cache-Control", "no-store");
  if (!supaServerClient) return res.status(500).json({ error: "server" });
  const db = supaServerClient;
  if (await rateLimited(req, res, "cron", 6, 60, { global: true })) return;

  const types = new Map<string, BookingType | null>();
  const hosts = new Map<string, BookingHost | null>();
  const typeOf = async (id: string) => {
    if (!types.has(id)) types.set(id, (await db.from("booking_types").select("*").eq("id", id).maybeSingle()).data);
    return types.get(id) ?? null;
  };
  const hostOf = async (id: string) => {
    if (!hosts.has(id)) hosts.set(id, (await db.from("booking_hosts").select("*").eq("id", id).maybeSingle()).data);
    return hosts.get(id) ?? null;
  };

  const sent = { reminders24h: 0, reminders1h: 0, nudges: 0, failed: 0 };
  try {
    for (const kind of ["24h", "1h"] as ReminderKind[]) {
      const { data: due, error } = await db.rpc("booking_claim_reminders", { p_kind: kind });
      if (error) throw new Error(`Claiming ${kind} reminders failed: ${error.message}`);
      for (const booking of due ?? []) {
        const [type, host] = await Promise.all([typeOf(booking.booking_type_id), hostOf(booking.host_id)]);
        if (!type || !host) continue;
        const results = await Promise.all([
          sendReminderEmail(kind, booking, type, host),
          kind === "1h" ? sendHostReminderEmail(booking, type, host) : Promise.resolve(true),
        ]);
        if (results.every(Boolean)) sent[kind === "24h" ? "reminders24h" : "reminders1h"]++;
        else sent.failed++;
      }
    }

    const { data: unbooked, error } = await db.rpc("booking_claim_nudges");
    if (error) throw new Error(`Claiming nudges failed: ${error.message}`);
    for (const link of unbooked ?? []) {
      const type = await typeOf(link.booking_type_id);
      if (!type || !link.email) continue;
      // Only the hash of the order email's token is stored, so the nudge
      // carries a second link to the same credit; both keep working.
      const token = randomBytes(24).toString("base64url");
      const { error: tokenError } = await db.from("booking_entitlements").update({ nudge_token_hash: hashToken(token) }).eq("id", link.id);
      if (tokenError) {
        console.error(`Nudge for link ${link.id}: new token failed`, tokenError);
        sent.failed++;
        continue;
      }
      const ok = await sendNudgeEmail({ email: link.email, name: link.name, type, url: bookingUrl(token), paidOn: link.created_at });
      if (ok) sent.nudges++;
      else sent.failed++;
    }

    // Rate limit counters older than a day are no longer needed
    await db.from("booking_rate_limits").delete().lt("window_start", new Date(Date.now() - 86_400_000).toISOString());
  } catch (error) {
    console.error("booking cron failed", error);
    return res.status(500).json({ error: "server", sent });
  }
  if (sent.failed) console.error("booking cron: some emails failed", sent);
  return res.status(200).json({ ok: true, sent });
}
