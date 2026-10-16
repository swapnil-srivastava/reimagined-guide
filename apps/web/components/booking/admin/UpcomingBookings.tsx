import React, { useState } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarXmark, faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../../../supa-client";
import { dayLabel, inZone, longDayLabel, rangeLabel, timeLabel } from "../../../lib/booking/format";
import type { Booking, BookingHost, BookingStatus, BookingType } from "../../../lib/booking/types";
import type { BookingAdminData } from "./useBookingAdmin";
import { Button, ChipGroup, Field, Notice, Panel, Pill, inputClass } from "./ui";

const m = defineMessages({
  title: { id: "booking-admin-upcoming-title", description: "Booking admin: bookings list heading", defaultMessage: "Bookings" },
  timesIn: { id: "booking-admin-times-in", description: "Booking admin: which time zone times are shown in", defaultMessage: "Times in {zone}" },
  filterUpcoming: { id: "booking-admin-filter-upcoming", description: "Booking admin filter: upcoming", defaultMessage: "Upcoming" },
  filterPast: { id: "booking-admin-filter-past", description: "Booking admin filter: past", defaultMessage: "Past" },
  filterCancelled: { id: "booking-admin-filter-cancelled", description: "Booking admin filter: cancelled", defaultMessage: "Cancelled" },
  filterAll: { id: "booking-admin-filter-all", description: "Booking admin filter: all", defaultMessage: "All" },
  empty: { id: "booking-admin-bookings-empty", description: "Booking admin: no bookings", defaultMessage: "No bookings here yet." },
  emptyUpcoming: {
    id: "booking-admin-bookings-empty-upcoming",
    description: "Booking admin: no upcoming bookings",
    defaultMessage: "No upcoming calls. Buyers book from the link in their order confirmation email.",
  },
  theirTime: { id: "booking-admin-their-time", description: "Booking admin: buyer's local time", defaultMessage: "{time} for them ({zone})" },
  order: { id: "booking-admin-booking-order", description: "Booking admin: order number of a booking", defaultMessage: "Order {number}" },
  notes: { id: "booking-admin-booking-notes", description: "Booking admin: buyer's notes label", defaultMessage: "Notes" },
  cancel: { id: "booking-admin-booking-cancel", description: "Booking admin: cancel a booking", defaultMessage: "Cancel call" },
  cancelReason: { id: "booking-admin-booking-cancel-reason", description: "Booking admin: reason for cancelling", defaultMessage: "Reason (shown to the buyer)" },
  cancelConfirm: { id: "booking-admin-booking-cancel-confirm", description: "Booking admin: confirm cancelling", defaultMessage: "Cancel this call" },
  keep: { id: "booking-admin-booking-keep", description: "Booking admin: don't cancel", defaultMessage: "Keep it" },
  cancelNote: {
    id: "booking-admin-booking-cancel-note",
    description: "Booking admin: what cancelling does",
    defaultMessage: "The buyer gets an email, the call goes back on their link and they can pick a new time.",
  },
  cancelled: { id: "booking-admin-booking-cancelled-toast", description: "Booking admin: toast after cancelling", defaultMessage: "Call cancelled" },
  cancelledNoEmail: {
    id: "booking-admin-booking-cancelled-no-email",
    description: "Booking admin: toast when the call was cancelled but an email failed",
    defaultMessage: "Call cancelled, but the cancellation email didn't send. Please let the buyer know yourself.",
  },
  completed: { id: "booking-admin-booking-mark-completed", description: "Booking admin: mark a past call as done", defaultMessage: "Mark as done" },
  noShow: { id: "booking-admin-booking-mark-no-show", description: "Booking admin: mark a past call as no-show", defaultMessage: "No-show" },
  saved: { id: "booking-admin-booking-saved", description: "Booking admin: toast after updating a booking", defaultMessage: "Booking updated" },
  saveFailed: { id: "booking-admin-save-failed", description: "Booking admin: toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  statusConfirmed: { id: "booking-admin-status-confirmed", description: "Booking status: confirmed", defaultMessage: "Confirmed" },
  statusCancelled: { id: "booking-admin-status-cancelled", description: "Booking status: cancelled", defaultMessage: "Cancelled" },
  statusCompleted: { id: "booking-admin-status-completed", description: "Booking status: completed", defaultMessage: "Done" },
  statusNoShow: { id: "booking-admin-status-no-show", description: "Booking status: no-show", defaultMessage: "No-show" },
  cancelledBy: {
    id: "booking-admin-cancelled-by",
    description: "Booking admin: who cancelled",
    defaultMessage: "{who, select, host {Cancelled by you} invitee {Cancelled by the buyer} refund {Cancelled by a refund} other {Cancelled}}{reason, select, none {} other {: {reason}}}",
  },
});

type Filter = "upcoming" | "past" | "cancelled" | "all";

const STATUS_TONE: Record<BookingStatus, "success" | "danger" | "info" | "muted"> = {
  confirmed: "success",
  cancelled: "danger",
  completed: "info",
  no_show: "muted",
};

interface Props {
  host: BookingHost;
  types: BookingType[];
  data: BookingAdminData;
  reload: () => Promise<void>;
}

export default function UpcomingBookings({ host, types, data, reload }: Props) {
  const intl = useIntl();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const now = Date.now();

  const all = data.bookings.filter((b) => b.host_id === host.id);
  const shown = all
    .filter((b) => {
      const ended = DateTime.fromISO(b.ends_at).toMillis() <= now;
      if (filter === "upcoming") return b.status === "confirmed" && !ended;
      if (filter === "past") return b.status !== "cancelled" && ended;
      if (filter === "cancelled") return b.status === "cancelled";
      return true;
    })
    .sort((a, b) => (filter === "upcoming" ? a.starts_at.localeCompare(b.starts_at) : b.starts_at.localeCompare(a.starts_at)));

  // Grouped by the host's calendar day
  const groups: { day: string; items: Booking[] }[] = [];
  for (const booking of shown) {
    const day = inZone(booking.starts_at, host.timezone).toISODate() as string;
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(booking);
    else groups.push({ day, items: [booking] });
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "upcoming", label: intl.formatMessage(m.filterUpcoming) },
    { value: "past", label: intl.formatMessage(m.filterPast) },
    { value: "cancelled", label: intl.formatMessage(m.filterCancelled) },
    { value: "all", label: intl.formatMessage(m.filterAll) },
  ];

  return (
    <Panel
      title={intl.formatMessage(m.title)}
      description={intl.formatMessage(m.timesIn, { zone: host.timezone })}
      actions={<ChipGroup<Filter> label={intl.formatMessage(m.title)} options={filters} value={filter} onChange={setFilter} />}
    >
      {groups.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-10 text-[var(--text-muted)]">
          <FontAwesomeIcon icon={faCalendarXmark} className="w-8 h-8" aria-hidden="true" />
          <p>{intl.formatMessage(filter === "upcoming" ? m.emptyUpcoming : m.empty)}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.day} aria-label={group.day}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                {longDayLabel(DateTime.fromISO(group.day).setLocale(intl.locale))}
              </h3>
              <ul className="flex flex-col gap-3">
                {group.items.map((booking) => (
                  <BookingItem
                    key={booking.id}
                    booking={booking}
                    host={host}
                    type={types.find((t) => t.id === booking.booking_type_id) ?? null}
                    reload={reload}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Panel>
  );
}

function BookingItem({ booking, host, type, reload }: { booking: Booking; host: BookingHost; type: BookingType | null; reload: () => Promise<void> }) {
  const intl = useIntl();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const start = inZone(booking.starts_at, host.timezone, intl.locale);
  const end = inZone(booking.ends_at, host.timezone, intl.locale);
  const ended = end.toMillis() <= Date.now();
  const status = booking.status as BookingStatus;
  const theirZone = booking.invitee_timezone;
  const showTheirs = theirZone && inZone(booking.starts_at, theirZone).offset !== start.offset;

  const statusText = {
    confirmed: intl.formatMessage(m.statusConfirmed),
    cancelled: intl.formatMessage(m.statusCancelled),
    completed: intl.formatMessage(m.statusCompleted),
    no_show: intl.formatMessage(m.statusNoShow),
  }[status];

  const fail = (error: { message: string } | null) => {
    if (!error) return false;
    toast.error(intl.formatMessage(m.saveFailed, { error: error.message }));
    return true;
  };

  const cancel = async () => {
    setSaving(true);
    // Through the API, so the buyer gets an email and a calendar update
    const { data } = await supaClient.auth.getSession();
    const res = await fetch("/api/admin/booking-cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ bookingId: booking.id, reason: reason.trim() || null }),
    }).catch(() => null);
    setSaving(false);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (!fail(res?.ok ? null : { message: body.error ?? "network" })) {
      if (body.emailed === false) toast.error(intl.formatMessage(m.cancelledNoEmail), { duration: 8000 });
      else toast.success(intl.formatMessage(m.cancelled));
      setCancelling(false);
    }
    await reload();
  };

  const mark = async (next: BookingStatus) => {
    setSaving(true);
    const { error } = await supaClient.from("bookings").update({ status: next }).eq("id", booking.id);
    setSaving(false);
    if (!fail(error)) toast.success(intl.formatMessage(m.saved));
    await reload();
  };

  return (
    <li className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <div className="sm:w-40 shrink-0">
          <p className="text-lg font-bold tabular-nums">{rangeLabel(start, end)}</p>
          {showTheirs && (
            <p className="text-xs text-[var(--text-muted)]">
              {intl.formatMessage(m.theirTime, {
                time: `${dayLabel(inZone(booking.starts_at, theirZone, intl.locale))} ${timeLabel(inZone(booking.starts_at, theirZone, intl.locale))}`,
                zone: theirZone.replace(/_/g, " "),
              })}
            </p>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold flex flex-wrap items-center gap-2">
            {booking.invitee_name}
            <Pill tone={STATUS_TONE[status]}>{statusText}</Pill>
          </p>
          <a href={`mailto:${booking.invitee_email}`} className="text-sm underline break-all inline-flex items-center gap-1.5">
            <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" aria-hidden="true" />
            {booking.invitee_email}
          </a>
          <p className="text-sm text-[var(--text-muted)]">
            {[type?.name, booking.order_id ? intl.formatMessage(m.order, { number: booking.order_id.slice(0, 8).toUpperCase() }) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {booking.notes && (
            <p className="text-sm mt-2 whitespace-pre-wrap">
              <span className="font-semibold">{intl.formatMessage(m.notes)}: </span>
              {booking.notes}
            </p>
          )}
          {status === "cancelled" && (
            <p className="text-sm mt-2 text-[var(--text-muted)]">
              {intl.formatMessage(m.cancelledBy, { who: booking.cancelled_by ?? "other", reason: booking.cancel_reason || "none" })}
            </p>
          )}
        </div>
        {status === "confirmed" && !cancelling && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {ended ? (
              <>
                <Button disabled={saving} onClick={() => mark("completed")}>{intl.formatMessage(m.completed)}</Button>
                <Button disabled={saving} onClick={() => mark("no_show")}>{intl.formatMessage(m.noShow)}</Button>
              </>
            ) : (
              <Button variant="ghost" disabled={saving} onClick={() => setCancelling(true)}>{intl.formatMessage(m.cancel)}</Button>
            )}
          </div>
        )}
      </div>
      {cancelling && (
        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-3">
          <Field label={intl.formatMessage(m.cancelReason)} htmlFor={`cancel-${booking.id}`}>
            <textarea id={`cancel-${booking.id}`} rows={2} maxLength={500} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <Notice tone="info">{intl.formatMessage(m.cancelNote)}</Notice>
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" disabled={saving} onClick={cancel}>{intl.formatMessage(m.cancelConfirm)}</Button>
            <Button variant="ghost" disabled={saving} onClick={() => setCancelling(false)}>{intl.formatMessage(m.keep)}</Button>
          </div>
        </div>
      )}
    </li>
  );
}
