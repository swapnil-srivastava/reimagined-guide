// Run with: pnpm test:booking  (Node's built-in test runner, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime } from "luxon";
import { computeSlots, openRangesForDate } from "./slots.ts";
import type { SlotInput } from "./slots.ts";

const BERLIN = "Europe/Berlin";

const rules = {
  duration_minutes: 30,
  slot_step_minutes: 30,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  min_notice_minutes: 0,
  max_days_ahead: 60,
  daily_limit: null,
};

const weekdays9to17 = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, start_time: "09:00", end_time: "17:00" }));

function input(overrides: Partial<SlotInput> = {}): SlotInput {
  return {
    timezone: BERLIN,
    weeklyHours: weekdays9to17,
    overrides: [],
    blocks: [],
    bookings: [],
    rules,
    now: new Date("2026-10-01T00:00:00Z"),
    from: new Date("2026-11-02T00:00:00+01:00"), // Monday
    to: new Date("2026-11-03T00:00:00+01:00"),
    ...overrides,
  };
}

const berlinTimes = (slots: { start: string }[]) =>
  slots.map((s) => DateTime.fromISO(s.start).setZone(BERLIN).toFormat("HH:mm"));

test("a 9 to 5 day gives 16 half-hour slots, the last at 16:30", () => {
  const times = berlinTimes(computeSlots(input()));
  assert.equal(times.length, 16);
  assert.equal(times[0], "09:00");
  assert.equal(times[15], "16:30");
});

test("a 60-minute call needs two free half hours, so the last start is 16:00", () => {
  const times = berlinTimes(computeSlots(input({ rules: { ...rules, duration_minutes: 60 } })));
  assert.equal(times.length, 15);
  assert.equal(times[times.length - 1], "16:00");
});

test("weekends are closed when they have no hours", () => {
  const slots = computeSlots(
    input({ from: new Date("2026-11-07T00:00:00+01:00"), to: new Date("2026-11-09T00:00:00+01:00") })
  );
  assert.equal(slots.length, 0);
});

test("a block of any length removes every slot it touches", () => {
  const blocks = [{ starts_at: "2026-11-02T10:10:00+01:00", ends_at: "2026-11-02T11:00:00+01:00" }];
  const times = berlinTimes(computeSlots(input({ blocks })));
  assert.ok(!times.includes("10:00"));
  assert.ok(!times.includes("10:30"));
  assert.ok(times.includes("09:30"));
  assert.ok(times.includes("11:00"));
});

test("a buffer after a booking keeps the next slot free", () => {
  const bookings = [{ starts_at: "2026-11-02T10:00:00+01:00", ends_at: "2026-11-02T10:45:00+01:00" }];
  const times = berlinTimes(computeSlots(input({ bookings, rules: { ...rules, buffer_after_minutes: 15 } })));
  assert.ok(!times.includes("10:00"));
  assert.ok(!times.includes("10:30"));
  // 09:30 + 30 min + 15 min buffer runs into the booking at 10:00
  assert.ok(!times.includes("09:30"));
  assert.ok(times.includes("11:00"));
});

test("minimum notice hides slots too soon", () => {
  const now = new Date("2026-11-02T08:00:00+01:00");
  const times = berlinTimes(computeSlots(input({ now, rules: { ...rules, min_notice_minutes: 12 * 60 } })));
  assert.equal(times.length, 0); // 08:00 + 12h = 20:00, after closing
});

test("slots further ahead than the booking window are hidden", () => {
  const now = new Date("2026-10-01T00:00:00Z");
  const slots = computeSlots(input({ now, rules: { ...rules, max_days_ahead: 30 } }));
  assert.equal(slots.length, 0); // 2 Nov is 32 days later
});

test("the daily limit closes a day once it is reached", () => {
  const bookings = [{ starts_at: "2026-11-02T09:00:00+01:00", ends_at: "2026-11-02T09:30:00+01:00" }];
  assert.equal(computeSlots(input({ bookings, rules: { ...rules, daily_limit: 1 } })).length, 0);
});

test("only the bookings in limitStarts count toward the daily limit", () => {
  // A call of another type that day still blocks its own time, but not the day
  const bookings = [{ starts_at: "2026-11-02T09:00:00+01:00", ends_at: "2026-11-02T09:30:00+01:00" }];
  const slots = computeSlots(input({ bookings, limitStarts: [], rules: { ...rules, daily_limit: 1 } }));
  assert.ok(slots.length > 0);
  assert.ok(!slots.some((s) => s.start === "2026-11-02T08:00:00.000Z"));
});

test("a date override replaces that day's hours, and a closed override closes it", () => {
  const short = computeSlots(input({ overrides: [{ date: "2026-11-02", start_time: "10:00", end_time: "11:00" }] }));
  assert.deepEqual(berlinTimes(short), ["10:00", "10:30"]);
  const closed = computeSlots(input({ overrides: [{ date: "2026-11-02", start_time: null, end_time: null }] }));
  assert.equal(closed.length, 0);
});

test("overlapping weekly ranges are merged, not doubled", () => {
  const weeklyHours = [
    { weekday: 1, start_time: "09:00", end_time: "12:00" },
    { weekday: 1, start_time: "11:00", end_time: "13:00" },
  ];
  const ranges = openRangesForDate(DateTime.fromISO("2026-11-02", { zone: BERLIN }), weeklyHours, []);
  assert.deepEqual(ranges, [[540, 780]]);
});

test("hours stay 09:00 Berlin time across the October clock change", () => {
  // Friday 23 Oct is summer time (UTC+2), Monday 26 Oct is winter time (UTC+1)
  const before = computeSlots(input({ from: new Date("2026-10-23T00:00:00+02:00"), to: new Date("2026-10-24T00:00:00+02:00") }));
  const after = computeSlots(input({ from: new Date("2026-10-26T00:00:00+01:00"), to: new Date("2026-10-27T00:00:00+01:00") }));
  assert.equal(before[0].start, "2026-10-23T07:00:00.000Z");
  assert.equal(after[0].start, "2026-10-26T08:00:00.000Z");
});

test("the hour skipped in spring is never offered, and nothing is doubled in autumn", () => {
  const night = [{ weekday: 7, start_time: "00:00", end_time: "24:00" }];
  // Sunday 28 March 2027: 02:00-03:00 does not exist in Berlin
  const spring = computeSlots(
    input({
      weeklyHours: night,
      rules: { ...rules, max_days_ahead: 365 },
      from: new Date("2027-03-28T00:00:00+01:00"),
      to: new Date("2027-03-29T00:00:00+02:00"),
    })
  );
  assert.equal(spring.length, 46);
  assert.ok(!berlinTimes(spring).includes("02:00"));
  // Sunday 25 October 2026: 02:00-03:00 happens twice; each wall time is offered once
  const autumn = computeSlots(
    input({ weeklyHours: night, from: new Date("2026-10-25T00:00:00+02:00"), to: new Date("2026-10-26T00:00:00+01:00") })
  );
  assert.equal(new Set(autumn.map((s) => s.start)).size, autumn.length);
  assert.equal(new Set(berlinTimes(autumn)).size, 48);
});

test("a buyer in India sees Berlin's 09:00 as 13:30 the same day", () => {
  const first = computeSlots(input())[0];
  assert.equal(DateTime.fromISO(first.start).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd HH:mm"), "2026-11-02 13:30");
});

test("a late Berlin slot lands on the next day for a buyer in Tokyo", () => {
  const evening = [{ weekday: 1, start_time: "18:00", end_time: "19:00" }];
  const slots = computeSlots(input({ weeklyHours: evening }));
  assert.equal(DateTime.fromISO(slots[0].start).setZone("Asia/Tokyo").toFormat("yyyy-MM-dd HH:mm"), "2026-11-03 02:00");
});

test("a host in another zone gets their own local hours", () => {
  const slots = computeSlots(
    input({ timezone: "America/New_York", from: new Date("2026-11-02T00:00:00-05:00"), to: new Date("2026-11-03T00:00:00-05:00") })
  );
  assert.equal(slots[0].start, "2026-11-02T14:00:00.000Z");
});
