import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../components/AuthCheck";
import Metatags from "../../components/Metatags";
import { supaClient } from "../../supa-client";
import { useBookingAdmin } from "../../components/booking/admin/useBookingAdmin";
import UpcomingBookings from "../../components/booking/admin/UpcomingBookings";
import BlockTime from "../../components/booking/admin/BlockTime";
import WeeklyHours from "../../components/booking/admin/WeeklyHours";
import BookingSettings from "../../components/booking/admin/BookingSettings";
import { Notice, Panel, inputClass } from "../../components/booking/admin/ui";

// e.g. localhost:3000/admin/booking?tab=block
// Admins manage the booking calendar here: bookings, blocked time, weekly
// hours and the booking rules. Buyers book from the link in their order
// confirmation email.

const m = defineMessages({
  title: { id: "booking-admin-title", description: "Booking admin page heading", defaultMessage: "Bookings" },
  subtitle: {
    id: "booking-admin-subtitle",
    description: "Booking admin page subtitle",
    defaultMessage: "Your 1:1 call calendar: who booked, when you're free, and the time you've blocked.",
  },
  back: { id: "booking-admin-back", description: "Link back to the admin page", defaultMessage: "Admin" },
  tabs: { id: "booking-admin-tabs", description: "Booking admin: label of the tab list", defaultMessage: "Booking sections" },
  tabUpcoming: { id: "booking-admin-tab-upcoming", description: "Booking admin tab: bookings", defaultMessage: "Upcoming" },
  tabBlock: { id: "booking-admin-tab-block", description: "Booking admin tab: block time", defaultMessage: "Block time" },
  tabHours: { id: "booking-admin-tab-hours", description: "Booking admin tab: weekly hours", defaultMessage: "Weekly hours" },
  tabSettings: { id: "booking-admin-tab-settings", description: "Booking admin tab: settings", defaultMessage: "Settings" },
  host: { id: "booking-admin-host-picker", description: "Booking admin: choose whose calendar to manage", defaultMessage: "Calendar of" },
  notAdmin: { id: "booking-admin-not-admin", description: "Booking admin: shown to non-admins", defaultMessage: "Only admins can manage bookings." },
  loadFailed: {
    id: "booking-admin-load-failed",
    description: "Booking admin: data could not be loaded",
    defaultMessage: "Booking data couldn't be loaded ({error}). If this is the first time, the booking migration may not have been run yet.",
  },
  noHost: { id: "booking-admin-no-host", description: "Booking admin: no hosts exist", defaultMessage: "No host is set up yet. Run the booking migration to create one." },
});

const TABS = ["upcoming", "block", "hours", "settings"] as const;
type Tab = (typeof TABS)[number];

const AdminBooking: NextPage = () => {
  const intl = useIntl();
  const title = intl.formatMessage(m.title);
  return (
    <>
      <Metatags title={title} />
      <div className="font-poppins [&_button]:font-poppins [&_input]:font-poppins [&_select]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AuthCheck>
            <AdminOnly />
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function AdminOnly() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supaClient.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
  }, []);
  if (isAdmin === null) return <Skeleton />;
  if (!isAdmin) return <Panel>{intl.formatMessage(m.notAdmin)}</Panel>;
  return <BookingAdmin />;
}

function BookingAdmin() {
  const intl = useIntl();
  const router = useRouter();
  const { data, loading, error, reload } = useBookingAdmin();
  const [hostId, setHostId] = useState<string | null>(null);

  const queryTab = typeof router.query.tab === "string" ? router.query.tab : "";
  const tab: Tab = (TABS as readonly string[]).includes(queryTab) ? (queryTab as Tab) : "upcoming";
  const setTab = (next: Tab) =>
    router.replace({ pathname: router.pathname, query: next === "upcoming" ? {} : { tab: next } }, undefined, { shallow: true, scroll: false });

  const host = data.hosts.find((h) => h.id === hostId) ?? data.hosts.find((h) => h.is_default) ?? data.hosts[0] ?? null;
  // The booking type this host offers (the 1:1 call for now)
  const typeIds = data.typeHosts.filter((t) => host && t.host_id === host.id).map((t) => t.booking_type_id);
  const type = data.types.find((t) => typeIds.includes(t.id)) ?? data.types[0] ?? null;

  const labels: Record<Tab, string> = {
    upcoming: intl.formatMessage(m.tabUpcoming),
    block: intl.formatMessage(m.tabBlock),
    hours: intl.formatMessage(m.tabHours),
    settings: intl.formatMessage(m.tabSettings),
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length]);
    if (e.key === "ArrowLeft") setTab(TABS[(i + TABS.length - 1) % TABS.length]);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
          {intl.formatMessage(m.back)}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faCalendarDays} className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title)}</h1>
              <p className="text-sm text-[var(--text-muted)] max-w-xl">{intl.formatMessage(m.subtitle)}</p>
            </div>
          </div>
          {data.hosts.length > 1 && host && (
            <label className="flex flex-col gap-1 text-sm font-semibold w-full sm:w-64">
              {intl.formatMessage(m.host)}
              <select className={inputClass} value={host.id} onChange={(e) => setHostId(e.target.value)}>
                {data.hosts.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div
          role="tablist"
          aria-label={intl.formatMessage(m.tabs)}
          onKeyDown={onTabKey}
          className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] p-1"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`booking-tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`booking-panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap min-h-[44px] px-4 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                tab === t
                  ? "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] shadow"
                  : "text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
              }`}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      </header>

      {error && <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error })}</Notice>}

      <div role="tabpanel" id={`booking-panel-${tab}`} aria-labelledby={`booking-tab-${tab}`}>
        {loading ? (
          <Skeleton />
        ) : !host ? (
          <Panel>{intl.formatMessage(m.noHost)}</Panel>
        ) : tab === "upcoming" ? (
          <UpcomingBookings host={host} types={data.types} data={data} reload={reload} />
        ) : tab === "block" ? (
          <BlockTime host={host} data={data} reload={reload} onShowBookings={() => setTab("upcoming")} />
        ) : tab === "hours" ? (
          <WeeklyHours host={host} data={data} reload={reload} />
        ) : (
          <BookingSettings host={host} type={type} data={data} reload={reload} />
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-12 rounded-xl bg-[var(--surface-inset)] animate-pulse" />
      <div className="h-64 rounded-2xl bg-[var(--surface-inset)] animate-pulse" />
    </div>
  );
}

export default AdminBooking;
