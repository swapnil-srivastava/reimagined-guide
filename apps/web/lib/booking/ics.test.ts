// Run with: pnpm test:booking
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvite, foldLine, icsText } from "./ics.ts";

const base = {
  uid: "abc@swapnilsrivastava.eu",
  sequence: 0,
  method: "REQUEST" as const,
  start: new Date("2026-10-20T08:00:00Z"),
  end: new Date("2026-10-20T08:30:00Z"),
  summary: "1:1 Consultation Call",
  description: "Line one\nLine, two; three",
  organizerName: "Swapnil Srivastava",
  organizerEmail: "contact@swapnilsrivastava.eu",
  attendeeName: "Priya Sharma",
  attendeeEmail: "priya@example.com",
  now: new Date("2026-10-13T12:00:00Z"),
};

test("an invite has UTC times, CRLF line ends and a reminder", () => {
  const ics = buildInvite(base);
  assert.ok(ics.includes("DTSTART:20261020T080000Z\r\n"));
  assert.ok(ics.includes("DTEND:20261020T083000Z\r\n"));
  assert.ok(ics.includes("METHOD:REQUEST\r\n"));
  assert.ok(ics.includes("STATUS:CONFIRMED"));
  assert.ok(ics.includes("BEGIN:VALARM"));
  assert.ok(!/[^\r]\n/.test(ics), "every newline is CRLF");
});

test("a cancellation keeps the UID and has no reminder", () => {
  const ics = buildInvite({ ...base, method: "CANCEL", sequence: 2 });
  assert.ok(ics.includes("UID:abc@swapnilsrivastava.eu"));
  assert.ok(ics.includes("SEQUENCE:2"));
  assert.ok(ics.includes("STATUS:CANCELLED"));
  assert.ok(!ics.includes("VALARM"));
});

test("text is escaped", () => {
  assert.equal(icsText("a,b;c\\d\ne"), "a\\,b\\;c\\\\d\\ne");
});

test("long lines fold at 75 octets without splitting characters", () => {
  const line = "DESCRIPTION:" + "Grüße aus Berlin – ".repeat(10);
  const folded = foldLine(line);
  const parts = folded.split("\r\n");
  assert.ok(parts.length > 1);
  for (const p of parts) assert.ok(new TextEncoder().encode(p).length <= 75);
  assert.equal(parts.map((p, i) => (i ? p.slice(1) : p)).join(""), line);
});
