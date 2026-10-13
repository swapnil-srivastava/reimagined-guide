import React, { useMemo, useState } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../../../supa-client";
import { openRangesForDate, wallClock } from "../../../lib/booking/slots";
import { dayLabel, durationLabel, inZone, longDayLabel, rangeLabel, timeLabel } from "../../../lib/booking/format";
import type { Booking, BookingBlock, BookingHost } from "../../../lib/booking/types";
import type { BookingAdminData } from "./useBookingAdmin";
import { Button, ChipGroup, Field, Notice, Panel, inputClass } from "./ui";

const m = defineMessages({
  calendarTitle: { id: "booking-admin-block-calendar-title", description: "Booking admin: week calendar heading", defaultMessage: "Your week" },
  calendarHelp: {
    id: "booking-admin-block-calendar-help",
    description: "Booking admin: how to block time on the calendar",
    defaultMessage: "Tap a half hour to select it, tap another one on the same day to select everything in between, then block it. Tap blocked time to unblock it.",
  },
  previousWeek: { id: "booking-admin-block-prev-week", description: "Booking admin: previous week button label", defaultMessage: "Previous week" },
  nextWeek: { id: "booking-admin-block-next-week", description: "Booking admin: next week button label", defaultMessage: "Next week" },
  today: { id: "booking-admin-block-today", description: "Booking admin: jump to this week", defaultMessage: "Today" },
  wholeDay: { id: "booking-admin-block-show-whole-day", description: "Booking admin: show 24 hours in the calendar", defaultMessage: "Show 24 hours" },
  open: { id: "booking-admin-cell-open", description: "Booking admin: calendar cell that can be booked", defaultMessage: "open" },
  closed: { id: "booking-admin-cell-closed", description: "Booking admin: calendar cell outside working hours", defaultMessage: "outside your hours" },
  blocked: { id: "booking-admin-cell-blocked", description: "Booking admin: calendar cell that is blocked", defaultMessage: "Blocked" },
  booked: { id: "booking-admin-cell-booked", description: "Booking admin: calendar cell that is booked", defaultMessage: "booked by {name}" },
  past: { id: "booking-admin-cell-past", description: "Booking admin: calendar cell in the past", defaultMessage: "past" },
  legendOpen: { id: "booking-admin-legend-open", description: "Booking admin legend: open time", defaultMessage: "Open" },
  legendClosed: { id: "booking-admin-legend-closed", description: "Booking admin legend: outside hours", defaultMessage: "Outside hours" },
  legendBlocked: { id: "booking-admin-legend-blocked", description: "Booking admin legend: blocked", defaultMessage: "Blocked" },
  legendBooked: { id: "booking-admin-legend-booked", description: "Booking admin legend: booked", defaultMessage: "Booked" },
  selection: { id: "booking-admin-selection", description: "Booking admin: the selected time range", defaultMessage: "{day}, {range} ({length})" },
  block: { id: "booking-admin-block-button", description: "Booking admin: block the selected time", defaultMessage: "Block" },
  blockAnyway: { id: "booking-admin-block-anyway", description: "Booking admin: block even though it overlaps a booking", defaultMessage: "Block anyway" },
  clear: { id: "booking-admin-clear-selection", description: "Booking admin: clear the selection", defaultMessage: "Clear" },
  reason: { id: "booking-admin-block-reason", description: "Booking admin: optional reason for a block", defaultMessage: "Reason (only you see it)" },
  reasonPlaceholder: { id: "booking-admin-block-reason-placeholder", description: "Booking admin: example reason", defaultMessage: "e.g. Dentist" },
  overlap: {
    id: "booking-admin-block-overlap",
    description: "Booking admin: warning that a block covers an existing booking",
    defaultMessage: "This covers {count, plural, one {a booking} other {# bookings}}: {list}. The booking stays; cancel it in Upcoming if you want it gone.",
  },
  blockedInfo: { id: "booking-admin-blocked-info", description: "Booking admin: details of a blocked range", defaultMessage: "Blocked {day}, {range}" },
  bookedInfo: { id: "booking-admin-booked-info", description: "Booking admin: details of a booking", defaultMessage: "{name} booked {day}, {range}" },
  unblockAll: { id: "booking-admin-unblock-all", description: "Booking admin: remove the whole block", defaultMessage: "Unblock all of it" },
  unblockCell: { id: "booking-admin-unblock-cell", description: "Booking admin: remove only this half hour from a block", defaultMessage: "Unblock {range} only" },
  unblock: { id: "booking-admin-unblock", description: "Booking admin: remove a block", defaultMessage: "Unblock" },
  seeBooking: { id: "booking-admin-see-booking", description: "Booking admin: open the bookings list", defaultMessage: "See in Upcoming" },
  saved: { id: "booking-admin-block-saved", description: "Booking admin: toast after blocking", defaultMessage: "Time blocked" },
  removed: { id: "booking-admin-block-removed", description: "Booking admin: toast after unblocking", defaultMessage: "Time unblocked" },
  saveFailed: { id: "booking-admin-save-failed", description: "Booking admin: toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  formTitle: { id: "booking-admin-block-form-title", description: "Booking admin: precise block form heading", defaultMessage: "Block time to the minute" },
  formHelp: {
    id: "booking-admin-block-form-help",
    description: "Booking admin: what the precise block form is for",
    defaultMessage: "For anything the calendar can't tap: 15 minutes, a whole day, or several days.",
  },
  date: { id: "booking-admin-block-date", description: "Booking admin: block start date", defaultMessage: "Date" },
  from: { id: "booking-admin-block-from", description: "Booking admin: block start time", defaultMessage: "From" },
  length: { id: "booking-admin-block-length", description: "Booking admin: how long to block", defaultMessage: "How long" },
  lengthRest: { id: "booking-admin-block-rest-of-day", description: "Booking admin: block until midnight", defaultMessage: "Rest of the day" },
  lengthDay: { id: "booking-admin-block-whole-day", description: "Booking admin: block the whole day", defaultMessage: "Whole day" },
  lengthCustom: { id: "booking-admin-block-until", description: "Booking admin: block until a chosen date and time", defaultMessage: "Until…" },
  untilDate: { id: "booking-admin-block-until-date", description: "Booking admin: block end date", defaultMessage: "Until date" },
  untilTime: { id: "booking-admin-block-until-time", description: "Booking admin: block end time", defaultMessage: "Until time" },
  preview: { id: "booking-admin-block-preview", description: "Booking admin: what will be blocked", defaultMessage: "Blocks {from} to {to} ({length})" },
  invalid: { id: "booking-admin-block-invalid", description: "Booking admin: end is before start", defaultMessage: "The end has to be after the start." },
  inPast: { id: "booking-admin-block-in-past", description: "Booking admin: block entirely in the past", defaultMessage: "That time has already passed." },
  listTitle: { id: "booking-admin-blocks-title", description: "Booking admin: list of upcoming blocks", defaultMessage: "Upcoming blocks" },
  listEmpty: { id: "booking-admin-blocks-empty", description: "Booking admin: no upcoming blocks", defaultMessage: "Nothing blocked. Your weekly hours apply." },
  allDay: { id: "booking-admin-block-all-day", description: "Booking admin: a block covering a whole day", defaultMessage: "All day" },
  timesIn: { id: "booking-admin-times-in", description: "Booking admin: which time zone times are shown in", defaultMessage: "Times in {zone}" },
});

const CELL = 30;

// Open time is a solid tile with a clear border; time outside your hours is
// striped, so the two read apart in light and dark themes alike
const OPEN_CELL =
  "bg-[var(--surface-raised)] border-[color-mix(in_srgb,var(--text-primary)_35%,transparent)] " +
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,var(--bg-primary))]";
const CLOSED_CELL =
  "bg-[color-mix(in_srgb,var(--text-primary)_5%,var(--bg-primary))] border-transparent text-[var(--text-muted)] " +
  "[background-image:repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_srgb,var(--text-primary)_12%,transparent)_6px_8px)]";

type Length = "15" | "30" | "60" | "120" | "rest" | "day" | "custom";

interface Selection {
  day: string; // ISO date in the host zone
  from: number; // minutes since midnight
  to: number; // exclusive
}

type Focus = { kind: "block"; block: BookingBlock; cellStart: DateTime; cellEnd: DateTime } | { kind: "booking"; booking: Booking };

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;
const ms = (iso: string) => DateTime.fromISO(iso).toMillis();

/** Confirmed bookings that overlap [start, end) */
function bookingsIn(bookings: Booking[], start: DateTime, end: DateTime) {
  return bookings.filter(
    (b) => b.status === "confirmed" && overlaps(start.toMillis(), end.toMillis(), ms(b.starts_at), ms(b.ends_at))
  );
}

interface Props {
  host: BookingHost;
  data: BookingAdminData;
  reload: () => Promise<void>;
  onShowBookings: () => void;
}

export default function BlockTime({ host, data, reload, onShowBookings }: Props) {
  const intl = useIntl();
  const tz = host.timezone;
  const locale = intl.locale;
  const now = DateTime.now().setZone(tz).setLocale(locale);

  const [weekStart, setWeekStart] = useState(() => now.startOf("week"));
  const [selectedDay, setSelectedDay] = useState(() => now.toISODate() as string);
  const [showAll, setShowAll] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const weeklyHours = data.weeklyHours.filter((w) => w.host_id === host.id);
  const overrides = data.overrides.filter((o) => o.host_id === host.id);
  const blocks = data.blocks.filter((b) => b.host_id === host.id);
  const bookings = data.bookings.filter((b) => b.host_id === host.id && b.status === "confirmed");

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i })), [weekStart]);

  // Rows from 08:00 to 20:00, stretched to cover the weekly hours
  const [gridFrom, gridTo] = useMemo(() => {
    if (showAll) return [0, 1440];
    let from = 8 * 60;
    let to = 20 * 60;
    for (const w of weeklyHours) {
      const [sh, sm] = w.start_time.split(":").map(Number);
      const [eh, em] = w.end_time.split(":").map(Number);
      from = Math.min(from, Math.floor((sh * 60 + sm) / CELL) * CELL);
      to = Math.max(to, Math.ceil((eh * 60 + em) / CELL) * CELL);
    }
    return [from, to];
  }, [showAll, weeklyHours]);

  const rows = useMemo(() => {
    const list: number[] = [];
    for (let min = gridFrom; min < gridTo; min += CELL) list.push(min);
    return list;
  }, [gridFrom, gridTo]);

  const fail = (error: { message: string } | null) => {
    if (!error) return false;
    toast.error(intl.formatMessage(m.saveFailed, { error: error.message }));
    return true;
  };

  const insertBlock = async (start: DateTime, end: DateTime, why: string) => {
    setSaving(true);
    const { error } = await supaClient.from("booking_blocks").insert({
      host_id: host.id,
      starts_at: start.toUTC().toISO() as string,
      ends_at: end.toUTC().toISO() as string,
      reason: why.trim() || null,
    });
    setSaving(false);
    if (fail(error)) return false;
    toast.success(intl.formatMessage(m.saved));
    await reload();
    return true;
  };

  const deleteBlock = async (block: BookingBlock) => {
    setSaving(true);
    const { error } = await supaClient.from("booking_blocks").delete().eq("id", block.id);
    setSaving(false);
    if (fail(error)) return;
    toast.success(intl.formatMessage(m.removed));
    setFocus(null);
    await reload();
  };

  /** Removes one half hour from a longer block, keeping the parts either side */
  const unblockCell = async (block: BookingBlock, cellStart: DateTime, cellEnd: DateTime) => {
    const pieces: { starts_at: string; ends_at: string }[] = [];
    if (ms(block.starts_at) < cellStart.toMillis()) {
      pieces.push({ starts_at: block.starts_at, ends_at: cellStart.toUTC().toISO() as string });
    }
    if (ms(block.ends_at) > cellEnd.toMillis()) {
      pieces.push({ starts_at: cellEnd.toUTC().toISO() as string, ends_at: block.ends_at });
    }
    setSaving(true);
    if (pieces.length) {
      const { error } = await supaClient
        .from("booking_blocks")
        .insert(pieces.map((p) => ({ ...p, host_id: block.host_id, reason: block.reason })));
      if (fail(error)) {
        setSaving(false);
        return;
      }
    }
    const { error } = await supaClient.from("booking_blocks").delete().eq("id", block.id);
    setSaving(false);
    if (fail(error)) return;
    toast.success(intl.formatMessage(m.removed));
    setFocus(null);
    await reload();
  };

  const cellInfo = (day: DateTime, min: number) => {
    const start = wallClock(day, min);
    if (!start) return null; // the hour skipped when clocks go forward
    const end = start.plus({ minutes: CELL });
    const s = start.toMillis();
    const e = end.toMillis();
    const booking = bookings.find((b) => overlaps(s, e, ms(b.starts_at), ms(b.ends_at)));
    const block = blocks.find((b) => overlaps(s, e, ms(b.starts_at), ms(b.ends_at)));
    const open = openRangesForDate(day, weeklyHours, overrides).some(([from, to]) => min >= from && min + CELL <= to);
    return { start, end, booking, block, open, past: e <= now.toMillis() };
  };

  const onCell = (day: DateTime, min: number) => {
    const info = cellInfo(day, min);
    if (!info) return;
    const iso = day.toISODate() as string;
    if (info.booking) {
      setSelection(null);
      setFocus({ kind: "booking", booking: info.booking });
      return;
    }
    if (info.block) {
      setSelection(null);
      setFocus({ kind: "block", block: info.block, cellStart: info.start, cellEnd: info.end });
      return;
    }
    setFocus(null);
    if (selection && selection.day === iso) {
      if (selection.from === min && selection.to === min + CELL) {
        setSelection(null);
        return;
      }
      setSelection({ day: iso, from: Math.min(selection.from, min), to: Math.max(selection.to, min + CELL) });
      return;
    }
    setSelection({ day: iso, from: min, to: min + CELL });
  };

  const selectionRange = useMemo(() => {
    if (!selection) return null;
    const day = DateTime.fromISO(selection.day, { zone: tz }).setLocale(locale);
    const start = wallClock(day, selection.from) ?? wallClock(day, selection.from + 60);
    const end = wallClock(day, selection.to) ?? wallClock(day, selection.to + 60);
    if (!start || !end) return null;
    return { day, start, end };
  }, [selection, tz, locale]);

  const selectionOverlaps = selectionRange ? bookingsIn(bookings, selectionRange.start, selectionRange.end) : [];

  const bookingList = (list: Booking[]) =>
    list
      .map((b) => `${b.invitee_name} ${timeLabel(inZone(b.starts_at, tz, locale))}`)
      .join(", ");

  const weekLabel = `${days[0].toLocaleString({ day: "numeric", month: "short" })} – ${days[6].toLocaleString({
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title={intl.formatMessage(m.calendarTitle)}
        description={
          <>
            {intl.formatMessage(m.calendarHelp)} {intl.formatMessage(m.timesIn, { zone: tz })}
          </>
        }
      >
        {/* Week navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button
            variant="ghost"
            aria-label={intl.formatMessage(m.previousWeek)}
            onClick={() => {
              setWeekStart(weekStart.minus({ weeks: 1 }));
              setSelectedDay(weekStart.minus({ weeks: 1 }).toISODate() as string);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
          </Button>
          <span className="font-semibold tabular-nums">{weekLabel}</span>
          <Button
            variant="ghost"
            aria-label={intl.formatMessage(m.nextWeek)}
            onClick={() => {
              setWeekStart(weekStart.plus({ weeks: 1 }));
              setSelectedDay(weekStart.plus({ weeks: 1 }).toISODate() as string);
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
          </Button>
          <Button
            onClick={() => {
              setWeekStart(now.startOf("week"));
              setSelectedDay(now.toISODate() as string);
            }}
          >
            {intl.formatMessage(m.today)}
          </Button>
          <label className="ml-auto flex items-center gap-2 text-sm min-h-[44px] cursor-pointer">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="w-4 h-4" />
            {intl.formatMessage(m.wholeDay)}
          </label>
        </div>

        {/* Day picker on phones */}
        <div className="md:hidden grid grid-cols-7 gap-1 mb-3" role="tablist">
          {days.map((day) => {
            const iso = day.toISODate() as string;
            const active = iso === selectedDay;
            const hasBooking = bookings.some((b) => inZone(b.starts_at, tz).toISODate() === iso);
            return (
              <button
                key={iso}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDay(iso)}
                className={`flex flex-col items-center justify-center rounded-lg min-h-[52px] text-xs font-medium border ${
                  active
                    ? "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] border-transparent"
                    : "border-[var(--border-subtle)] bg-[var(--surface-inset)]"
                }`}
              >
                <span>{day.toLocaleString({ weekday: "short" })}</span>
                <span className="text-base font-bold tabular-nums">{day.day}</span>
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${hasBooking ? (active ? "bg-white" : "bg-[var(--color-primary)]") : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" aria-hidden="true">
          <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm border ${OPEN_CELL}`} />{intl.formatMessage(m.legendOpen)}</span>
          <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${CLOSED_CELL}`} />{intl.formatMessage(m.legendClosed)}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[color-mix(in_srgb,var(--status-danger)_45%,var(--bg-primary))]" />{intl.formatMessage(m.legendBlocked)}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--color-primary-deep)]" />{intl.formatMessage(m.legendBooked)}</span>
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          <div className="hidden md:flex flex-col w-14 shrink-0 text-xs text-[var(--text-muted)] tabular-nums">
            <div className="h-10" />
            {rows.map((min) => (
              <div key={min} className="h-8 mb-px flex items-start justify-end pr-1">
                {min % 60 === 0 ? DateTime.fromObject({ hour: min / 60 }, { locale }).toLocaleString({ hour: "numeric" }) : ""}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const iso = day.toISODate() as string;
            const isToday = iso === now.toISODate();
            let previousKey = "";
            return (
              <div key={iso} className={`${iso === selectedDay ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}>
                <div
                  className={`h-10 hidden md:flex flex-col items-center justify-center text-xs font-semibold rounded-t-lg ${
                    isToday ? "text-[var(--color-primary)]" : ""
                  }`}
                >
                  <span>{day.toLocaleString({ weekday: "short" })}</span>
                  <span className="tabular-nums">{day.toLocaleString({ day: "numeric", month: "short" })}</span>
                </div>
                {rows.map((min) => {
                  const info = cellInfo(day, min);
                  if (!info) return <div key={min} className="h-11 md:h-8 mb-px" />;
                  const key = info.booking ? `b${info.booking.id}` : info.block ? `x${info.block.id}` : "";
                  const first = key !== "" && key !== previousKey;
                  previousKey = key;
                  const selected = selection?.day === iso && min >= selection.from && min < selection.to;
                  const label = info.booking
                    ? intl.formatMessage(m.booked, { name: info.booking.invitee_name })
                    : info.block
                    ? intl.formatMessage(m.blocked)
                    : info.open
                    ? intl.formatMessage(m.open)
                    : intl.formatMessage(m.closed);
                  const tone = info.booking
                    ? "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] border-transparent"
                    : info.block
                    ? "bg-[color-mix(in_srgb,var(--status-danger)_45%,var(--bg-primary))] border-transparent"
                    : selected
                    ? "bg-[color-mix(in_srgb,var(--status-info)_45%,var(--bg-primary))] border-[var(--text-primary)] border-2"
                    : info.open
                    ? OPEN_CELL
                    : CLOSED_CELL;
                  return (
                    <button
                      key={min}
                      type="button"
                      disabled={info.past || saving}
                      onClick={() => onCell(day, min)}
                      aria-pressed={selected}
                      aria-label={`${dayLabel(day)} ${timeLabel(info.start)}, ${label}${info.past ? `, ${intl.formatMessage(m.past)}` : ""}`}
                      className={`h-11 md:h-8 border rounded-md mb-px text-left px-1.5 text-[11px] leading-tight truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed ${tone} ${
                        info.past ? "opacity-40" : ""
                      }`}
                    >
                      <span className="md:hidden tabular-nums mr-1 opacity-80">{timeLabel(info.start)}</span>
                      {first && (info.booking ? info.booking.invitee_name : info.block ? info.block.reason || intl.formatMessage(m.blocked) : "")}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Action bar */}
        {(selectionRange || focus) && (
          <div className="sticky bottom-2 z-10 mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-lg p-3 sm:p-4 flex flex-col gap-3">
            {selectionRange && (
              <>
                <p className="font-semibold">
                  {intl.formatMessage(m.selection, {
                    day: dayLabel(selectionRange.day),
                    range: rangeLabel(selectionRange.start, selectionRange.end),
                    length: durationLabel(selectionRange.end.diff(selectionRange.start, "minutes").minutes),
                  })}
                </p>
                <Field label={intl.formatMessage(m.reason)} htmlFor="grid-block-reason">
                  <input
                    id="grid-block-reason"
                    className={inputClass}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={intl.formatMessage(m.reasonPlaceholder)}
                    maxLength={200}
                  />
                </Field>
                {selectionOverlaps.length > 0 && (
                  <Notice tone="warning">
                    {intl.formatMessage(m.overlap, { count: selectionOverlaps.length, list: bookingList(selectionOverlaps) })}
                  </Notice>
                )}
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="primary"
                    disabled={saving}
                    onClick={async () => {
                      if (await insertBlock(selectionRange.start, selectionRange.end, reason)) {
                        setSelection(null);
                        setReason("");
                      }
                    }}
                  >
                    {intl.formatMessage(selectionOverlaps.length ? m.blockAnyway : m.block)}
                  </Button>
                  <Button variant="ghost" onClick={() => setSelection(null)}>
                    <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                    {intl.formatMessage(m.clear)}
                  </Button>
                </div>
              </>
            )}
            {focus?.kind === "block" && (
              <>
                <p className="font-semibold">
                  {intl.formatMessage(m.blockedInfo, {
                    day: dayLabel(inZone(focus.block.starts_at, tz, locale)),
                    range: blockRange(focus.block, tz, locale, intl.formatMessage(m.allDay)),
                  })}
                  {focus.block.reason ? ` · ${focus.block.reason}` : ""}
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {(ms(focus.block.starts_at) < focus.cellStart.toMillis() || ms(focus.block.ends_at) > focus.cellEnd.toMillis()) && (
                    <Button disabled={saving} onClick={() => unblockCell(focus.block, focus.cellStart, focus.cellEnd)}>
                      {intl.formatMessage(m.unblockCell, { range: rangeLabel(focus.cellStart, focus.cellEnd) })}
                    </Button>
                  )}
                  <Button variant="danger" disabled={saving} onClick={() => deleteBlock(focus.block)}>
                    {intl.formatMessage(m.unblockAll)}
                  </Button>
                  <Button variant="ghost" onClick={() => setFocus(null)}>
                    <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                    {intl.formatMessage(m.clear)}
                  </Button>
                </div>
              </>
            )}
            {focus?.kind === "booking" && (
              <>
                <p className="font-semibold">
                  {intl.formatMessage(m.bookedInfo, {
                    name: focus.booking.invitee_name,
                    day: dayLabel(inZone(focus.booking.starts_at, tz, locale)),
                    range: rangeLabel(inZone(focus.booking.starts_at, tz, locale), inZone(focus.booking.ends_at, tz, locale)),
                  })}
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="primary" onClick={onShowBookings}>
                    {intl.formatMessage(m.seeBooking)}
                  </Button>
                  <Button variant="ghost" onClick={() => setFocus(null)}>
                    <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                    {intl.formatMessage(m.clear)}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <BlockForm host={host} bookings={bookings} saving={saving} onBlock={insertBlock} />
        <Panel title={intl.formatMessage(m.listTitle)}>
          <BlockList blocks={blocks} tz={tz} saving={saving} onDelete={deleteBlock} />
        </Panel>
      </div>
    </div>
  );
}

/** "10:00 – 12:00", "All day", or "2 Nov 10:00 – 4 Nov 18:00" for blocks over several days */
function blockRange(block: BookingBlock, tz: string, locale: string, allDay: string) {
  const start = inZone(block.starts_at, tz, locale);
  const end = inZone(block.ends_at, tz, locale);
  const midnight = (dt: DateTime) => dt.hour === 0 && dt.minute === 0;
  if (midnight(start) && midnight(end)) {
    const lastDay = end.minus({ days: 1 });
    return lastDay.toISODate() === start.toISODate() ? allDay : `${dayLabel(start)} – ${dayLabel(lastDay)}`;
  }
  const sameDay = start.toISODate() === end.toISODate() || (end.hour === 0 && end.minute === 0 && end.minus({ days: 1 }).toISODate() === start.toISODate());
  if (sameDay) return rangeLabel(start, end);
  return `${dayLabel(start)} ${timeLabel(start)} – ${dayLabel(end)} ${timeLabel(end)}`;
}

function BlockList({
  blocks,
  tz,
  saving,
  onDelete,
}: {
  blocks: BookingBlock[];
  tz: string;
  saving: boolean;
  onDelete: (block: BookingBlock) => void;
}) {
  const intl = useIntl();
  const upcoming = blocks.filter((b) => ms(b.ends_at) > Date.now());
  if (!upcoming.length) return <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.listEmpty)}</p>;
  return (
    <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
      {upcoming.map((block) => {
        const start = inZone(block.starts_at, tz, intl.locale);
        const minutes = DateTime.fromISO(block.ends_at).diff(DateTime.fromISO(block.starts_at), "minutes").minutes;
        return (
          <li key={block.id} className="flex items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{dayLabel(start)}</p>
              <p className="text-sm text-[var(--text-muted)] tabular-nums">
                {blockRange(block, tz, intl.locale, intl.formatMessage(m.allDay))} · {durationLabel(Math.round(minutes))}
                {block.reason ? ` · ${block.reason}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => onDelete(block)}
              aria-label={`${intl.formatMessage(m.unblock)} ${dayLabel(start)} ${blockRange(block, tz, intl.locale, intl.formatMessage(m.allDay))}`}
            >
              <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{intl.formatMessage(m.unblock)}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function BlockForm({
  host,
  bookings,
  saving,
  onBlock,
}: {
  host: BookingHost;
  bookings: Booking[];
  saving: boolean;
  onBlock: (start: DateTime, end: DateTime, reason: string) => Promise<boolean>;
}) {
  const intl = useIntl();
  const tz = host.timezone;
  const nowHost = DateTime.now().setZone(tz);
  const nextHalfHour = nowHost.startOf("hour").plus({ minutes: nowHost.minute < 30 ? 30 : 60 });

  const [date, setDate] = useState(nextHalfHour.toISODate() as string);
  const [time, setTime] = useState(nextHalfHour.toFormat("HH:mm"));
  const [length, setLength] = useState<Length>("60");
  const [untilDate, setUntilDate] = useState(nextHalfHour.toISODate() as string);
  const [untilTime, setUntilTime] = useState(nextHalfHour.plus({ hours: 2 }).toFormat("HH:mm"));
  const [reason, setReason] = useState("");

  const range = useMemo(() => {
    const dayStart = DateTime.fromISO(date, { zone: tz });
    if (!dayStart.isValid) return null;
    if (length === "day") return { start: dayStart.startOf("day"), end: dayStart.startOf("day").plus({ days: 1 }) };
    const start = DateTime.fromISO(`${date}T${time}`, { zone: tz });
    if (!start.isValid) return null;
    if (length === "rest") return { start, end: start.startOf("day").plus({ days: 1 }) };
    if (length === "custom") {
      const end = DateTime.fromISO(`${untilDate}T${untilTime}`, { zone: tz });
      return end.isValid ? { start, end } : null;
    }
    return { start, end: start.plus({ minutes: Number(length) }) };
  }, [date, time, length, untilDate, untilTime, tz]);

  const invalid = !range || range.end <= range.start;
  const inPast = !invalid && range.end <= DateTime.now();
  const covered = !invalid && !inPast ? bookingsIn(bookings, range.start, range.end) : [];

  const lengths: { value: Length; label: string }[] = [
    { value: "15", label: durationLabel(15) },
    { value: "30", label: durationLabel(30) },
    { value: "60", label: durationLabel(60) },
    { value: "120", label: durationLabel(120) },
    { value: "rest", label: intl.formatMessage(m.lengthRest) },
    { value: "day", label: intl.formatMessage(m.lengthDay) },
    { value: "custom", label: intl.formatMessage(m.lengthCustom) },
  ];

  const fmt = (dt: DateTime) => `${dayLabel(dt.setLocale(intl.locale))} ${timeLabel(dt.setLocale(intl.locale))}`;

  return (
    <Panel title={intl.formatMessage(m.formTitle)} description={`${intl.formatMessage(m.formHelp)} ${intl.formatMessage(m.timesIn, { zone: tz })}`}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (invalid || inPast || !range) return;
          if (await onBlock(range.start, range.end, reason)) setReason("");
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={intl.formatMessage(m.date)} htmlFor="block-date">
            <input id="block-date" type="date" required className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={intl.formatMessage(m.from)} htmlFor="block-time">
            <input
              id="block-time"
              type="time"
              step={60}
              required={length !== "day"}
              disabled={length === "day"}
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </div>
        <Field label={intl.formatMessage(m.length)}>
          <ChipGroup<Length> label={intl.formatMessage(m.length)} options={lengths} value={length} onChange={setLength} />
        </Field>
        {length === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={intl.formatMessage(m.untilDate)} htmlFor="block-until-date">
              <input id="block-until-date" type="date" required className={inputClass} value={untilDate} onChange={(e) => setUntilDate(e.target.value)} />
            </Field>
            <Field label={intl.formatMessage(m.untilTime)} htmlFor="block-until-time">
              <input id="block-until-time" type="time" step={60} required className={inputClass} value={untilTime} onChange={(e) => setUntilTime(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label={intl.formatMessage(m.reason)} htmlFor="block-reason">
          <input
            id="block-reason"
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={intl.formatMessage(m.reasonPlaceholder)}
            maxLength={200}
          />
        </Field>
        {invalid ? (
          <Notice tone="danger">{intl.formatMessage(m.invalid)}</Notice>
        ) : inPast ? (
          <Notice tone="danger">{intl.formatMessage(m.inPast)}</Notice>
        ) : (
          <p className="text-sm">
            {intl.formatMessage(m.preview, {
              from: fmt(range.start),
              to: fmt(range.end),
              length: durationLabel(Math.round(range.end.diff(range.start, "minutes").minutes)),
            })}
          </p>
        )}
        {covered.length > 0 && (
          <Notice tone="warning">
            {intl.formatMessage(m.overlap, {
              count: covered.length,
              list: covered
                .map((b) => `${b.invitee_name} ${fmt(DateTime.fromISO(b.starts_at).setZone(tz))}`)
                .join(", "),
            })}
          </Notice>
        )}
        <div>
          <Button type="submit" variant="primary" disabled={saving || invalid || inPast}>
            {intl.formatMessage(covered.length ? m.blockAnyway : m.block)}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
