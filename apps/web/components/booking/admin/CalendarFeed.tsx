import React, { useState } from "react";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";

import { supaClient } from "../../../supa-client";
import type { BookingHost } from "../../../lib/booking/types";
import { Button, Field, Notice, Panel, Pill, inputClass } from "./ui";

// The host's private calendar feed: a secret URL that Google Calendar, Apple
// Calendar or Outlook subscribe to, so booked calls show up there. Only the
// hash of the link is stored, so the full link is shown once, right after
// making it.

const m = defineMessages({
  title: { id: "booking-admin-feed-title", description: "Booking admin: calendar feed heading", defaultMessage: "Calendar feed" },
  help: {
    id: "booking-admin-feed-help",
    description: "Booking admin: what the calendar feed is",
    defaultMessage: "A private link your calendar app subscribes to, so booked calls appear there by themselves. Anyone with the link can see who booked, so keep it to yourself.",
  },
  on: { id: "booking-admin-feed-on", description: "Booking admin: feed is on", defaultMessage: "On" },
  off: { id: "booking-admin-feed-off", description: "Booking admin: feed is off", defaultMessage: "Off" },
  create: { id: "booking-admin-feed-create", description: "Booking admin: make the feed link", defaultMessage: "Make feed link" },
  renew: { id: "booking-admin-feed-renew", description: "Booking admin: replace the feed link", defaultMessage: "Make a new link" },
  renewHint: {
    id: "booking-admin-feed-renew-hint",
    description: "Booking admin: explains replacing the link",
    defaultMessage: "The link is only shown once. Lost it? Make a new one; the old link stops working.",
  },
  turnOff: { id: "booking-admin-feed-turn-off", description: "Booking admin: turn the feed off", defaultMessage: "Turn off" },
  link: { id: "booking-admin-feed-link", description: "Booking admin: the feed link field", defaultMessage: "Your feed link (shown once)" },
  copy: { id: "booking-admin-feed-copy", description: "Booking admin: copy the feed link", defaultMessage: "Copy" },
  copied: { id: "booking-admin-feed-copied", description: "Booking admin: toast after copying", defaultMessage: "Link copied" },
  how: {
    id: "booking-admin-feed-how",
    description: "Booking admin: how to subscribe in Google Calendar",
    defaultMessage: "Google Calendar on a computer: Other calendars, +, From URL, paste the link. Google checks for new calls every few hours; Apple Calendar and Outlook are quicker.",
  },
  failed: { id: "booking-admin-feed-failed", description: "Booking admin: toast when the feed change fails", defaultMessage: "Couldn't change the feed: {error}" },
  turnedOff: { id: "booking-admin-feed-turned-off", description: "Booking admin: toast after turning the feed off", defaultMessage: "Feed turned off" },
});

export default function CalendarFeed({ host, reload }: { host: BookingHost; reload: () => Promise<void> }) {
  const intl = useIntl();
  const [url, setUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isOn = !!host.feed_token_hash;

  const change = async (action: "new" | "off") => {
    setSaving(true);
    const { data } = await supaClient.auth.getSession();
    const res = await fetch("/api/admin/booking-feed", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ hostId: host.id, action }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setSaving(false);
    if (!res?.ok) {
      toast.error(intl.formatMessage(m.failed, { error: body.error ?? "network" }));
      return;
    }
    setUrl(body.url ?? null);
    if (action === "off") toast.success(intl.formatMessage(m.turnedOff));
    await reload();
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(intl.formatMessage(m.copied));
    } catch {
      document.getElementById("feed-url")?.focus();
    }
  };

  return (
    <Panel
      title={intl.formatMessage(m.title)}
      description={intl.formatMessage(m.help)}
      actions={<Pill tone={isOn ? "success" : "muted"}>{intl.formatMessage(isOn ? m.on : m.off)}</Pill>}
    >
      <div className="flex flex-col gap-4">
        {url && (
          <>
            <Field label={intl.formatMessage(m.link)} htmlFor="feed-url">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="feed-url"
                  readOnly
                  className={`${inputClass} font-mono text-sm`}
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  spellCheck={false}
                />
                <Button variant="primary" onClick={copy}>
                  {intl.formatMessage(m.copy)}
                </Button>
              </div>
            </Field>
            <Notice tone="info">{intl.formatMessage(m.how)}</Notice>
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant={isOn ? "secondary" : "primary"} disabled={saving} onClick={() => change("new")}>
            {intl.formatMessage(isOn ? m.renew : m.create)}
          </Button>
          {isOn && (
            <Button variant="ghost" disabled={saving} onClick={() => change("off")}>
              {intl.formatMessage(m.turnOff)}
            </Button>
          )}
        </div>
        {isOn && !url && <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.renewHint)}</p>}
      </div>
    </Panel>
  );
}
