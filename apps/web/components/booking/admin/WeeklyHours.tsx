import React, { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../../../supa-client";
import { timeToMinutes } from "../../../lib/booking/slots";
import { longDayLabel } from "../../../lib/booking/format";
import type { BookingDateOverride, BookingHost } from "../../../lib/booking/types";
import type { BookingAdminData } from "./useBookingAdmin";
import { Button, Field, Notice, Panel, inputClass } from "./ui";

const m = defineMessages({
  title: { id: "booking-admin-hours-title", description: "Booking admin: weekly hours heading", defaultMessage: "Weekly hours" },
  help: {
    id: "booking-admin-hours-help",
    description: "Booking admin: explains weekly hours",
    defaultMessage: "When people can book you in a normal week, in {zone}. Changing these never moves calls already booked.",
  },
  available: { id: "booking-admin-hours-available", description: "Booking admin: day is bookable toggle", defaultMessage: "Available" },
  unavailable: { id: "booking-admin-hours-unavailable", description: "Booking admin: day has no hours", defaultMessage: "Unavailable" },
  start: { id: "booking-admin-hours-start", description: "Booking admin: range start time", defaultMessage: "From" },
  end: { id: "booking-admin-hours-end", description: "Booking admin: range end time", defaultMessage: "To" },
  addRange: { id: "booking-admin-hours-add-range", description: "Booking admin: add another time range to a day", defaultMessage: "Add hours" },
  removeRange: { id: "booking-admin-hours-remove-range", description: "Booking admin: remove a time range", defaultMessage: "Remove these hours" },
  save: { id: "booking-admin-hours-save", description: "Booking admin: save weekly hours", defaultMessage: "Save weekly hours" },
  saved: { id: "booking-admin-hours-saved", description: "Booking admin: toast after saving hours", defaultMessage: "Weekly hours saved" },
  unsaved: { id: "booking-admin-hours-unsaved", description: "Booking admin: unsaved changes note", defaultMessage: "You have unsaved changes." },
  invalidRange: {
    id: "booking-admin-hours-invalid",
    description: "Booking admin: a range ends before it starts",
    defaultMessage: "{day}: each range has to end after it starts.",
  },
  saveFailed: { id: "booking-admin-save-failed", description: "Booking admin: toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  overridesTitle: { id: "booking-admin-overrides-title", description: "Booking admin: date overrides heading", defaultMessage: "Different hours on a date" },
  overridesHelp: {
    id: "booking-admin-overrides-help",
    description: "Booking admin: explains date overrides",
    defaultMessage: "Holidays, or a day with shorter or longer hours. These replace the weekly hours for that date.",
  },
  overrideDate: { id: "booking-admin-override-date", description: "Booking admin: override date", defaultMessage: "Date" },
  closedAllDay: { id: "booking-admin-override-closed", description: "Booking admin: closed all day option", defaultMessage: "Closed all day" },
  addOverride: { id: "booking-admin-override-add", description: "Booking admin: save a date override", defaultMessage: "Save date" },
  overrideSaved: { id: "booking-admin-override-saved", description: "Booking admin: toast after saving an override", defaultMessage: "Hours for that date saved" },
  overrideRemoved: { id: "booking-admin-override-removed", description: "Booking admin: toast after removing an override", defaultMessage: "Back to weekly hours for that date" },
  overrideRemove: { id: "booking-admin-override-remove", description: "Booking admin: remove a date override", defaultMessage: "Remove" },
  closed: { id: "booking-admin-override-closed-label", description: "Booking admin: override shows closed", defaultMessage: "Closed" },
  noOverrides: { id: "booking-admin-overrides-empty", description: "Booking admin: no overrides", defaultMessage: "No dates with different hours." },
  replaces: {
    id: "booking-admin-override-replaces",
    description: "Booking admin: saving replaces existing hours for that date",
    defaultMessage: "This date already has different hours; saving replaces them.",
  },
});

interface Range {
  start: string;
  end: string;
}

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const hhmm = (t: string) => t.slice(0, 5);
/** Postgres TIME has no 24:00 input in <input type="time">, so 23:59 stands in */
const toDb = (t: string) => (t === "23:59" ? "24:00" : t);
const fromDb = (t: string) => (hhmm(t) === "24:00" ? "23:59" : hhmm(t));

function weekdayName(weekday: number, locale: string) {
  // 2024-01-01 was a Monday
  return DateTime.fromISO("2024-01-01").plus({ days: weekday - 1 }).setLocale(locale).toLocaleString({ weekday: "long" });
}

interface Props {
  host: BookingHost;
  data: BookingAdminData;
  reload: () => Promise<void>;
}

export default function WeeklyHours({ host, data, reload }: Props) {
  const intl = useIntl();

  const saved = useMemo(() => {
    const byDay: Record<number, Range[]> = {};
    for (const day of DAYS) byDay[day] = [];
    for (const row of data.weeklyHours.filter((w) => w.host_id === host.id)) {
      byDay[row.weekday].push({ start: hhmm(row.start_time), end: fromDb(row.end_time) });
    }
    return byDay;
  }, [data.weeklyHours, host.id]);

  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(saved), [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const badDay = DAYS.find((day) => draft[day].some((r) => !r.start || !r.end || timeToMinutes(r.end) <= timeToMinutes(r.start)));

  const update = (day: number, ranges: Range[]) => setDraft({ ...draft, [day]: ranges });

  const save = async () => {
    setSaving(true);
    const rows = DAYS.flatMap((day) =>
      draft[day].map((r) => ({ host_id: host.id, weekday: day, start_time: r.start, end_time: toDb(r.end) }))
    );
    const { error: deleteError } = await supaClient.from("booking_weekly_hours").delete().eq("host_id", host.id);
    const { error } = deleteError ? { error: deleteError } : rows.length ? await supaClient.from("booking_weekly_hours").insert(rows) : { error: null };
    setSaving(false);
    if (error) {
      toast.error(intl.formatMessage(m.saveFailed, { error: error.message }));
    } else {
      toast.success(intl.formatMessage(m.saved));
    }
    await reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title={intl.formatMessage(m.title)} description={intl.formatMessage(m.help, { zone: host.timezone })}>
        <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {DAYS.map((day) => {
            const ranges = draft[day];
            const on = ranges.length > 0;
            const name = weekdayName(day, intl.locale);
            return (
              <li key={day} className="py-3 flex flex-col sm:flex-row sm:items-start gap-3">
                <label className="flex items-center gap-3 sm:w-48 shrink-0 min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={on}
                    onChange={(e) => update(day, e.target.checked ? [{ start: "09:00", end: "17:00" }] : [])}
                  />
                  <span className="font-semibold">{name}</span>
                </label>
                {on ? (
                  <div className="flex flex-col gap-2 flex-1">
                    {ranges.map((range, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="time"
                          step={300}
                          aria-label={`${name} ${intl.formatMessage(m.start)}`}
                          className={`${inputClass} max-w-[9rem]`}
                          value={range.start}
                          onChange={(e) => update(day, ranges.map((r, j) => (j === i ? { ...r, start: e.target.value } : r)))}
                        />
                        <span aria-hidden="true">–</span>
                        <input
                          type="time"
                          step={300}
                          aria-label={`${name} ${intl.formatMessage(m.end)}`}
                          className={`${inputClass} max-w-[9rem]`}
                          value={range.end}
                          onChange={(e) => update(day, ranges.map((r, j) => (j === i ? { ...r, end: e.target.value } : r)))}
                        />
                        <Button
                          variant="ghost"
                          aria-label={`${intl.formatMessage(m.removeRange)} (${name})`}
                          onClick={() => update(day, ranges.filter((_, j) => j !== i))}
                        >
                          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const last = ranges[ranges.length - 1];
                          const start = last ? Math.min(timeToMinutes(last.end) + 60, 22 * 60) : 9 * 60;
                          const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
                          update(day, [...ranges, { start: fmt(start), end: fmt(Math.min(start + 120, 23 * 60 + 59)) }]);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                        {intl.formatMessage(m.addRange)}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] sm:pt-3">{intl.formatMessage(m.unavailable)}</p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-col gap-3">
          {badDay && <Notice tone="danger">{intl.formatMessage(m.invalidRange, { day: weekdayName(badDay, intl.locale) })}</Notice>}
          {dirty && !badDay && <Notice tone="info">{intl.formatMessage(m.unsaved)}</Notice>}
          <div>
            <Button variant="primary" disabled={!dirty || !!badDay || saving} onClick={save}>
              {intl.formatMessage(m.save)}
            </Button>
          </div>
        </div>
      </Panel>

      <DateOverrides host={host} overrides={data.overrides.filter((o) => o.host_id === host.id)} reload={reload} />
    </div>
  );
}

function DateOverrides({ host, overrides, reload }: { host: BookingHost; overrides: BookingDateOverride[]; reload: () => Promise<void> }) {
  const intl = useIntl();
  const today = DateTime.now().setZone(host.timezone).toISODate() as string;
  const [date, setDate] = useState(today);
  const [closed, setClosed] = useState(true);
  const [ranges, setRanges] = useState<Range[]>([{ start: "10:00", end: "14:00" }]);
  const [saving, setSaving] = useState(false);

  const upcoming = overrides.filter((o) => o.date >= today);
  const byDate = upcoming.reduce<Record<string, BookingDateOverride[]>>((acc, o) => {
    (acc[o.date] ||= []).push(o);
    return acc;
  }, {});
  const invalid = !date || (!closed && ranges.some((r) => !r.start || !r.end || timeToMinutes(r.end) <= timeToMinutes(r.start)));

  const fail = (error: { message: string } | null) => {
    if (!error) return false;
    toast.error(intl.formatMessage(m.saveFailed, { error: error.message }));
    return true;
  };

  const save = async () => {
    setSaving(true);
    const del = await supaClient.from("booking_date_overrides").delete().eq("host_id", host.id).eq("date", date);
    if (!fail(del.error)) {
      const rows = closed
        ? [{ host_id: host.id, date, start_time: null, end_time: null }]
        : ranges.map((r) => ({ host_id: host.id, date, start_time: r.start, end_time: toDb(r.end) }));
      const ins = await supaClient.from("booking_date_overrides").insert(rows);
      if (!fail(ins.error)) toast.success(intl.formatMessage(m.overrideSaved));
    }
    setSaving(false);
    await reload();
  };

  const remove = async (day: string) => {
    setSaving(true);
    const { error } = await supaClient.from("booking_date_overrides").delete().eq("host_id", host.id).eq("date", day);
    setSaving(false);
    if (!fail(error)) toast.success(intl.formatMessage(m.overrideRemoved));
    await reload();
  };

  return (
    <Panel title={intl.formatMessage(m.overridesTitle)} description={intl.formatMessage(m.overridesHelp)}>
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) save();
          }}
        >
          <Field label={intl.formatMessage(m.overrideDate)} htmlFor="override-date">
            <input id="override-date" type="date" min={today} required className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={closed} onChange={(e) => setClosed(e.target.checked)} />
            <span className="font-semibold">{intl.formatMessage(m.closedAllDay)}</span>
          </label>
          {!closed && (
            <div className="flex flex-col gap-2">
              {ranges.map((range, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    step={300}
                    aria-label={intl.formatMessage(m.start)}
                    className={`${inputClass} max-w-[9rem]`}
                    value={range.start}
                    onChange={(e) => setRanges(ranges.map((r, j) => (j === i ? { ...r, start: e.target.value } : r)))}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="time"
                    step={300}
                    aria-label={intl.formatMessage(m.end)}
                    className={`${inputClass} max-w-[9rem]`}
                    value={range.end}
                    onChange={(e) => setRanges(ranges.map((r, j) => (j === i ? { ...r, end: e.target.value } : r)))}
                  />
                  {ranges.length > 1 && (
                    <Button variant="ghost" aria-label={intl.formatMessage(m.removeRange)} onClick={() => setRanges(ranges.filter((_, j) => j !== i))}>
                      <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                    </Button>
                  )}
                </div>
              ))}
              <div>
                <Button variant="ghost" onClick={() => setRanges([...ranges, { start: "15:00", end: "17:00" }])}>
                  <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                  {intl.formatMessage(m.addRange)}
                </Button>
              </div>
            </div>
          )}
          {byDate[date] && <Notice tone="info">{intl.formatMessage(m.replaces)}</Notice>}
          <div>
            <Button type="submit" variant="primary" disabled={invalid || saving}>
              {intl.formatMessage(m.addOverride)}
            </Button>
          </div>
        </form>

        <div>
          {Object.keys(byDate).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.noOverrides)}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {Object.entries(byDate).map(([day, rows]) => (
                <li key={day} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{longDayLabel(DateTime.fromISO(day).setLocale(intl.locale))}</p>
                    <p className="text-sm text-[var(--text-muted)] tabular-nums">
                      {rows.some((r) => !r.start_time)
                        ? intl.formatMessage(m.closed)
                        : rows.map((r) => `${hhmm(r.start_time as string)} – ${hhmm(r.end_time as string)}`).join(", ")}
                    </p>
                  </div>
                  <Button variant="ghost" disabled={saving} onClick={() => remove(day)} aria-label={`${intl.formatMessage(m.overrideRemove)} ${day}`}>
                    <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">{intl.formatMessage(m.overrideRemove)}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}
