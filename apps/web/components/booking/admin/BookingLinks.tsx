import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";

import { supaClient } from "../../../supa-client";
import type { Database } from "../../../database.types";
import { Button, Panel, Pill } from "./ui";

// The booking links sent with paid orders, newest first. Turning a link off
// stops it working (for example after a refund); its booked calls stay until
// you cancel them. Turning it back on restores it. "Resend link" emails the
// buyer a fresh link when the order email went missing.

type Link = Database["public"]["Tables"]["booking_entitlements"]["Row"];

const m = defineMessages({
  title: { id: "booking-admin-links-title", description: "Booking admin: booking links heading", defaultMessage: "Booking links" },
  help: {
    id: "booking-admin-links-help",
    description: "Booking admin: what booking links are",
    defaultMessage: "One per paid order, sent in the order email. Turn a link off after a refund; calls already booked stay until you cancel them.",
  },
  empty: { id: "booking-admin-links-empty", description: "Booking admin: no booking links yet", defaultMessage: "No booking links yet. One is made with each paid 1:1 call." },
  noEmail: { id: "booking-admin-links-no-email", description: "Booking admin: link without a buyer email", defaultMessage: "No email" },
  bought: { id: "booking-admin-links-bought", description: "Booking admin: when the link was made", defaultMessage: "Bought {date}" },
  used: { id: "booking-admin-links-used", description: "Booking admin: calls booked of calls bought", defaultMessage: "{used} of {quantity} booked" },
  nudged: { id: "booking-admin-links-nudged", description: "Booking admin: a reminder to book was sent", defaultMessage: "Reminded {date}" },
  stateActive: { id: "booking-admin-links-state-active", description: "Booking admin: link works", defaultMessage: "Active" },
  stateOff: { id: "booking-admin-links-state-off", description: "Booking admin: link turned off", defaultMessage: "Turned off" },
  stateExpired: { id: "booking-admin-links-state-expired", description: "Booking admin: link expired", defaultMessage: "Expired" },
  turnOff: { id: "booking-admin-links-turn-off", description: "Booking admin: turn a link off", defaultMessage: "Turn off" },
  turnOn: { id: "booking-admin-links-turn-on", description: "Booking admin: turn a link back on", defaultMessage: "Turn back on" },
  turnOffFor: { id: "booking-admin-links-turn-off-for", description: "Booking admin: screen reader label, turn off one buyer's link", defaultMessage: "Turn off the link for {who}" },
  turnOnFor: { id: "booking-admin-links-turn-on-for", description: "Booking admin: screen reader label, turn one buyer's link back on", defaultMessage: "Turn back on the link for {who}" },
  loading: { id: "booking-admin-links-loading", description: "Booking admin: booking links are loading", defaultMessage: "Loading booking links" },
  turnedOff: { id: "booking-admin-links-turned-off", description: "Booking admin: toast after turning a link off", defaultMessage: "Link turned off" },
  turnedOn: { id: "booking-admin-links-turned-on", description: "Booking admin: toast after turning a link on", defaultMessage: "Link turned back on" },
  resend: { id: "booking-admin-links-resend", description: "Booking admin: email the buyer their link again", defaultMessage: "Resend link" },
  resendFor: { id: "booking-admin-links-resend-for", description: "Booking admin: screen reader label, resend one buyer's link", defaultMessage: "Resend link to {who}" },
  resent: { id: "booking-admin-links-resent", description: "Booking admin: toast after resending a link", defaultMessage: "Link sent to {email}" },
  resendFailed: { id: "booking-admin-links-resend-failed", description: "Booking admin: toast when resending fails", defaultMessage: "Couldn't send the link: {error}" },
  resendEmailFailed: {
    id: "booking-admin-links-resend-email-failed",
    description: "Booking admin: toast when the resend email didn't go out",
    defaultMessage: "The email didn't go out, so nothing changed. Try again in a minute.",
  },
  showMore: { id: "booking-admin-links-show-more", description: "Booking admin: load older links", defaultMessage: "Show older links" },
  failed: { id: "booking-admin-save-failed", description: "Booking admin: toast when saving fails", defaultMessage: "Couldn't save: {error}" },
});

const PAGE = 20;

export default function BookingLinks() {
  const intl = useIntl();
  const [links, setLinks] = useState<Link[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supaClient
      .from("booking_entitlements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit + 1);
    if (error) toast.error(intl.formatMessage(m.failed, { error: error.message }));
    setLinks(data ?? []);
  }, [limit, intl]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (link: Link) => {
    setBusy(link.id);
    const off = !link.revoked_at;
    const { error } = await supaClient
      .from("booking_entitlements")
      .update({ revoked_at: off ? new Date().toISOString() : null })
      .eq("id", link.id);
    setBusy(null);
    if (error) toast.error(intl.formatMessage(m.failed, { error: error.message }));
    else toast.success(intl.formatMessage(off ? m.turnedOff : m.turnedOn));
    await load();
  };

  const resend = async (link: Link) => {
    setBusy(link.id);
    const { data } = await supaClient.auth.getSession();
    const res = await fetch("/api/admin/booking-resend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ entitlementId: link.id }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (res?.ok) toast.success(intl.formatMessage(m.resent, { email: link.email }));
    else if (body.error === "email_failed") toast.error(intl.formatMessage(m.resendEmailFailed));
    else toast.error(intl.formatMessage(m.resendFailed, { error: body.error ?? "network" }));
    // A link can change state while the page is open (turned off, expired)
    if (!res?.ok) await load();
  };

  const date = (iso: string) => new Date(iso).toLocaleDateString(intl.locale, { day: "numeric", month: "short", year: "numeric" });
  const shown = (links ?? []).slice(0, limit);

  return (
    <Panel title={intl.formatMessage(m.title)} description={intl.formatMessage(m.help)}>
      {links === null ? (
        <div className="h-24 rounded-xl bg-[var(--surface-inset)] motion-safe:animate-pulse" role="status">
          <span className="sr-only">{intl.formatMessage(m.loading)}</span>
        </div>
      ) : !links.length ? (
        <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.empty)}</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
            {shown.map((link) => {
              const expired = !!link.expires_at && Date.parse(link.expires_at) <= Date.now();
              const state = link.revoked_at ? "off" : expired ? "expired" : "active";
              return (
                <li key={link.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-all">{link.email ?? intl.formatMessage(m.noEmail)}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {[
                        link.name,
                        intl.formatMessage(m.bought, { date: date(link.created_at) }),
                        intl.formatMessage(m.used, { used: link.used, quantity: link.quantity }),
                        link.nudged_at ? intl.formatMessage(m.nudged, { date: date(link.nudged_at) }) : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Pill tone={state === "active" ? "success" : state === "off" ? "danger" : "muted"}>
                    {intl.formatMessage(state === "active" ? m.stateActive : state === "off" ? m.stateOff : m.stateExpired)}
                  </Pill>
                  {state === "active" && link.email && (
                    <Button
                      disabled={busy === link.id}
                      aria-label={intl.formatMessage(m.resendFor, { who: link.email })}
                      onClick={() => resend(link)}
                    >
                      {intl.formatMessage(m.resend)}
                    </Button>
                  )}
                  <Button
                    variant={link.revoked_at ? "secondary" : "ghost"}
                    disabled={busy === link.id}
                    aria-label={intl.formatMessage(link.revoked_at ? m.turnOnFor : m.turnOffFor, {
                      who: link.email ?? link.name ?? intl.formatMessage(m.noEmail),
                    })}
                    onClick={() => toggle(link)}
                  >
                    {intl.formatMessage(link.revoked_at ? m.turnOn : m.turnOff)}
                  </Button>
                </li>
              );
            })}
          </ul>
          {links.length > limit && (
            <Button className="mt-3" onClick={() => setLimit(limit + PAGE)}>
              {intl.formatMessage(m.showMore)}
            </Button>
          )}
        </>
      )}
    </Panel>
  );
}
