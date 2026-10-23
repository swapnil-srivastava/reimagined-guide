import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faSliders } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../components/AuthCheck";
import Metatags from "../../components/Metatags";
import AdminGate, { ListSkeleton, NotAdmin } from "../../components/admin/AdminGate";
import { Button, ChipGroup, Field, Notice, Panel, inputClass } from "../../components/booking/admin/ui";
import ChangeHistory from "../../components/practice/ChangeHistory";
import { Checkbox, FeeInput, FieldError } from "../../components/practice/fields";
import { chargeLabel, daysLabel, minutesLabel } from "../../components/practice/labels";
import { supaClient } from "../../supa-client";
import type { Database, Json } from "../../database.types";
import {
  CHARGES,
  MAX_FOLLOW_UP_DAYS,
  MAX_REASON,
  MIN_REASON,
  changedFields,
  parseRupees,
  parseWhole,
  rupeesInput,
  type Charge,
} from "../../lib/practice";

// e.g. localhost:3000/admin/practice
// Practice settings for the doctors (Figma A6): free follow-up window, fees,
// the referral and no-show charge, paying at the clinic, booking rules.
// Every save needs a reason and is logged in the change history.

type Settings = Database["public"]["Tables"]["practice_settings"]["Row"];
type ConsentVersion = Database["public"]["Tables"]["consent_versions"]["Row"];

const m = defineMessages({
  title: { id: "practice-settings-title", description: "Practice settings page heading", defaultMessage: "Practice settings" },
  subtitle: {
    id: "practice-settings-subtitle",
    description: "Practice settings page subtitle",
    defaultMessage: "Fees and rules for every doctor. A doctor can have their own fees and charges on Doctors.",
  },
  back: { id: "practice-settings-back", description: "Link back to the admin page", defaultMessage: "Admin" },
  loadFailed: {
    id: "practice-settings-load-failed",
    description: "Practice settings could not be loaded",
    defaultMessage: "Practice settings couldn't be loaded ({error}). The practice admin migration may not have been run yet.",
  },
  followUpTitle: { id: "practice-settings-follow-up-title", description: "Card heading: free follow-up window", defaultMessage: "Free follow-up window" },
  followUpHelp: { id: "practice-settings-follow-up-help", description: "Explains the free follow-up window", defaultMessage: "How long a patient can send reports and questions at no charge" },
  followUpDays: { id: "practice-settings-follow-up-days", description: "Field: days after the consultation", defaultMessage: "Days after the consultation" },
  followUpHint: { id: "practice-settings-follow-up-hint", description: "Hint under follow-up days", defaultMessage: "Between 0 and {max} days. Default is 5." },
  openCases: {
    id: "practice-settings-open-cases",
    description: "Notice: changing the window doesn't move existing deadlines",
    defaultMessage: "Changing this only affects new cases. {count, plural, =0 {No open case is affected.} one {# open case keeps the deadline it was given.} other {# open cases keep the deadline they were given.}}",
  },
  feesTitle: { id: "practice-settings-fees-title", description: "Card heading: fees", defaultMessage: "Fees" },
  feesHelp: { id: "practice-settings-fees-help", description: "Explains practice fees", defaultMessage: "In rupees. Used for every doctor without their own fee." },
  firstFee: { id: "practice-settings-first-fee", description: "Field: first consultation fee", defaultMessage: "First consultation" },
  followUpFee: { id: "practice-settings-follow-up-fee", description: "Field: paid follow-up fee", defaultMessage: "Paid follow-up" },
  referral: {
    id: "practice-settings-referral",
    description: "Question: what the patient pays when referred",
    defaultMessage: "If the doctor refers the patient to another doctor, the fee for that consultation is:",
  },
  referralHint: {
    id: "practice-settings-referral-hint",
    description: "Hint under the referral charge",
    defaultMessage: "A clinic visit the doctor asks for during an online consultation is part of that consultation and isn't charged. Follow-ups are then free for the window above, and paid after that, in person too.",
  },
  missedTitle: { id: "practice-settings-missed-title", description: "Card heading: missed visits and paying at the clinic", defaultMessage: "Missed visits and paying at the clinic" },
  missedHelp: { id: "practice-settings-missed-help", description: "Explains the card", defaultMessage: "Each doctor can have their own no-show rule on Doctors." },
  noShow: { id: "practice-settings-no-show", description: "Question: what a no-show pays", defaultMessage: "If the clinic or doctor marks the patient as not come, they pay:" },
  payAtClinic: { id: "practice-settings-pay-at-clinic", description: "Checkbox: allow paying at reception", defaultMessage: "Let patients pay at reception for in-person visits" },
  payWho: { id: "practice-settings-pay-who", description: "Label: who can pay at reception", defaultMessage: "Who can pay at reception" },
  everyone: { id: "practice-settings-pay-everyone", description: "Chip: everyone can pay at reception", defaultMessage: "Everyone" },
  returning: { id: "practice-settings-pay-returning", description: "Chip: only returning patients can pay at reception", defaultMessage: "Returning patients only" },
  payWarning: {
    id: "practice-settings-pay-warning",
    description: "Warning: no-show fee can't be taken for pay-at-clinic visits",
    defaultMessage: "Nothing is paid in advance, so a no-show fee can't be taken. It is shown as unpaid on the patient's file and asked for at the next visit.",
  },
  rulesTitle: { id: "practice-settings-rules-title", description: "Card heading: booking rules", defaultMessage: "Booking rules" },
  rulesHelp: {
    id: "practice-settings-rules-help",
    description: "Booking rules: time zone and when they apply",
    defaultMessage: "Times are India Standard Time (IST). These apply to doctor visits once patients can book online.",
  },
  minNotice: { id: "practice-settings-min-notice", description: "Field: minimum notice", defaultMessage: "Minimum notice" },
  cancelCutoff: { id: "practice-settings-cancel-cutoff", description: "Field: free cancellation until", defaultMessage: "Free cancellation until" },
  cancelBefore: { id: "practice-settings-cancel-before", description: "Option: hours before the visit", defaultMessage: "{time} before" },
  buffer: { id: "practice-settings-buffer", description: "Field: gap between calls", defaultMessage: "Gap between visits" },
  maxDays: { id: "practice-settings-max-days", description: "Field: bookable ahead", defaultMessage: "Bookable ahead" },
  consentTitle: { id: "practice-settings-consent-title", description: "Card heading: consent and data", defaultMessage: "Consent and data" },
  consentNone: { id: "practice-settings-consent-none", description: "Consent text not published yet", defaultMessage: "Not published yet" },
  consentVersion: { id: "practice-settings-consent-version", description: "Consent version and date", defaultMessage: "Version {version} · {date}" },
  consentTeleconsult: { id: "practice-settings-consent-teleconsult", description: "Consent kind: teleconsultation", defaultMessage: "Teleconsultation consent text" },
  consentData: { id: "practice-settings-consent-data", description: "Consent kind: DPDP data notice", defaultMessage: "DPDP privacy notice" },
  consentParent: { id: "practice-settings-consent-parent", description: "Consent kind: parent's consent for a child", defaultMessage: "Parent's consent for a child" },
  reason: { id: "practice-settings-reason", description: "Field: reason for the change", defaultMessage: "Reason for this change" },
  reasonHint: { id: "practice-settings-reason-hint", description: "Hint under the reason", defaultMessage: "Required. Saved in the change history." },
  reasonShort: { id: "practice-settings-reason-short", description: "Error: reason too short", defaultMessage: "Write a reason of at least {min} characters." },
  unsaved: {
    id: "practice-settings-unsaved",
    description: "How many settings are changed but not saved",
    defaultMessage: "{count, plural, one {# change not saved yet.} other {# changes not saved yet.}}",
  },
  review: { id: "practice-settings-review", description: "Phone: go to the reason box to save", defaultMessage: "Add reason and save" },
  save: { id: "practice-settings-save", description: "Button: save practice settings", defaultMessage: "Save changes" },
  discard: { id: "practice-settings-discard", description: "Button: undo unsaved changes", defaultMessage: "Discard" },
  saved: { id: "practice-settings-saved", description: "Toast after saving", defaultMessage: "Practice settings saved" },
  saveFailed: { id: "practice-settings-save-failed", description: "Toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  invalidDays: { id: "practice-settings-invalid-days", description: "Error: follow-up days out of range", defaultMessage: "Enter a whole number from 0 to {max}." },
  invalidFee: { id: "practice-settings-invalid-fee", description: "Error: fee not valid", defaultMessage: "Enter an amount in rupees, like 600." },
  requiredFee: { id: "practice-settings-required-fee", description: "Error: fee empty", defaultMessage: "A fee is required. Enter 0 for free." },
});

const MIN_NOTICE = [0, 60, 120, 240, 720, 1440, 2880];
const CANCEL_CUTOFF = [0, 120, 360, 720, 1440, 2880];
const BUFFER = [0, 5, 10, 15, 30];
const MAX_DAYS = [7, 14, 30, 60, 90, 180];

const AdminPractice: NextPage = () => {
  const intl = useIntl();
  return (
    <>
      <Metatags title={intl.formatMessage(m.title)} />
      <div className="booking-ui font-poppins [&_button]:font-poppins [&_input]:font-poppins [&_select]:font-poppins [&_textarea]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AuthCheck>
            <AdminGate loading={<ListSkeleton />} denied={<NotAdmin />}>
              <PracticeSettings />
            </AdminGate>
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

/** The form as typed; numbers stay text until saved */
interface Draft {
  follow_up_days: string;
  first_fee: string;
  follow_up_fee: string;
  referral_charge: Charge;
  no_show_charge: Charge;
  pay_at_clinic: boolean;
  pay_at_clinic_who: string;
  min_notice_minutes: number;
  cancel_cutoff_minutes: number;
  buffer_minutes: number;
  max_days_ahead: number;
}

const toDraft = (s: Settings): Draft => ({
  follow_up_days: String(s.follow_up_days),
  first_fee: rupeesInput(s.first_consult_fee_paise),
  follow_up_fee: rupeesInput(s.follow_up_fee_paise),
  referral_charge: s.referral_charge as Charge,
  no_show_charge: s.no_show_charge as Charge,
  pay_at_clinic: s.pay_at_clinic,
  pay_at_clinic_who: s.pay_at_clinic_who,
  min_notice_minutes: s.min_notice_minutes,
  cancel_cutoff_minutes: s.cancel_cutoff_minutes,
  buffer_minutes: s.buffer_minutes,
  max_days_ahead: s.max_days_ahead,
});

function PracticeSettings() {
  const intl = useIntl();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [consents, setConsents] = useState<ConsentVersion[]>([]);
  const [openCases, setOpenCases] = useState(0);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    const [row, consent, cases, clinicRows] = await Promise.all([
      supaClient.from("practice_settings").select("*").maybeSingle(),
      supaClient.from("consent_versions").select("*").order("published_at", { ascending: false }),
      supaClient.from("cases").select("id", { count: "exact", head: true }).eq("status", "follow_up"),
      supaClient.from("clinics").select("id, name"),
    ]);
    if (row.error || !row.data) {
      setLoadError(row.error?.message ?? "no settings row");
      return;
    }
    setLoadError(null);
    setSettings(row.data);
    setDraft(toDraft(row.data));
    setConsents(consent.data ?? []);
    setOpenCases(cases.count ?? 0);
    setClinics(clinicRows.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The draft as database values, with an error per field
  const parsed = useMemo(() => {
    if (!draft) return null;
    const errors: Partial<Record<"follow_up_days" | "first_fee" | "follow_up_fee", string>> = {};
    const days = parseWhole(draft.follow_up_days, 0, MAX_FOLLOW_UP_DAYS);
    if (days === null) errors.follow_up_days = intl.formatMessage(m.invalidDays, { max: MAX_FOLLOW_UP_DAYS });
    const fee = (raw: string, key: "first_fee" | "follow_up_fee") => {
      const value = parseRupees(raw);
      if (value === null) errors[key] = intl.formatMessage(m.requiredFee);
      else if (typeof value === "string") errors[key] = intl.formatMessage(m.invalidFee);
      return typeof value === "number" ? value : null;
    };
    const values = {
      follow_up_days: days,
      first_consult_fee_paise: fee(draft.first_fee, "first_fee"),
      follow_up_fee_paise: fee(draft.follow_up_fee, "follow_up_fee"),
      referral_charge: draft.referral_charge,
      no_show_charge: draft.no_show_charge,
      pay_at_clinic: draft.pay_at_clinic,
      pay_at_clinic_who: draft.pay_at_clinic_who,
      min_notice_minutes: draft.min_notice_minutes,
      cancel_cutoff_minutes: draft.cancel_cutoff_minutes,
      buffer_minutes: draft.buffer_minutes,
      max_days_ahead: draft.max_days_ahead,
    };
    return { values, errors };
  }, [draft, intl]);

  const changes = settings && parsed ? changedFields(settings as unknown as Record<string, unknown>, parsed.values) : {};
  const changeCount = Object.keys(changes).length;
  const hasErrors = !!parsed && Object.keys(parsed.errors).length > 0;
  const reasonOk = reason.trim().length >= MIN_REASON;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!changeCount) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changeCount]);

  if (loadError) return <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error: loadError })}</Notice>;
  if (!settings || !draft || !parsed) return <ListSkeleton />;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });

  const save = async () => {
    setTriedSave(true);
    if (hasErrors || !reasonOk || !changeCount) return;
    setSaving(true);
    const { data, error } = await supaClient.rpc("admin_update_practice_settings", { p_changes: changes as Json, p_reason: reason.trim() });
    setSaving(false);
    if (error || !data) {
      toast.error(intl.formatMessage(m.saveFailed, { error: error?.message ?? "network" }));
      return;
    }
    toast.success(intl.formatMessage(m.saved));
    setSettings(data);
    setDraft(toDraft(data));
    setReason("");
    setTriedSave(false);
    setVersion((v) => v + 1);
  };

  const discard = () => {
    setDraft(toDraft(settings));
    setReason("");
    setTriedSave(false);
  };

  const chargeOptions = CHARGES.map((c) => ({ value: c, label: chargeLabel(intl, c) }));
  const options = (list: number[], current: number) => (list.includes(current) ? list : [...list, current].sort((a, b) => a - b));
  const clinicName = (id: string) => clinics.find((c) => c.id === id)?.name;
  const consentFor = (kind: string) => consents.find((c) => c.kind === kind);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
          {intl.formatMessage(m.back)}
        </Link>
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faSliders} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title)}</h1>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">{intl.formatMessage(m.subtitle)}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Panel title={intl.formatMessage(m.followUpTitle)} description={intl.formatMessage(m.followUpHelp)}>
            <div className="flex flex-col gap-4">
              <Field
                label={intl.formatMessage(m.followUpDays)}
                htmlFor="follow-up-days"
                hint={intl.formatMessage(m.followUpHint, { max: MAX_FOLLOW_UP_DAYS })}
              >
                <input
                  id="follow-up-days"
                  inputMode="numeric"
                  autoComplete="off"
                  className={inputClass}
                  value={draft.follow_up_days}
                  aria-invalid={!!parsed.errors.follow_up_days}
                  aria-describedby={parsed.errors.follow_up_days ? "follow-up-days-error" : undefined}
                  onChange={(e) => set("follow_up_days", e.target.value)}
                />
              </Field>
              {parsed.errors.follow_up_days && <FieldError id="follow-up-days-error">{parsed.errors.follow_up_days}</FieldError>}
              {"follow_up_days" in changes && <Notice tone="info">{intl.formatMessage(m.openCases, { count: openCases })}</Notice>}
            </div>
          </Panel>

          <Panel title={intl.formatMessage(m.feesTitle)} description={intl.formatMessage(m.feesHelp)}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FeeInput id="first-fee" label={intl.formatMessage(m.firstFee)} value={draft.first_fee} error={parsed.errors.first_fee} onChange={(v) => set("first_fee", v)} />
                <FeeInput id="follow-up-fee" label={intl.formatMessage(m.followUpFee)} value={draft.follow_up_fee} error={parsed.errors.follow_up_fee} onChange={(v) => set("follow_up_fee", v)} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{intl.formatMessage(m.referral)}</p>
                <ChipGroup<Charge> label={intl.formatMessage(m.referral)} options={chargeOptions} value={draft.referral_charge} onChange={(v) => set("referral_charge", v)} />
                <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.referralHint)}</p>
              </div>
            </div>
          </Panel>

          <Panel title={intl.formatMessage(m.missedTitle)} description={intl.formatMessage(m.missedHelp)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{intl.formatMessage(m.noShow)}</p>
                <ChipGroup<Charge> label={intl.formatMessage(m.noShow)} options={chargeOptions} value={draft.no_show_charge} onChange={(v) => set("no_show_charge", v)} />
              </div>
              <Checkbox checked={draft.pay_at_clinic} onChange={(v) => set("pay_at_clinic", v)}>
                {intl.formatMessage(m.payAtClinic)}
              </Checkbox>
              {draft.pay_at_clinic && (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">{intl.formatMessage(m.payWho)}</p>
                    <ChipGroup
                      label={intl.formatMessage(m.payWho)}
                      options={[
                        { value: "everyone", label: intl.formatMessage(m.everyone) },
                        { value: "returning", label: intl.formatMessage(m.returning) },
                      ]}
                      value={draft.pay_at_clinic_who}
                      onChange={(v) => set("pay_at_clinic_who", v)}
                    />
                  </div>
                  {draft.no_show_charge !== "free" && <Notice tone="warning">{intl.formatMessage(m.payWarning)}</Notice>}
                </>
              )}
            </div>
          </Panel>

          <Panel title={intl.formatMessage(m.rulesTitle)} description={intl.formatMessage(m.rulesHelp)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MinutesSelect id="min-notice" label={intl.formatMessage(m.minNotice)} value={draft.min_notice_minutes} options={options(MIN_NOTICE, draft.min_notice_minutes)} format={(v) => minutesLabel(intl, v)} onChange={(v) => set("min_notice_minutes", v)} />
              <MinutesSelect
                id="cancel-cutoff"
                label={intl.formatMessage(m.cancelCutoff)}
                value={draft.cancel_cutoff_minutes}
                options={options(CANCEL_CUTOFF, draft.cancel_cutoff_minutes)}
                format={(v) => (v === 0 ? minutesLabel(intl, 0) : intl.formatMessage(m.cancelBefore, { time: minutesLabel(intl, v) }))}
                onChange={(v) => set("cancel_cutoff_minutes", v)}
              />
              <MinutesSelect id="buffer" label={intl.formatMessage(m.buffer)} value={draft.buffer_minutes} options={options(BUFFER, draft.buffer_minutes)} format={(v) => minutesLabel(intl, v)} onChange={(v) => set("buffer_minutes", v)} />
              <MinutesSelect id="max-days" label={intl.formatMessage(m.maxDays)} value={draft.max_days_ahead} options={options(MAX_DAYS, draft.max_days_ahead)} format={(v) => daysLabel(intl, v)} onChange={(v) => set("max_days_ahead", v)} />
            </div>
          </Panel>

          <Panel title={intl.formatMessage(m.consentTitle)}>
            <dl className="flex flex-col gap-2 text-sm">
              {(
                [
                  ["teleconsult", m.consentTeleconsult],
                  ["data", m.consentData],
                  ["parent_data", m.consentParent],
                ] as const
              ).map(([kind, label]) => {
                const latest = consentFor(kind);
                return (
                  <div key={kind} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                    <dt className="text-[var(--text-muted)]">{intl.formatMessage(label)}</dt>
                    <dd className="font-medium">
                      {latest
                        ? intl.formatMessage(m.consentVersion, {
                            version: latest.version,
                            date: new Date(latest.published_at).toLocaleDateString(intl.locale, { day: "numeric", month: "short", year: "numeric" }),
                          })
                        : intl.formatMessage(m.consentNone)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-6 min-w-0 lg:sticky lg:top-6">
          <Panel>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--text-muted)] empty:hidden" role="status">
                {changeCount > 0 && intl.formatMessage(m.unsaved, { count: changeCount })}
              </p>
              <Field label={intl.formatMessage(m.reason)} htmlFor="change-reason" hint={intl.formatMessage(m.reasonHint)}>
                <textarea
                  id="change-reason"
                  rows={3}
                  maxLength={MAX_REASON}
                  className={inputClass}
                  value={reason}
                  aria-invalid={triedSave && !reasonOk}
                  aria-describedby={triedSave && !reasonOk ? "change-reason-error" : undefined}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              {triedSave && !reasonOk && <FieldError id="change-reason-error">{intl.formatMessage(m.reasonShort, { min: MIN_REASON })}</FieldError>}
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled={saving || !changeCount || hasErrors} onClick={save}>
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" aria-hidden="true" />
                  {intl.formatMessage(m.save)}
                </Button>
                <Button disabled={saving || (!changeCount && !reason)} onClick={discard}>
                  {intl.formatMessage(m.discard)}
                </Button>
              </div>
            </div>
          </Panel>
          <ChangeHistory subject="practice" version={version} clinicName={clinicName} />
        </div>
      </div>

      {/* On a phone the save box is far below the settings: this bar leads to it. It sits above the site's floating buttons. */}
      {changeCount > 0 && (
        <div className="lg:hidden fixed inset-x-4 bottom-20 z-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3 flex items-center justify-between gap-3 shadow-md">
          <p className="text-sm">{intl.formatMessage(m.unsaved, { count: changeCount })}</p>
          <Button
            variant="primary"
            onClick={() => {
              const box = document.getElementById("change-reason");
              box?.scrollIntoView({ behavior: "smooth", block: "center" });
              box?.focus({ preventScroll: true });
            }}
          >
            {intl.formatMessage(m.review)}
          </Button>
        </div>
      )}
    </div>
  );
}

function MinutesSelect({
  id,
  label,
  value,
  options,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  options: number[];
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} className={inputClass} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
          <option key={o} value={o}>
            {format(o)}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default AdminPractice;
