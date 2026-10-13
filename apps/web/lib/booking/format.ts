import { DateTime } from "luxon";

// Date and time labels for booking pages. Every label is for an explicit
// zone (the host's or the buyer's), never the server's.

export function inZone(iso: string, zone: string, locale?: string): DateTime {
  const dt = DateTime.fromISO(iso).setZone(zone);
  return locale ? dt.setLocale(locale) : dt;
}

/** "Mon, 2 Nov" */
export const dayLabel = (dt: DateTime) =>
  dt.toLocaleString({ weekday: "short", day: "numeric", month: "short" });

/** "Monday, 2 November 2026" */
export const longDayLabel = (dt: DateTime) =>
  dt.toLocaleString({ weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "09:30" or "9:30 AM", following the locale */
export const timeLabel = (dt: DateTime) => dt.toLocaleString(DateTime.TIME_SIMPLE);

/** "09:00 – 09:30" */
export const rangeLabel = (start: DateTime, end: DateTime) => `${timeLabel(start)} – ${timeLabel(end)}`;

/** "1 h 30 min", "45 min", "2 days" */
export function durationLabel(minutes: number): string {
  if (minutes >= 1440 && minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "1 day" : `${days} days`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** "Central European Time" style name of a zone at a moment, for labels */
export function zoneName(zone: string, locale?: string, at: DateTime = DateTime.now()): string {
  const dt = at.setZone(zone);
  return (locale ? dt.setLocale(locale) : dt).offsetNameLong ?? zone;
}

/** Every IANA zone the browser knows, falling back to a short list */
export function allTimeZones(): string[] {
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    const zones = intl.supportedValuesOf?.("timeZone");
    if (zones?.length) return zones;
  } catch {
    // Older browsers
  }
  return ["Europe/Berlin", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Kolkata", "Asia/Tokyo", "UTC"];
}
