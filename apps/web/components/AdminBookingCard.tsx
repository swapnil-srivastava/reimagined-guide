import React, { useEffect, useState } from "react";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { supaClient } from "../supa-client";
import { dayLabel, inZone, timeLabel } from "../lib/booking/format";

const m = defineMessages({
  title: { id: "admin-booking-card-title", description: "Admin booking card heading", defaultMessage: "Bookings" },
  next: { id: "admin-booking-card-next", description: "Admin booking card: next call", defaultMessage: "Next: {name}, {when}" },
  none: { id: "admin-booking-card-none", description: "Admin booking card: no upcoming calls", defaultMessage: "No upcoming calls." },
  count: {
    id: "admin-booking-card-count",
    description: "Admin booking card: number of upcoming calls",
    defaultMessage: "{count, plural, one {# upcoming call} other {# upcoming calls}}",
  },
  open: { id: "admin-booking-card-open", description: "Admin booking card: open the booking page", defaultMessage: "Manage calendar" },
});

interface NextCall {
  invitee_name: string;
  starts_at: string;
}

/** A summary of upcoming calls with a link to /admin/booking. Admins only. */
export default function AdminBookingCard() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [next, setNext] = useState<NextCall | null>(null);
  const [zone, setZone] = useState("Europe/Berlin");

  useEffect(() => {
    supaClient.rpc("is_admin").then(async ({ data }) => {
      if (data !== true) return;
      setIsAdmin(true);
      const nowIso = new Date().toISOString();
      const [upcoming, host] = await Promise.all([
        supaClient
          .from("bookings")
          .select("invitee_name, starts_at", { count: "exact" })
          .eq("status", "confirmed")
          .gte("ends_at", nowIso)
          .order("starts_at")
          .limit(1),
        supaClient.from("booking_hosts").select("timezone").eq("is_default", true).maybeSingle(),
      ]);
      if (upcoming.error) {
        // The booking migration hasn't been run yet
        console.error("Loading bookings failed", upcoming.error);
        return;
      }
      setCount(upcoming.count ?? 0);
      setNext(upcoming.data?.[0] ?? null);
      if (host.data?.timezone) setZone(host.data.timezone);
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-booking-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faCalendarDays} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="admin-booking-heading" className="text-xl font-bold">
              {intl.formatMessage(m.title)}
            </h2>
            <p className="text-sm opacity-80">
              {count === null ? " " : intl.formatMessage(m.count, { count })}
              {next && (
                <>
                  {" · "}
                  {intl.formatMessage(m.next, {
                    name: next.invitee_name,
                    when: `${dayLabel(inZone(next.starts_at, zone, intl.locale))} ${timeLabel(inZone(next.starts_at, zone, intl.locale))}`,
                  })}
                </>
              )}
              {count === 0 && ` · ${intl.formatMessage(m.none)}`}
            </p>
          </div>
        </div>
        <Link
          href="/admin/booking"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-semibold bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
        >
          {intl.formatMessage(m.open)}
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
