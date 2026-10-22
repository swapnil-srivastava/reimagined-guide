// Practice admin helpers (/admin/doctors, /admin/practice). The database
// checks the same limits (migration 20261022190000_practice_admin.sql); these
// are for friendly messages and labels. Money is in paise: ₹1 = 100 paise.

export const CHARGES = ["full", "three_quarters", "half", "free"] as const;
export type Charge = (typeof CHARGES)[number];

export const MODES = ["in_person", "video", "audio"] as const;
export type Mode = (typeof MODES)[number];

export const MAX_FEE_RUPEES = 100_000;
export const MAX_FOLLOW_UP_DAYS = 30;
export const MIN_REASON = 3;
export const MAX_REASON = 500;

/** Share of the fee a patient pays under a charge rule */
export const CHARGE_SHARE: Record<Charge, number> = { full: 1, three_quarters: 0.75, half: 0.5, free: 0 };

export const isCharge = (value: unknown): value is Charge => CHARGES.includes(value as Charge);

/** "₹600" or "₹612.50", Indian digit grouping ("₹1,00,000") */
export function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export type FeeError = "format" | "too_high";

/** A rupee amount as typed ("600", "₹ 1,200", "612.5") in paise. Empty is null. */
export function parseRupees(raw: string): number | null | FeeError {
  const text = raw.replace(/[₹\s,]/g, "");
  if (!text) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return "format";
  const paise = Math.round(Number(text) * 100);
  return paise > MAX_FEE_RUPEES * 100 ? "too_high" : paise;
}

/** The value for a fee input: "600" or "612.50" */
export const rupeesInput = (paise: number | null | undefined) =>
  paise == null ? "" : paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);

/** A whole number between min and max as typed, or null */
export function parseWhole(raw: string, min: number, max: number): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= min && n <= max ? n : null;
}

/** A doctor's own value when set, otherwise the practice's */
export const effective = <T>(own: T | null | undefined, practice: T): T => (own ?? practice);

/** What a doctor can see and do, from their row */
export interface DoctorLike {
  active: boolean;
  registration_number: string | null;
  registration_council: string | null;
  registration_verified_at: string | null;
  registration_valid_until: string | null;
}

export type DoctorState = "active" | "ready" | "pending" | "expired";

/** Today's date in India, "2026-10-22": registrations are valid until an IST date */
export const todayInIndia = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

/** True when a registration's "valid until" date has passed. Such a doctor can't be booked. */
export const registrationLapsed = (d: { registration_valid_until: string | null }, today: string) =>
  !!d.registration_valid_until && d.registration_valid_until < today;

/**
 * active: patients can book. ready: checked, but switched off.
 * pending: registration not checked yet. expired: the registration's
 * "valid until" date (IST) has passed.
 */
export function doctorState(d: DoctorLike, today: string): DoctorState {
  if (registrationLapsed(d, today)) return "expired";
  if (!d.registration_verified_at || !d.registration_number?.trim() || !d.registration_council?.trim()) return "pending";
  return d.active ? "active" : "ready";
}

/** URL-safe slug from a doctor's name, "Dr. Garima Srivastava" → "garima-srivastava" */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^dr\.?\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** The changed keys of `next` compared with `current` (shallow, arrays by value) */
export function changedFields<T extends Record<string, unknown>>(current: T, next: Partial<T>): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (JSON.stringify(current[key] ?? null) !== JSON.stringify(next[key] ?? null)) out[key] = next[key];
  }
  return out;
}

/** One history row as a CSV line; quotes every cell */
export function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells
    .map((cell) => {
      let text = cell == null ? "" : String(cell);
      // Spreadsheets run cells starting with these as formulas
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(",");
}
