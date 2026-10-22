// Run with: pnpm test:doctors  (Node's built-in test runner, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NO_FILTERS,
  activeFilterCount,
  allLanguages,
  availableWithin,
  clinicAddress,
  filterDoctors,
  filtersFromQuery,
  filtersToQuery,
  hoursByWeekday,
  matchesQuery,
  modeOfLocation,
  specialtyCounts,
  withoutPastSlots,
} from "./directory.ts";
import type { PublicDoctor } from "./directory.ts";

const NOW = new Date("2026-10-22T06:00:00Z"); // 11:30 in India
const IST = "Asia/Kolkata";

const doctor = (over: Partial<PublicDoctor>): PublicDoctor => ({
  slug: "x",
  name: "Dr. X",
  title: null,
  qualification: null,
  specialty: null,
  bio: null,
  languages: [],
  photo_url: null,
  modes: ["in_person"],
  registration_number: null,
  registration_council: null,
  registration_verified: false,
  timezone: IST,
  clinic: null,
  weekly_hours: [],
  consultations: [],
  next_slots: [],
  ...over,
});

const garima = doctor({
  slug: "garima-srivastava",
  name: "Dr. Garima Srivastava",
  specialty: "General Physician",
  qualification: "MBBS (KGMC Lucknow)",
  languages: ["English", "Hindi", "Marathi"],
  modes: ["in_person", "video", "audio"],
  next_slots: ["2026-10-22T11:00:00Z"], // today, 16:30 IST
});
const neel = doctor({
  slug: "neel-kamal-srivastava",
  name: "Dr. Neel Kamal Srivastava",
  specialty: "Cardiologist",
  languages: ["English", "Hindi"],
  modes: ["video"],
  next_slots: ["2026-10-25T04:30:00Z"], // in three days
});
const noTimes = doctor({ slug: "a", name: "Dr. Aarti", specialty: "General Physician" });
const all = [noTimes, neel, garima];

test("search matches every typed word, ignoring case and accents", () => {
  assert.ok(matchesQuery(garima, "garima"));
  assert.ok(matchesQuery(garima, "GENERAL physician"));
  assert.ok(matchesQuery(garima, "kgmc marathi"));
  assert.ok(matchesQuery(doctor({ name: "Dr. José" }), "jose"));
  assert.ok(!matchesQuery(garima, "cardio"));
  assert.ok(!matchesQuery(garima, "garima german"));
  assert.ok(matchesQuery(garima, "   "));
});

test("default sort: soonest free time first, doctors without times last", () => {
  const order = filterDoctors(all, NO_FILTERS, NOW, IST).map((d) => d.slug);
  assert.deepEqual(order, ["garima-srivastava", "neel-kamal-srivastava", "a"]);
});

test("sort by name", () => {
  const order = filterDoctors(all, { ...NO_FILTERS, sort: "name" }, NOW, IST).map((d) => d.name);
  assert.deepEqual(order, ["Dr. Aarti", "Dr. Garima Srivastava", "Dr. Neel Kamal Srivastava"]);
});

test("specialty, language and mode filters", () => {
  const pick = (f: Partial<typeof NO_FILTERS>) => filterDoctors(all, { ...NO_FILTERS, ...f }, NOW, IST).map((d) => d.slug);
  assert.deepEqual(pick({ specialty: "Cardiologist" }), ["neel-kamal-srivastava"]);
  assert.deepEqual(pick({ languages: ["Marathi"] }), ["garima-srivastava"]);
  // Any one of the chosen languages is enough
  assert.deepEqual(pick({ languages: ["Marathi", "Hindi"] }), ["garima-srivastava", "neel-kamal-srivastava"]);
  assert.deepEqual(pick({ modes: ["audio"] }), ["garima-srivastava"]);
  assert.deepEqual(pick({ modes: ["video"], specialty: "General Physician" }), ["garima-srivastava"]);
});

test("availability: today is the visitor's day, this week is the next 7 days", () => {
  assert.ok(availableWithin(garima, "today", NOW, IST));
  assert.ok(!availableWithin(neel, "today", NOW, IST));
  assert.ok(availableWithin(neel, "week", NOW, IST));
  assert.ok(!availableWithin(noTimes, "week", NOW, IST));
  assert.ok(availableWithin(noTimes, "any", NOW, IST));
  // 16:30 IST on the 22nd is still the 22nd in Berlin, but the 23rd in Auckland
  assert.ok(availableWithin(garima, "today", NOW, "Europe/Berlin"));
  assert.ok(!availableWithin(garima, "today", NOW, "Pacific/Auckland"));
});

test("past free times are dropped", () => {
  const [d] = withoutPastSlots([doctor({ next_slots: ["2026-10-22T05:00:00Z", "2026-10-22T07:00:00Z"] })], NOW.getTime());
  assert.deepEqual(d.next_slots, ["2026-10-22T07:00:00Z"]);
});

test("specialties are counted, most doctors first", () => {
  assert.deepEqual(specialtyCounts(all), [
    { specialty: "General Physician", count: 2 },
    { specialty: "Cardiologist", count: 1 },
  ]);
  assert.deepEqual(specialtyCounts([doctor({})]), []);
  assert.deepEqual(allLanguages(all), ["English", "Hindi", "Marathi"]);
});

test("filters survive a round trip through the URL", () => {
  const filters = {
    query: "garima",
    specialty: "General Physician",
    languages: ["Hindi", "English"],
    modes: ["video" as const, "in_person" as const],
    availability: "week" as const,
    sort: "name" as const,
  };
  assert.deepEqual(filtersFromQuery(filtersToQuery(filters)), filters);
  assert.deepEqual(filtersToQuery(NO_FILTERS), {});
  assert.equal(activeFilterCount(filters), 5);
});

test("bad URL values fall back to the defaults", () => {
  const filters = filtersFromQuery({ mode: "chat,video", when: "tomorrow", sort: "price", q: ["a", "b"] });
  assert.deepEqual(filters.modes, ["video"]);
  assert.equal(filters.availability, "any");
  assert.equal(filters.sort, "next");
  assert.equal(filters.query, "a");
  assert.equal(filtersFromQuery({ q: "x".repeat(500) }).query.length, 100);
});

test("weekly hours are grouped per weekday, Monday first, ranges in order", () => {
  const days = hoursByWeekday([
    { weekday: 1, start_time: "14:00:00", end_time: "18:00:00" },
    { weekday: 1, start_time: "10:00:00", end_time: "13:00:00" },
    { weekday: 6, start_time: "10:00:00", end_time: "24:00:00" },
  ]);
  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { weekday: 1, ranges: [["10:00", "13:00"], ["14:00", "18:00"]] });
  assert.deepEqual(days[5].ranges, [["10:00", "24:00"]]);
  assert.deepEqual(days[6].ranges, []);
});

test("clinic address and booking type modes", () => {
  const clinic = {
    name: "Srivastava Family Clinic",
    address_line1: "FC Road",
    address_line2: null,
    city: "Pune",
    state: "Maharashtra",
    postcode: "411004",
    phone: null,
    map_url: null,
  };
  assert.equal(clinicAddress(clinic), "FC Road, Pune, Maharashtra 411004");
  assert.equal(clinicAddress({ ...clinic, state: null, postcode: null }), "FC Road, Pune");
  assert.equal(modeOfLocation("phone"), "audio");
  assert.equal(modeOfLocation("in_person"), "in_person");
  assert.equal(modeOfLocation("video"), "video");
});
