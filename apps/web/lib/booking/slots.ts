import { DateTime, Interval } from "luxon";

// Works out which start times can be booked. Pure (no database), so the
// admin calendar and the booking API use exactly the same rules.
//
// Weekly hours and date overrides are wall-clock times in the host's zone;
// blocks, bookings and the returned slots are real instants (ISO strings with
// an offset, stored as UTC). Keeping the two apart is what makes daylight
// saving and buyers in other zones come out right.

export interface WeeklyHours {
  /** ISO weekday, 1 = Monday ... 7 = Sunday */
  weekday: number;
  /** "HH:MM" or "HH:MM:SS"; "24:00" means the end of the day */
  start_time: string;
  end_time: string;
}

export interface DateOverride {
  /** "YYYY-MM-DD" in the host's zone */
  date: string;
  /** Both null: closed that day */
  start_time: string | null;
  end_time: string | null;
}

export interface BusyRange {
  starts_at: string;
  ends_at: string;
}

export interface BookingRules {
  duration_minutes: number;
  slot_step_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  min_notice_minutes: number;
  max_days_ahead: number;
  daily_limit: number | null;
}

export interface SlotInput {
  timezone: string;
  weeklyHours: WeeklyHours[];
  overrides: DateOverride[];
  blocks: BusyRange[];
  /** Confirmed bookings with their buffers (busy_from / busy_until) */
  bookings: BusyRange[];
  rules: BookingRules;
  now: Date;
  /** Only slots starting in [from, to) are returned */
  from: Date;
  to: Date;
}

export interface Slot {
  /** ISO instant in UTC */
  start: string;
  end: string;
}

/** Minutes since midnight for "HH:MM[:SS]"; "24:00" gives 1440 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((part) => parseInt(part, 10));
  return h * 60 + (m || 0);
}

/** "HH:MM" for minutes since midnight (1440 gives "24:00") */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * The open [start, end) minute ranges of one host-local date, merged and
 * sorted. Overrides for that date replace the weekly hours.
 */
export function openRangesForDate(
  date: DateTime,
  weeklyHours: WeeklyHours[],
  overrides: DateOverride[]
): Array<[number, number]> {
  const iso = date.toISODate();
  const dayOverrides = overrides.filter((o) => o.date === iso);
  const source = dayOverrides.length
    ? dayOverrides.filter((o) => o.start_time && o.end_time)
    : weeklyHours.filter((w) => w.weekday === date.weekday);

  const ranges = source
    .map((r) => [timeToMinutes(r.start_time as string), timeToMinutes(r.end_time as string)] as [number, number])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

/**
 * The instant for a wall-clock minute of a host-local date. Times that don't
 * exist (the hour skipped when clocks go forward) return null.
 */
export function wallClock(date: DateTime, minutes: number): DateTime | null {
  const base = date.startOf("day");
  if (minutes >= 1440) return base.plus({ days: 1 });
  const dt = base.set({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  if (dt.hour * 60 + dt.minute !== minutes) return null;
  return dt;
}

const toInterval = (range: BusyRange) =>
  Interval.fromDateTimes(DateTime.fromISO(range.starts_at), DateTime.fromISO(range.ends_at));

/** Every bookable slot in [from, to), earliest first */
export function computeSlots(input: SlotInput): Slot[] {
  const { timezone, rules } = input;
  const now = DateTime.fromJSDate(input.now);
  const earliest = now.plus({ minutes: rules.min_notice_minutes });
  const latest = now.plus({ days: rules.max_days_ahead });
  const from = DateTime.fromJSDate(input.from);
  const to = DateTime.fromJSDate(input.to);

  const busy = [...input.blocks, ...input.bookings].map(toInterval).filter((i) => i.isValid);

  // Bookings per host-local day, for the daily limit
  const perDay = new Map<string, number>();
  for (const booking of input.bookings) {
    const day = DateTime.fromISO(booking.starts_at).setZone(timezone).toISODate() as string;
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }

  const slots: Slot[] = [];
  const seen = new Set<number>();
  const step = rules.slot_step_minutes;

  // A day either side so buyers far east or west of the host see every slot
  let day = from.setZone(timezone).startOf("day").minus({ days: 1 });
  const lastDay = to.setZone(timezone).startOf("day").plus({ days: 1 });

  for (; day <= lastDay; day = day.plus({ days: 1 })) {
    if (rules.daily_limit && (perDay.get(day.toISODate() as string) ?? 0) >= rules.daily_limit) continue;

    for (const [open, close] of openRangesForDate(day, input.weeklyHours, input.overrides)) {
      const closeAt = wallClock(day, close) ?? wallClock(day, close + 60);
      if (!closeAt) continue;
      // Start times sit on the clock (:00, :30), counted from midnight
      for (let m = Math.ceil(open / step) * step; m < close; m += step) {
        const start = wallClock(day, m);
        if (!start) continue;
        const end = start.plus({ minutes: rules.duration_minutes });
        if (end > closeAt) break;
        if (start < earliest || start > latest || start < from || start >= to) continue;

        const millis = start.toMillis();
        if (seen.has(millis)) continue;

        const need = Interval.fromDateTimes(
          start.minus({ minutes: rules.buffer_before_minutes }),
          end.plus({ minutes: rules.buffer_after_minutes })
        );
        if (busy.some((b) => b.overlaps(need))) continue;

        seen.add(millis);
        slots.push({ start: start.toUTC().toISO() as string, end: end.toUTC().toISO() as string });
      }
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}
