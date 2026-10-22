import { defineMessages, type IntlShape } from "react-intl";
import { durationLabel } from "../../lib/booking/format";
import { formatRupees, isCharge, type Charge, type Mode } from "../../lib/practice";

// Labels shared by the practice admin pages (/admin/doctors, /admin/practice)
// and their change history.

const m = defineMessages({
  chargeFull: { id: "practice-charge-full", description: "Charge rule: the patient pays the full fee", defaultMessage: "Full fee" },
  chargeThreeQuarters: { id: "practice-charge-three-quarters", description: "Charge rule: the patient pays three-quarters of the fee", defaultMessage: "Three-quarters" },
  chargeHalf: { id: "practice-charge-half", description: "Charge rule: the patient pays half the fee", defaultMessage: "Half" },
  chargeFree: { id: "practice-charge-free", description: "Charge rule: the patient pays nothing", defaultMessage: "Free" },
  modeInPerson: { id: "practice-mode-in-person", description: "Visit mode: at the clinic", defaultMessage: "In person" },
  modeVideo: { id: "practice-mode-video", description: "Visit mode: video call", defaultMessage: "Video" },
  modeAudio: { id: "practice-mode-audio", description: "Visit mode: audio call", defaultMessage: "Audio" },
  on: { id: "practice-value-on", description: "History value: a switch turned on", defaultMessage: "On" },
  off: { id: "practice-value-off", description: "History value: a switch turned off", defaultMessage: "Off" },
  empty: { id: "practice-value-empty", description: "History value: nothing set", defaultMessage: "Not set" },
  practiceDefault: { id: "practice-value-practice-default", description: "History value: a doctor uses the practice setting", defaultMessage: "Practice default" },
  checked: { id: "practice-value-checked", description: "History value: registration checked", defaultMessage: "Checked" },
  notChecked: { id: "practice-value-not-checked", description: "History value: registration not checked", defaultMessage: "Not checked" },
  days: { id: "practice-value-days", description: "A number of days", defaultMessage: "{count, plural, one {# day} other {# days}}" },
  everyone: { id: "practice-value-everyone", description: "Who may pay at the clinic: everyone", defaultMessage: "Everyone" },
  returning: { id: "practice-value-returning", description: "Who may pay at the clinic: returning patients only", defaultMessage: "Returning patients only" },
  noBuffer: { id: "practice-value-no-buffer", description: "Zero minutes between calls", defaultMessage: "None" },

  // Field names in the change history
  follow_up_days: { id: "practice-field-follow-up-days", description: "History field: free follow-up window", defaultMessage: "Free follow-up window" },
  first_consult_fee_paise: { id: "practice-field-first-fee", description: "History field: first consultation fee", defaultMessage: "First consultation fee" },
  follow_up_fee_paise: { id: "practice-field-follow-up-fee", description: "History field: paid follow-up fee", defaultMessage: "Paid follow-up fee" },
  referral_charge: { id: "practice-field-referral-charge", description: "History field: charge when referred", defaultMessage: "Referral charge" },
  no_show_charge: { id: "practice-field-no-show-charge", description: "History field: charge for a missed visit", defaultMessage: "No-show charge" },
  pay_at_clinic: { id: "practice-field-pay-at-clinic", description: "History field: paying at reception allowed", defaultMessage: "Pay at the clinic" },
  pay_at_clinic_who: { id: "practice-field-pay-at-clinic-who", description: "History field: who can pay at reception", defaultMessage: "Who can pay at the clinic" },
  min_notice_minutes: { id: "practice-field-min-notice", description: "History field: minimum notice", defaultMessage: "Minimum notice" },
  cancel_cutoff_minutes: { id: "practice-field-cancel-cutoff", description: "History field: free cancellation until", defaultMessage: "Free cancellation until" },
  buffer_minutes: { id: "practice-field-buffer", description: "History field: gap between calls", defaultMessage: "Gap between calls" },
  max_days_ahead: { id: "practice-field-max-days", description: "History field: bookable ahead", defaultMessage: "Bookable ahead" },
  name: { id: "practice-field-name", description: "History field: doctor's name", defaultMessage: "Name" },
  qualification: { id: "practice-field-qualification", description: "History field: doctor's qualifications", defaultMessage: "Qualifications" },
  specialty: { id: "practice-field-specialty", description: "History field: doctor's specialty", defaultMessage: "Specialty" },
  registration_number: { id: "practice-field-registration-number", description: "History field: registration number", defaultMessage: "Registration number" },
  registration_council: { id: "practice-field-registration-council", description: "History field: medical council", defaultMessage: "Medical council" },
  registration_valid_until: { id: "practice-field-registration-valid-until", description: "History field: registration valid until", defaultMessage: "Registration valid until" },
  registration_verified_at: { id: "practice-field-registration-verified", description: "History field: registration check", defaultMessage: "Registration check" },
  clinic_id: { id: "practice-field-clinic", description: "History field: doctor's clinic", defaultMessage: "Clinic" },
  modes: { id: "practice-field-modes", description: "History field: visit modes offered", defaultMessage: "Modes" },
  active: { id: "practice-field-active", description: "History field: doctor can be booked", defaultMessage: "Bookable" },
});

const CHARGE_MESSAGE = { full: m.chargeFull, three_quarters: m.chargeThreeQuarters, half: m.chargeHalf, free: m.chargeFree };
const MODE_MESSAGE = { in_person: m.modeInPerson, video: m.modeVideo, audio: m.modeAudio };

export const chargeLabel = (intl: IntlShape, charge: Charge) => intl.formatMessage(CHARGE_MESSAGE[charge]);
export const modeLabel = (intl: IntlShape, mode: string) =>
  mode in MODE_MESSAGE ? intl.formatMessage(MODE_MESSAGE[mode as Mode]) : mode;
export const daysLabel = (intl: IntlShape, count: number) => intl.formatMessage(m.days, { count });
export const payWhoLabel = (intl: IntlShape, who: string) => intl.formatMessage(who === "returning" ? m.returning : m.everyone);
export const practiceDefaultLabel = (intl: IntlShape) => intl.formatMessage(m.practiceDefault);
export const minutesLabel = (intl: IntlShape, minutes: number) => (minutes === 0 ? intl.formatMessage(m.noBuffer) : durationLabel(minutes));

export function fieldLabel(intl: IntlShape, field: string): string {
  const message = (m as Record<string, (typeof m)["name"]>)[field];
  return message ? intl.formatMessage(message) : field;
}

/** A history value as people read it, e.g. 40000 → "₹400", "half" → "Half" */
export function valueLabel(intl: IntlShape, field: string, value: unknown, clinicName: (id: string) => string | undefined): string {
  if (field === "registration_verified_at") return intl.formatMessage(value ? m.checked : m.notChecked);
  const doctorField = ["first_consult_fee_paise", "follow_up_fee_paise", "referral_charge", "no_show_charge"].includes(field);
  if (value == null || value === "") return intl.formatMessage(doctorField ? m.practiceDefault : m.empty);
  if (field.endsWith("_paise") && typeof value === "number") return formatRupees(value);
  if (field.endsWith("_charge") && isCharge(value)) return chargeLabel(intl, value);
  if (field.endsWith("_minutes") && typeof value === "number") return minutesLabel(intl, value);
  if ((field === "follow_up_days" || field === "max_days_ahead") && typeof value === "number") return daysLabel(intl, value);
  if (field === "pay_at_clinic_who") return payWhoLabel(intl, String(value));
  if (field === "registration_valid_until" && typeof value === "string")
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(intl.locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  if (field === "clinic_id") return clinicName(String(value)) ?? String(value);
  if (field === "modes" && Array.isArray(value)) return value.map((mode) => modeLabel(intl, String(mode))).join(", ");
  if (typeof value === "boolean") return intl.formatMessage(value ? m.on : m.off);
  return String(value);
}
