import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";

import { supaClient } from "../../../supa-client";
import { allTimeZones, durationLabel, zoneName } from "../../../lib/booking/format";
import type { BookingHost, BookingType } from "../../../lib/booking/types";
import type { BookingAdminData } from "./useBookingAdmin";
import { Button, Field, Notice, Panel, Pill, inputClass } from "./ui";

const m = defineMessages({
  typeTitle: { id: "booking-admin-settings-type-title", description: "Booking admin: booking rules heading", defaultMessage: "Booking rules: {name}" },
  typeHelp: {
    id: "booking-admin-settings-type-help",
    description: "Booking admin: explains booking rules",
    defaultMessage: "How long a call is and how people can book it. Changes apply to new bookings only.",
  },
  duration: { id: "booking-admin-settings-duration", description: "Booking admin: call length", defaultMessage: "Call length" },
  step: { id: "booking-admin-settings-step", description: "Booking admin: how often start times are offered", defaultMessage: "Start times every" },
  bufferBefore: { id: "booking-admin-settings-buffer-before", description: "Booking admin: free time before each call", defaultMessage: "Free time before each call" },
  bufferAfter: { id: "booking-admin-settings-buffer-after", description: "Booking admin: free time after each call", defaultMessage: "Free time after each call" },
  minNotice: { id: "booking-admin-settings-min-notice", description: "Booking admin: minimum notice in hours", defaultMessage: "Minimum notice (hours)" },
  minNoticeHint: {
    id: "booking-admin-settings-min-notice-hint",
    description: "Booking admin: minimum notice hint",
    defaultMessage: "Nobody can book a call starting sooner than this.",
  },
  maxDays: { id: "booking-admin-settings-max-days", description: "Booking admin: how far ahead in days", defaultMessage: "Bookable up to (days ahead)" },
  dailyLimit: { id: "booking-admin-settings-daily-limit", description: "Booking admin: max calls per day", defaultMessage: "Most calls per day" },
  dailyLimitHint: { id: "booking-admin-settings-daily-limit-hint", description: "Booking admin: empty means no limit", defaultMessage: "Leave empty for no limit." },
  cancelCutoff: { id: "booking-admin-settings-cancel-cutoff", description: "Booking admin: cancel cutoff in hours", defaultMessage: "Cancel or move until (hours before)" },
  active: { id: "booking-admin-settings-active", description: "Booking admin: booking type accepts bookings", defaultMessage: "Taking bookings" },
  none: { id: "booking-admin-settings-none", description: "Booking admin: zero minutes", defaultMessage: "None" },
  save: { id: "booking-admin-settings-save", description: "Booking admin: save settings", defaultMessage: "Save" },
  saved: { id: "booking-admin-settings-saved", description: "Booking admin: toast after saving settings", defaultMessage: "Settings saved" },
  saveFailed: { id: "booking-admin-save-failed", description: "Booking admin: toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  hostTitle: { id: "booking-admin-settings-host-title", description: "Booking admin: host details heading", defaultMessage: "Host: {name}" },
  hostHelp: {
    id: "booking-admin-settings-host-help",
    description: "Booking admin: explains host settings",
    defaultMessage: "The person being booked. Weekly hours and blocks are in this time zone.",
  },
  hostName: { id: "booking-admin-settings-host-name", description: "Booking admin: host name", defaultMessage: "Name" },
  hostTitleField: { id: "booking-admin-settings-host-job", description: "Booking admin: host job title", defaultMessage: "Title" },
  timezone: { id: "booking-admin-settings-timezone", description: "Booking admin: host time zone", defaultMessage: "Time zone" },
  timezoneChanged: {
    id: "booking-admin-settings-timezone-changed",
    description: "Booking admin: warning when changing the host time zone",
    defaultMessage: "Weekly hours keep their clock times in the new zone (09:00 stays 09:00). Booked calls don't move.",
  },
  hostsTitle: { id: "booking-admin-settings-hosts-title", description: "Booking admin: hosts list heading", defaultMessage: "Hosts" },
  hostsHelp: {
    id: "booking-admin-settings-hosts-help",
    description: "Booking admin: explains hosts list",
    defaultMessage: "Add more people (for example doctors) later; each has their own hours. The default host is preselected for buyers.",
  },
  defaultHost: { id: "booking-admin-settings-default-host", description: "Booking admin: default host pill", defaultMessage: "Default" },
  makeDefault: { id: "booking-admin-settings-make-default", description: "Booking admin: make a host the default", defaultMessage: "Make default" },
  newHostName: { id: "booking-admin-settings-new-host-name", description: "Booking admin: name of a host to add", defaultMessage: "New host's name" },
  addHost: { id: "booking-admin-settings-add-host", description: "Booking admin: add a host", defaultMessage: "Add host" },
  inactive: { id: "booking-admin-settings-inactive", description: "Booking admin: inactive host pill", defaultMessage: "Inactive" },
  offers: { id: "booking-admin-settings-offers", description: "Booking admin: host offers this booking type", defaultMessage: "Offers {name}" },
});

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const STEPS = [15, 30, 60];
const BUFFERS = [0, 5, 10, 15, 30, 60];

interface Props {
  host: BookingHost;
  type: BookingType | null;
  data: BookingAdminData;
  reload: () => Promise<void>;
}

export default function BookingSettings({ host, type, data, reload }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {type && <TypeSettings type={type} reload={reload} />}
      <HostSettings host={host} reload={reload} />
      <HostList data={data} type={type} reload={reload} />
    </div>
  );
}

function useFail() {
  const intl = useIntl();
  return (error: { message: string } | null) => {
    if (!error) return false;
    toast.error(intl.formatMessage(m.saveFailed, { error: error.message }));
    return true;
  };
}

function TypeSettings({ type, reload }: { type: BookingType; reload: () => Promise<void> }) {
  const intl = useIntl();
  const fail = useFail();
  const initial = useMemo(
    () => ({
      duration_minutes: type.duration_minutes,
      slot_step_minutes: type.slot_step_minutes,
      buffer_before_minutes: type.buffer_before_minutes,
      buffer_after_minutes: type.buffer_after_minutes,
      min_notice_hours: String(type.min_notice_minutes / 60),
      max_days_ahead: String(type.max_days_ahead),
      daily_limit: type.daily_limit ? String(type.daily_limit) : "",
      cancel_cutoff_hours: String(type.cancel_cutoff_minutes / 60),
      active: type.active,
    }),
    [type]
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);

  const minNotice = Number(form.min_notice_hours);
  const maxDays = Number(form.max_days_ahead);
  const limit = form.daily_limit === "" ? null : Number(form.daily_limit);
  const cutoff = Number(form.cancel_cutoff_hours);
  const valid =
    Number.isFinite(minNotice) && minNotice >= 0 && minNotice <= 720 &&
    Number.isInteger(maxDays) && maxDays >= 1 && maxDays <= 365 &&
    (limit === null || (Number.isInteger(limit) && limit > 0)) &&
    Number.isFinite(cutoff) && cutoff >= 0 && cutoff <= 720;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const minutesOption = (n: number) => (n === 0 ? intl.formatMessage(m.none) : durationLabel(n));
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  return (
    <Panel title={intl.formatMessage(m.typeTitle, { name: type.name })} description={intl.formatMessage(m.typeHelp)}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return;
          setSaving(true);
          const { error } = await supaClient
            .from("booking_types")
            .update({
              duration_minutes: form.duration_minutes,
              slot_step_minutes: form.slot_step_minutes,
              buffer_before_minutes: form.buffer_before_minutes,
              buffer_after_minutes: form.buffer_after_minutes,
              min_notice_minutes: Math.round(minNotice * 60),
              max_days_ahead: maxDays,
              daily_limit: limit,
              cancel_cutoff_minutes: Math.round(cutoff * 60),
              active: form.active,
            })
            .eq("id", type.id);
          setSaving(false);
          if (!fail(error)) toast.success(intl.formatMessage(m.saved));
          await reload();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={intl.formatMessage(m.duration)} htmlFor="type-duration">
            <select id="type-duration" className={inputClass} value={form.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) })}>
              {DURATIONS.map((n) => (
                <option key={n} value={n}>{durationLabel(n)}</option>
              ))}
            </select>
          </Field>
          <Field label={intl.formatMessage(m.step)} htmlFor="type-step">
            <select id="type-step" className={inputClass} value={form.slot_step_minutes} onChange={(e) => set({ slot_step_minutes: Number(e.target.value) })}>
              {STEPS.map((n) => (
                <option key={n} value={n}>{durationLabel(n)}</option>
              ))}
            </select>
          </Field>
          <Field label={intl.formatMessage(m.bufferBefore)} htmlFor="type-buffer-before">
            <select id="type-buffer-before" className={inputClass} value={form.buffer_before_minutes} onChange={(e) => set({ buffer_before_minutes: Number(e.target.value) })}>
              {BUFFERS.map((n) => (
                <option key={n} value={n}>{minutesOption(n)}</option>
              ))}
            </select>
          </Field>
          <Field label={intl.formatMessage(m.bufferAfter)} htmlFor="type-buffer-after">
            <select id="type-buffer-after" className={inputClass} value={form.buffer_after_minutes} onChange={(e) => set({ buffer_after_minutes: Number(e.target.value) })}>
              {BUFFERS.map((n) => (
                <option key={n} value={n}>{minutesOption(n)}</option>
              ))}
            </select>
          </Field>
          <Field label={intl.formatMessage(m.minNotice)} hint={intl.formatMessage(m.minNoticeHint)} htmlFor="type-notice">
            <input id="type-notice" type="number" min={0} max={720} step={0.5} inputMode="decimal" className={inputClass} value={form.min_notice_hours} onChange={(e) => set({ min_notice_hours: e.target.value })} />
          </Field>
          <Field label={intl.formatMessage(m.maxDays)} htmlFor="type-max-days">
            <input id="type-max-days" type="number" min={1} max={365} step={1} inputMode="numeric" className={inputClass} value={form.max_days_ahead} onChange={(e) => set({ max_days_ahead: e.target.value })} />
          </Field>
          <Field label={intl.formatMessage(m.dailyLimit)} hint={intl.formatMessage(m.dailyLimitHint)} htmlFor="type-daily">
            <input id="type-daily" type="number" min={1} step={1} inputMode="numeric" className={inputClass} value={form.daily_limit} onChange={(e) => set({ daily_limit: e.target.value })} />
          </Field>
          <Field label={intl.formatMessage(m.cancelCutoff)} htmlFor="type-cutoff">
            <input id="type-cutoff" type="number" min={0} max={720} step={0.5} inputMode="decimal" className={inputClass} value={form.cancel_cutoff_hours} onChange={(e) => set({ cancel_cutoff_hours: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
          <input type="checkbox" className="w-5 h-5" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
          <span className="font-semibold">{intl.formatMessage(m.active)}</span>
        </label>
        <div>
          <Button type="submit" variant="primary" disabled={!dirty || !valid || saving}>
            {intl.formatMessage(m.save)}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function HostSettings({ host, reload }: { host: BookingHost; reload: () => Promise<void> }) {
  const intl = useIntl();
  const fail = useFail();
  const zones = useMemo(() => {
    const list = allTimeZones();
    return list.includes(host.timezone) ? list : [host.timezone, ...list];
  }, [host.timezone]);
  const initial = useMemo(() => ({ name: host.name, title: host.title ?? "", timezone: host.timezone }), [host]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  return (
    <Panel title={intl.formatMessage(m.hostTitle, { name: host.name })} description={intl.formatMessage(m.hostHelp)}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          setSaving(true);
          const { error } = await supaClient
            .from("booking_hosts")
            .update({ name: form.name.trim(), title: form.title.trim() || null, timezone: form.timezone })
            .eq("id", host.id);
          setSaving(false);
          if (!fail(error)) toast.success(intl.formatMessage(m.saved));
          await reload();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={intl.formatMessage(m.hostName)} htmlFor="host-name">
            <input id="host-name" required maxLength={120} className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={intl.formatMessage(m.hostTitleField)} htmlFor="host-title">
            <input id="host-title" maxLength={120} className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label={intl.formatMessage(m.timezone)} htmlFor="host-timezone" hint={zoneName(form.timezone, intl.locale)}>
            <select id="host-timezone" className={inputClass} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
        </div>
        {form.timezone !== host.timezone && <Notice tone="warning">{intl.formatMessage(m.timezoneChanged)}</Notice>}
        <div>
          <Button type="submit" variant="primary" disabled={!dirty || saving || !form.name.trim()}>
            {intl.formatMessage(m.save)}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "host";

function HostList({ data, type, reload }: { data: BookingAdminData; type: BookingType | null; reload: () => Promise<void> }) {
  const intl = useIntl();
  const fail = useFail();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const defaultZone = data.hosts.find((h) => h.is_default)?.timezone ?? "Europe/Berlin";

  const offers = (hostId: string) => !!type && data.typeHosts.some((t) => t.booking_type_id === type.id && t.host_id === hostId);

  const makeDefault = async (host: BookingHost) => {
    setSaving(true);
    // The unique index allows one default, so clear the old one first
    const clear = await supaClient.from("booking_hosts").update({ is_default: false }).eq("is_default", true);
    if (!fail(clear.error)) {
      const { error } = await supaClient.from("booking_hosts").update({ is_default: true }).eq("id", host.id);
      if (!fail(error)) toast.success(intl.formatMessage(m.saved));
    }
    setSaving(false);
    await reload();
  };

  const toggleOffers = async (host: BookingHost, on: boolean) => {
    if (!type) return;
    setSaving(true);
    const { error } = on
      ? await supaClient.from("booking_type_hosts").insert({ booking_type_id: type.id, host_id: host.id, is_default: false })
      : await supaClient.from("booking_type_hosts").delete().eq("booking_type_id", type.id).eq("host_id", host.id);
    setSaving(false);
    fail(error);
    await reload();
  };

  return (
    <Panel title={intl.formatMessage(m.hostsTitle)} description={intl.formatMessage(m.hostsHelp)}>
      <ul className="flex flex-col divide-y divide-[var(--border-subtle)] mb-4">
        {data.hosts.map((host) => (
          <li key={host.id} className="flex flex-wrap items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium flex flex-wrap items-center gap-2">
                {host.name}
                {host.is_default && <Pill tone="info">{intl.formatMessage(m.defaultHost)}</Pill>}
                {!host.active && <Pill tone="muted">{intl.formatMessage(m.inactive)}</Pill>}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{host.timezone.replace(/_/g, " ")}</p>
            </div>
            {type && (
              <label className="flex items-center gap-2 text-sm min-h-[44px] cursor-pointer">
                <input type="checkbox" className="w-4 h-4" disabled={saving} checked={offers(host.id)} onChange={(e) => toggleOffers(host, e.target.checked)} />
                {intl.formatMessage(m.offers, { name: type.name })}
              </label>
            )}
            {!host.is_default && (
              <Button disabled={saving} onClick={() => makeDefault(host)}>
                {intl.formatMessage(m.makeDefault)}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="flex flex-col sm:flex-row gap-2 sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setSaving(true);
          const base = slugify(name);
          const taken = new Set(data.hosts.map((h) => h.slug));
          let slug = base;
          for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
          const { error } = await supaClient.from("booking_hosts").insert({ name: name.trim(), slug, timezone: defaultZone });
          setSaving(false);
          if (!fail(error)) {
            toast.success(intl.formatMessage(m.saved));
            setName("");
          }
          await reload();
        }}
      >
        <div className="flex-1">
          <Field label={intl.formatMessage(m.newHostName)} htmlFor="new-host-name">
            <input id="new-host-name" maxLength={120} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" disabled={saving || !name.trim()}>
          {intl.formatMessage(m.addHost)}
        </Button>
      </form>
    </Panel>
  );
}
