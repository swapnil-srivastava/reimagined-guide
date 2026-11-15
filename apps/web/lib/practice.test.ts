import { test } from "node:test";
import assert from "node:assert/strict";
import { changedFields, csvRow, doctorState, formatRupees, parseRupees, parseWhole, rupeesInput, slugify, todayInIndia } from "./practice.ts";

test("rupees are typed with or without ₹, commas and paise", () => {
  assert.equal(parseRupees("600"), 60000);
  assert.equal(parseRupees("₹ 1,200"), 120000);
  assert.equal(parseRupees("612.5"), 61250);
  assert.equal(parseRupees(""), null);
  assert.equal(parseRupees("6.123"), "format");
  assert.equal(parseRupees("-5"), "format");
  assert.equal(parseRupees("100001"), "too_high");
});

test("rupees show without paise when whole", () => {
  assert.equal(formatRupees(60000), "₹600");
  assert.equal(formatRupees(61250), "₹612.50");
  assert.equal(formatRupees(10000000), "₹1,00,000");
  assert.equal(rupeesInput(60000), "600");
  assert.equal(rupeesInput(61250), "612.50");
  assert.equal(rupeesInput(null), "");
});

test("whole numbers stay in range", () => {
  assert.equal(parseWhole("5", 0, 30), 5);
  assert.equal(parseWhole("31", 0, 30), null);
  assert.equal(parseWhole("2.5", 0, 30), null);
  assert.equal(parseWhole("", 0, 30), null);
});

const doctor = {
  active: false,
  registration_number: "12345",
  registration_council: "Maharashtra Medical Council",
  registration_verified_at: "2026-10-18T10:00:00Z",
  registration_valid_until: "2029-03-31",
};

test("a doctor is pending until checked, and expired after the valid-until date", () => {
  assert.equal(doctorState(doctor, "2026-10-22"), "ready");
  assert.equal(doctorState({ ...doctor, active: true }, "2026-10-22"), "active");
  assert.equal(doctorState({ ...doctor, registration_verified_at: null }, "2026-10-22"), "pending");
  assert.equal(doctorState({ ...doctor, registration_number: " " }, "2026-10-22"), "pending");
  assert.equal(doctorState({ ...doctor, active: true }, "2029-04-01"), "expired");
});

test("today is the date in India", () => {
  // 20:00 UTC on 22 Oct is 01:30 on 23 Oct in IST
  assert.equal(todayInIndia(new Date("2026-10-22T20:00:00Z")), "2026-10-23");
  assert.equal(todayInIndia(new Date("2026-10-22T10:00:00Z")), "2026-10-22");
});

test("slugs drop the Dr. prefix and accents", () => {
  assert.equal(slugify("Dr. Garima Srivastava"), "garima-srivastava");
  assert.equal(slugify("Dr Ánanya  Sharma!"), "ananya-sharma");
  assert.equal(slugify("***"), "");
});

test("only changed fields are sent", () => {
  const current = { a: 1, modes: ["video"], b: null as string | null };
  assert.deepEqual(changedFields(current, { a: 1, modes: ["video"], b: null }), {});
  assert.deepEqual(changedFields(current, { a: 2, modes: ["video", "audio"] }), { a: 2, modes: ["video", "audio"] });
});

test("CSV cells are quoted and formulas defused", () => {
  assert.equal(csvRow(["a", 'say "hi"', null, 5]), '"a","say ""hi""","","5"');
  assert.equal(csvRow(["=HYPERLINK()"]), `"'=HYPERLINK()"`);
});
