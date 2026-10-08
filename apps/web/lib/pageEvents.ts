import { supaClient } from "../supa-client";

// Page views and link clicks (see pages/api/views/event.ts)

const SESSION_KEY = "page-events-sent";

async function authHeader(): Promise<Record<string, string>> {
  try {
    const {
      data: { session },
    } = await supaClient.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    return {};
  }
}

/** Sends an event once per browser session; the server de-duplicates per day anyway */
async function send(page: string, linkId?: string): Promise<void> {
  const key = `${page}:${linkId ?? ""}`;
  let sent: string[] = [];
  try {
    sent = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]");
    if (sent.includes(key)) return;
  } catch {
    // Storage unavailable (private mode): the server still de-duplicates
  }

  try {
    // keepalive lets a click still be sent while the browser leaves the page
    await fetch("/api/views/event", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(linkId ? { page, linkId } : { page }),
    });
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...sent, key].slice(-100)));
    } catch {
      // ignore
    }
  } catch {
    // Tracking must never break the page
  }
}

export function recordPageView(page: string): void {
  void send(page);
}

export function recordLinkClick(page: string, linkId: string): void {
  void send(page, linkId);
}
