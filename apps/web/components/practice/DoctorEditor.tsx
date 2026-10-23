import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../../supa-client";
import type { BookingHost, Clinic } from "../../lib/booking/types";
import type { Database } from "../../database.types";
import {
  CHARGES,
  MODES,
  changedFields,
  doctorState,
  isCharge,
  parseRupees,
  rupeesInput,
  type Charge,
  type DoctorState,
} from "../../lib/practice";
import { Button, ChipGroup, Field, Notice, Panel, Pill, inputClass } from "../booking/admin/ui";
import { Checkbox, FeeInput, FieldError } from "./fields";
import { chargeLabel, modeLabel, practiceDefaultLabel } from "./labels";

// Edit one doctor (Figma A3): details, registration and its check, visit
// modes, own fees and charges, clinic, and switching them on for patients.
// Every save is logged in the change history by a database trigger.

type Settings = Database["public"]["Tables"]["practice_settings"]["Row"];

const SPECIALTIES = ["General Physician", "Gynaecologist", "Paediatrician", "Dermatologist"];
const MAX_TEXT = 120;

const m = defineMessages({
  shownOn: { id: "doctor-editor-shown-on", description: "Under the doctor's name: where these details appear", defaultMessage: "Shown on the booking page, prescription and receipt" },
  detailsTitle: { id: "doctor-editor-details-title", description: "Card heading: doctor details", defaultMessage: "Details" },
  name: { id: "doctor-editor-name", description: "Field: full name", defaultMessage: "Full name" },
  qualification: { id: "doctor-editor-qualification", description: "Field: qualifications", defaultMessage: "Qualifications" },
  qualificationHint: { id: "doctor-editor-qualification-hint", description: "Hint: qualification format", defaultMessage: "For example MBBS (KGMC Lucknow)" },
  specialty: { id: "doctor-editor-specialty", description: "Field: specialty", defaultMessage: "Specialty" },
  registrationTitle: { id: "doctor-editor-registration-title", description: "Card heading: registration", defaultMessage: "Registration" },
  registrationHelp: { id: "doctor-editor-registration-help", description: "Explains registration", defaultMessage: "Required before the doctor can consult. Shown to patients." },
  number: { id: "doctor-editor-registration-number", description: "Field: registration number", defaultMessage: "Registration number" },
  council: { id: "doctor-editor-registration-council", description: "Field: state medical council", defaultMessage: "State medical council" },
  validUntil: { id: "doctor-editor-registration-valid-until", description: "Field: registration valid until", defaultMessage: "Registration valid until" },
  checked: { id: "doctor-editor-registration-checked", description: "Checkbox: registration checked on the NMC register", defaultMessage: "I checked this registration on the NMC register" },
  checkedOn: { id: "doctor-editor-registration-checked-on", description: "When the registration was checked", defaultMessage: "Checked on {date}" },
  recheck: {
    id: "doctor-editor-registration-recheck",
    description: "Notice: a new registration needs a new check",
    defaultMessage: "The registration changed, so it needs a new check before the doctor can consult.",
  },
  consultTitle: { id: "doctor-editor-consult-title", description: "Card heading: consultations", defaultMessage: "Consultations" },
  modes: { id: "doctor-editor-modes", description: "Field: visit modes", defaultMessage: "Modes" },
  firstFee: { id: "doctor-editor-first-fee", description: "Field: first consultation fee", defaultMessage: "First consultation fee" },
  followUpFee: { id: "doctor-editor-follow-up-fee", description: "Field: paid follow-up fee", defaultMessage: "Paid follow-up fee" },
  feeDefault: { id: "doctor-editor-fee-default", description: "Placeholder: the practice's fee is used", defaultMessage: "{fee} (practice default)" },
  feeHint: { id: "doctor-editor-fee-hint", description: "Hint under the fees", defaultMessage: "Leave empty to use the practice fee." },
  referral: { id: "doctor-editor-referral", description: "Field: referral charge", defaultMessage: "Referral charge" },
  noShow: { id: "doctor-editor-no-show", description: "Field: no-show charge", defaultMessage: "No-show charge" },
  chargeDefault: { id: "doctor-editor-charge-default", description: "Chip: use the practice's rule, with its current value", defaultMessage: "Practice default ({value})" },
  clinicTitle: { id: "doctor-editor-clinic-title", description: "Card heading: clinic", defaultMessage: "Clinic" },
  clinicHelp: { id: "doctor-editor-clinic-help", description: "Explains clinic", defaultMessage: "For in-person visits" },
  clinic: { id: "doctor-editor-clinic", description: "Field: clinic", defaultMessage: "Clinic name" },
  noClinic: { id: "doctor-editor-no-clinic", description: "Option: no clinic", defaultMessage: "No clinic (online only)" },
  calendar: {
    id: "doctor-editor-calendar",
    description: "Clinic and online visits share one calendar",
    defaultMessage: "Clinic and online bookings share one calendar, so the same time can't be booked twice.",
  },
  hours: { id: "doctor-editor-hours", description: "Link: weekly hours and blocked time", defaultMessage: "Weekly hours and blocked time" },
  save: { id: "doctor-editor-save", description: "Button: save the doctor", defaultMessage: "Save doctor" },
  discard: { id: "doctor-editor-discard", description: "Button: undo unsaved changes", defaultMessage: "Discard" },
  saved: { id: "doctor-editor-saved", description: "Toast after saving", defaultMessage: "Doctor saved" },
  saveFailed: { id: "doctor-editor-save-failed", description: "Toast when saving fails", defaultMessage: "Couldn't save: {error}" },
  activate: { id: "doctor-editor-activate", description: "Button: let patients book this doctor", defaultMessage: "Activate" },
  deactivate: { id: "doctor-editor-deactivate", description: "Button: stop patients booking this doctor", defaultMessage: "Deactivate" },
  activated: { id: "doctor-editor-activated", description: "Toast after activating", defaultMessage: "{name} can now be booked" },
  deactivated: { id: "doctor-editor-deactivated", description: "Toast after deactivating", defaultMessage: "{name} can't be booked any more" },
  deactivateConfirm: {
    id: "doctor-editor-deactivate-confirm",
    description: "Confirm deactivating a doctor",
    defaultMessage: "Patients can't book {name} until you activate them again. Visits already booked stay; cancel them on Bookings if needed.",
  },
  deactivateYes: { id: "doctor-editor-deactivate-yes", description: "Button: confirm deactivating", defaultMessage: "Deactivate doctor" },
  keep: { id: "doctor-editor-keep", description: "Button: don't deactivate", defaultMessage: "Keep active" },
  activateNeeds: {
    id: "doctor-editor-activate-needs",
    description: "Why the doctor can't be activated yet",
    defaultMessage: "{state, select, pending {Check the registration before activating.} expired {The registration has expired. Enter the new valid-until date.} other {Save your changes before activating.}}",
  },
  saveFirst: { id: "doctor-editor-save-first", description: "Why Deactivate is off: unsaved changes", defaultMessage: "Save or discard your changes before deactivating." },
  required: { id: "doctor-editor-required", description: "Error: the doctor's name is empty", defaultMessage: "Enter the doctor's full name." },
  tooLong: { id: "doctor-editor-too-long", description: "Error: text too long", defaultMessage: "At most {max} characters" },
  invalidFee: { id: "doctor-editor-invalid-fee", description: "Error: fee not valid", defaultMessage: "Enter an amount in rupees, like 600, or leave empty." },
  noMode: { id: "doctor-editor-no-mode", description: "Error: no mode chosen", defaultMessage: "Choose at least one mode." },
  needsClinic: { id: "doctor-editor-needs-clinic", description: "Error: in person needs a clinic", defaultMessage: "In-person visits need a clinic." },
  checkNeeds: { id: "doctor-editor-check-needs", description: "Error: number and council needed for the check", defaultMessage: "Enter the number and council first." },
  errorVerified: {
    id: "doctor-editor-error-verified",
    description: "Database refused: active doctor without a checked registration",
    defaultMessage: "An active doctor needs a checked registration. Tick the check, or deactivate the doctor first.",
  },
  errorClinic: { id: "doctor-editor-error-clinic", description: "Database refused: in person without a clinic", defaultMessage: "In-person visits need a clinic." },
  statusActive: { id: "doctor-status-active", description: "Doctor status: can be booked", defaultMessage: "Verified · active" },
  statusReady: { id: "doctor-status-ready", description: "Doctor status: verified but switched off", defaultMessage: "Verified · inactive" },
  statusPending: { id: "doctor-status-pending", description: "Doctor status: registration not checked", defaultMessage: "Verification pending" },
  statusExpired: { id: "doctor-status-expired", description: "Doctor status: registration expired", defaultMessage: "Registration expired" },
});

export const STATE_TONE: Record<DoctorState, "success" | "info" | "warning" | "danger"> = {
  active: "success",
  ready: "info",
  pending: "warning",
  expired: "danger",
};

export function useStateLabel() {
  const intl = useIntl();
  return (state: DoctorState) =>
    intl.formatMessage({ active: m.statusActive, ready: m.statusReady, pending: m.statusPending, expired: m.statusExpired }[state]);
}

type ChargeChoice = Charge | "default";

interface Draft {
  name: string;
  qualification: string;
  specialty: string;
  registration_number: string;
  registration_council: string;
  registration_valid_until: string;
  checked: boolean;
  modes: string[];
  first_fee: string;
  follow_up_fee: string;
  referral_charge: ChargeChoice;
  no_show_charge: ChargeChoice;
  clinic_id: string;
}

const toDraft = (d: BookingHost): Draft => ({
  name: d.name,
  qualification: d.qualification ?? "",
  specialty: d.specialty ?? "",
  registration_number: d.registration_number ?? "",
  registration_council: d.registration_council ?? "",
  registration_valid_until: d.registration_valid_until ?? "",
  checked: !!d.registration_verified_at,
  modes: d.modes,
  first_fee: rupeesInput(d.first_consult_fee_paise),
  follow_up_fee: rupeesInput(d.follow_up_fee_paise),
  referral_charge: isCharge(d.referral_charge) ? d.referral_charge : "default",
  no_show_charge: isCharge(d.no_show_charge) ? d.no_show_charge : "default",
  clinic_id: d.clinic_id ?? "",
});

const trimmed = (s: string) => s.trim() || null;

interface Props {
  doctor: BookingHost;
  clinics: Clinic[];
  settings: Settings | null;
  /** Today in IST, "2026-10-22" */
  today: string;
  onSaved: (doctor: BookingHost) => void;
}

export default function DoctorEditor({ doctor, clinics, settings, today, onSaved }: Props) {
  const intl = useIntl();
  const stateLabel = useStateLabel();
  const [draft, setDraft] = useState<Draft>(() => toDraft(doctor));
  const [saving, setSaving] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const shownId = useRef(doctor.id);

  useEffect(() => {
    setDraft(toDraft(doctor));
    setTriedSave(false);
    setConfirmOff(false);
  }, [doctor]);

  // Picking another doctor moves focus to their name, so keyboard and screen
  // reader users land on the editor (on a phone the list is hidden)
  useEffect(() => {
    if (shownId.current !== doctor.id) headingRef.current?.focus();
    shownId.current = doctor.id;
  }, [doctor.id]);

  // The safe choice gets focus when the deactivate question opens
  useEffect(() => {
    if (confirmOff) keepRef.current?.focus();
  }, [confirmOff]);

  const registrationChanged =
    draft.registration_number.trim() !== (doctor.registration_number ?? "") ||
    draft.registration_council.trim() !== (doctor.registration_council ?? "");

  const { values, errors } = useMemo(() => {
    const errs: Partial<Record<keyof Draft, string>> = {};
    const text = (key: "name" | "qualification" | "specialty" | "registration_number" | "registration_council", required = false) => {
      const value = draft[key].trim();
      if (required && !value) errs[key] = intl.formatMessage(m.required);
      else if (value.length > MAX_TEXT) errs[key] = intl.formatMessage(m.tooLong, { max: MAX_TEXT });
    };
    text("name", true);
    text("qualification");
    text("specialty");
    text("registration_number");
    text("registration_council");
    const fee = (key: "first_fee" | "follow_up_fee") => {
      const value = parseRupees(draft[key]);
      if (typeof value === "string") errs[key] = intl.formatMessage(m.invalidFee);
      return typeof value === "number" ? value : null;
    };
    if (!draft.modes.length) errs.modes = intl.formatMessage(m.noMode);
    else if (draft.modes.includes("in_person") && !draft.clinic_id) errs.modes = intl.formatMessage(m.needsClinic);
    if (draft.checked && (!draft.registration_number.trim() || !draft.registration_council.trim()))
      errs.checked = intl.formatMessage(m.checkNeeds);

    // A new tick, or a tick on a new registration, is a new check
    const newCheck = draft.checked && (!doctor.registration_verified_at || registrationChanged);
    return {
      errors: errs,
      values: {
        name: draft.name.trim(),
        qualification: trimmed(draft.qualification),
        specialty: trimmed(draft.specialty),
        registration_number: trimmed(draft.registration_number),
        registration_council: trimmed(draft.registration_council),
        registration_valid_until: draft.registration_valid_until || null,
        registration_verified_at: !draft.checked ? null : newCheck ? new Date().toISOString() : doctor.registration_verified_at,
        modes: MODES.filter((mode) => draft.modes.includes(mode)) as string[],
        first_consult_fee_paise: fee("first_fee"),
        follow_up_fee_paise: fee("follow_up_fee"),
        referral_charge: draft.referral_charge === "default" ? null : draft.referral_charge,
        no_show_charge: draft.no_show_charge === "default" ? null : draft.no_show_charge,
        clinic_id: draft.clinic_id || null,
      },
    };
  }, [draft, doctor, registrationChanged, intl]);

  // Modes are compared in one order, so a row saved as {video,in_person} isn't "changed"
  const current = { ...doctor, modes: MODES.filter((mode) => doctor.modes.includes(mode)) as string[] };
  const changes = changedFields(current as unknown as Record<string, unknown>, values);
  const dirty = Object.keys(changes).length > 0;
  const hasErrors = Object.keys(errors).length > 0;
  const state = doctorState(doctor, today);
  const shownError = (key: keyof Draft) => (triedSave || key === "modes" || key === "checked" ? errors[key] : undefined);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    const next = { ...draft, [key]: value };
    // A different registration needs a new check
    if ((key === "registration_number" || key === "registration_council") && doctor.registration_verified_at) {
      const same =
        next.registration_number.trim() === (doctor.registration_number ?? "") &&
        next.registration_council.trim() === (doctor.registration_council ?? "");
      next.checked = same;
    }
    setDraft(next);
  };

  const dbError = (message: string) => {
    if (message.includes("booking_hosts_doctor_verified_check")) return intl.formatMessage(m.errorVerified);
    if (message.includes("booking_hosts_in_person_clinic_check")) return intl.formatMessage(m.errorClinic);
    return message;
  };

  const write = async (update: Partial<BookingHost>) => {
    setSaving(true);
    const { data, error } = await supaClient.from("booking_hosts").update(update).eq("id", doctor.id).select("*").single();
    setSaving(false);
    if (error || !data) {
      toast.error(intl.formatMessage(m.saveFailed, { error: dbError(error?.message ?? "network") }), { duration: 8000 });
      return null;
    }
    onSaved(data);
    return data;
  };

  const save = async () => {
    setTriedSave(true);
    if (hasErrors || !dirty) return;
    if (await write(changes as Partial<BookingHost>)) toast.success(intl.formatMessage(m.saved));
  };

  const setActive = async (active: boolean) => {
    if (await write({ active })) {
      toast.success(intl.formatMessage(active ? m.activated : m.deactivated, { name: doctor.name }));
      setConfirmOff(false);
    }
  };

  const toggleMode = (mode: string) =>
    set("modes", draft.modes.includes(mode) ? draft.modes.filter((x) => x !== mode) : [...draft.modes, mode]);

  const practiceCharge = (key: "referral_charge" | "no_show_charge") =>
    settings && isCharge(settings[key]) ? chargeLabel(intl, settings[key] as Charge) : practiceDefaultLabel(intl);
  const chargeOptions = (key: "referral_charge" | "no_show_charge") => [
    { value: "default" as ChargeChoice, label: intl.formatMessage(m.chargeDefault, { value: practiceCharge(key) }) },
    ...CHARGES.map((c) => ({ value: c as ChargeChoice, label: chargeLabel(intl, c) })),
  ];
  // The input already shows ₹, so the placeholder is the bare amount
  const feePlaceholder = (paise: number | undefined) => (paise == null ? undefined : intl.formatMessage(m.feeDefault, { fee: rupeesInput(paise) }));
  const clinic = clinics.find((c) => c.id === draft.clinic_id);
  const initials = doctor.name.replace(/^dr\.?\s+/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const canActivate = state === "ready" && !dirty;

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-start gap-3 mb-4">
          <span
            className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[var(--surface-inset)] border border-[var(--border-subtle)] font-semibold"
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold break-words focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] rounded">
              {doctor.name}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.shownOn)}</p>
            <div className="mt-2">
              <Pill tone={STATE_TONE[state]}>{stateLabel(state)}</Pill>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <TextField id="doctor-name" label={intl.formatMessage(m.name)} value={draft.name} error={shownError("name")} autoComplete="name" onChange={(v) => set("name", v)} />
          <TextField
            id="doctor-qualification"
            label={intl.formatMessage(m.qualification)}
            hint={intl.formatMessage(m.qualificationHint)}
            value={draft.qualification}
            error={shownError("qualification")}
            onChange={(v) => set("qualification", v)}
          />
          <TextField id="doctor-specialty" label={intl.formatMessage(m.specialty)} value={draft.specialty} error={shownError("specialty")} list="doctor-specialties" onChange={(v) => set("specialty", v)} />
          <datalist id="doctor-specialties">
            {SPECIALTIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </Panel>

      <Panel title={intl.formatMessage(m.registrationTitle)} description={intl.formatMessage(m.registrationHelp)}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="doctor-reg-number" label={intl.formatMessage(m.number)} value={draft.registration_number} error={shownError("registration_number")} onChange={(v) => set("registration_number", v)} />
            <TextField id="doctor-reg-council" label={intl.formatMessage(m.council)} value={draft.registration_council} error={shownError("registration_council")} onChange={(v) => set("registration_council", v)} />
          </div>
          <Checkbox checked={draft.checked} describedBy={errors.checked ? "doctor-checked-error" : undefined} onChange={(v) => set("checked", v)}>
            {intl.formatMessage(m.checked)}
              {draft.checked && doctor.registration_verified_at && !registrationChanged && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--status-success)] mt-1">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3" aria-hidden="true" />
                  {intl.formatMessage(m.checkedOn, {
                    date: new Date(doctor.registration_verified_at).toLocaleDateString(intl.locale, { day: "numeric", month: "short", year: "numeric" }),
                  })}
                </span>
              )}
          </Checkbox>
          {errors.checked && <FieldError id="doctor-checked-error">{errors.checked}</FieldError>}
          {registrationChanged && doctor.registration_verified_at && !draft.checked && <Notice tone="warning">{intl.formatMessage(m.recheck)}</Notice>}
          <Field label={intl.formatMessage(m.validUntil)} htmlFor="doctor-reg-valid">
            <input
              id="doctor-reg-valid"
              type="date"
              className={inputClass}
              value={draft.registration_valid_until}
              onChange={(e) => set("registration_valid_until", e.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <Panel title={intl.formatMessage(m.consultTitle)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2" aria-describedby={errors.modes ? "doctor-modes-error" : undefined}>
            <legend className="text-sm font-semibold mb-2">{intl.formatMessage(m.modes)}</legend>
            <div className="flex flex-wrap gap-2">
              {MODES.map((mode) => {
                const on = draft.modes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleMode(mode)}
                    className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] ${
                      on
                        ? "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] border-transparent"
                        : "border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)]"
                    }`}
                  >
                    {on && <FontAwesomeIcon icon={faCheck} className="w-3 h-3" aria-hidden="true" />}
                    {modeLabel(intl, mode)}
                  </button>
                );
              })}
            </div>
            {errors.modes && <p id="doctor-modes-error" className="text-sm text-[var(--status-danger)]" role="alert">{errors.modes}</p>}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeeInput
              id="doctor-first-fee"
              label={intl.formatMessage(m.firstFee)}
              value={draft.first_fee}
              placeholder={feePlaceholder(settings?.first_consult_fee_paise)}
              error={shownError("first_fee")}
              onChange={(v) => set("first_fee", v)}
            />
            <FeeInput
              id="doctor-follow-up-fee"
              label={intl.formatMessage(m.followUpFee)}
              value={draft.follow_up_fee}
              placeholder={feePlaceholder(settings?.follow_up_fee_paise)}
              error={shownError("follow_up_fee")}
              onChange={(v) => set("follow_up_fee", v)}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] -mt-2">{intl.formatMessage(m.feeHint)}</p>
          {(["referral_charge", "no_show_charge"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <p className="text-sm font-semibold">{intl.formatMessage(key === "referral_charge" ? m.referral : m.noShow)}</p>
              <ChipGroup<ChargeChoice>
                label={intl.formatMessage(key === "referral_charge" ? m.referral : m.noShow)}
                options={chargeOptions(key)}
                value={draft[key]}
                onChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={intl.formatMessage(m.clinicTitle)} description={intl.formatMessage(m.clinicHelp)}>
        <div className="flex flex-col gap-3">
          <Field label={intl.formatMessage(m.clinic)} htmlFor="doctor-clinic">
            <select id="doctor-clinic" className={inputClass} value={draft.clinic_id} onChange={(e) => set("clinic_id", e.target.value)}>
              <option value="">{intl.formatMessage(m.noClinic)}</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {clinic && (
            <p className="text-sm text-[var(--text-muted)]">
              {[clinic.address_line1, clinic.address_line2, clinic.city, clinic.postcode].filter(Boolean).join(", ")}
            </p>
          )}
          <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.calendar)}</p>
          <Link
            href={`/admin/booking?tab=hours&host=${doctor.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline w-fit min-h-[44px]"
          >
            {intl.formatMessage(m.hours)}
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </Panel>

      <div className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="primary" disabled={saving || !dirty} onClick={save}>
            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" aria-hidden="true" />
            {intl.formatMessage(m.save)}
          </Button>
          {doctor.active ? (
            <Button variant="danger" disabled={saving || confirmOff || dirty} onClick={() => setConfirmOff(true)}>
              {intl.formatMessage(m.deactivate)}
            </Button>
          ) : (
            <Button variant="accent" disabled={saving || !canActivate} onClick={() => setActive(true)} aria-describedby={canActivate ? undefined : "doctor-activate-needs"}>
              {intl.formatMessage(m.activate)}
            </Button>
          )}
        </div>
        {dirty && (
          <Button variant="ghost" className="w-fit" disabled={saving} onClick={() => setDraft(toDraft(doctor))}>
            {intl.formatMessage(m.discard)}
          </Button>
        )}
        {doctor.active && dirty && <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.saveFirst)}</p>}
        {!doctor.active && !canActivate && (
          <p id="doctor-activate-needs" className="text-sm text-[var(--text-muted)] flex items-start gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 mt-0.5 text-[var(--status-warning)]" aria-hidden="true" />
            {intl.formatMessage(m.activateNeeds, { state: dirty ? "dirty" : state })}
          </p>
        )}
        {confirmOff && (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--status-danger)] p-4">
            <p className="text-sm">{intl.formatMessage(m.deactivateConfirm, { name: doctor.name })}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="danger" disabled={saving} onClick={() => setActive(false)}>
                {intl.formatMessage(m.deactivateYes)}
              </Button>
              <Button ref={keepRef} variant="ghost" disabled={saving} onClick={() => setConfirmOff(false)}>
                {intl.formatMessage(m.keep)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  error,
  list,
  autoComplete = "off",
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  list?: string;
  autoComplete?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <Field label={label} htmlFor={id} hint={hint}>
        <input
          id={id}
          className={inputClass}
          value={value}
          list={list}
          autoComplete={autoComplete}
          maxLength={MAX_TEXT + 20}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}
