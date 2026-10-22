// Calendar invites (.ics, RFC 5545) for booked calls. Times are written in
// UTC so every calendar app places them correctly whatever its zone.
//
// One call keeps one UID across reschedules (the first booking's id) and a
// rising SEQUENCE, so calendars move or remove the existing event instead of
// adding a second one.

export interface InviteInput {
  uid: string;
  sequence: number;
  method: "REQUEST" | "CANCEL";
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location?: string | null;
  url?: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  /** Left out of the invite when the person gave no email (doctor patients) */
  attendeeEmail?: string | null;
  now?: Date;
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Escapes text values (RFC 5545 section 3.3.11) */
export function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets, as the format requires. Works in the browser too. */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't split a multi-byte character
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(decoder.decode(bytes.subarray(start, end)));
    start = end;
    limit = 74; // continuation lines start with a space
  }
  return parts.join("\r\n ");
}

// Quoted parameter values may not hold control characters or quotes
const cn = (name: string) => `"${name.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/"/g, "'")}"`;

export function buildInvite(input: InviteInput): string {
  const cancelled = input.method === "CANCEL";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//swapnilsrivastava.eu//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${input.method}`,
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `SEQUENCE:${input.sequence}`,
    `DTSTAMP:${stamp(input.now ?? new Date())}`,
    `DTSTART:${stamp(input.start)}`,
    `DTEND:${stamp(input.end)}`,
    `SUMMARY:${icsText(input.summary)}`,
    `DESCRIPTION:${icsText(input.description)}`,
    ...(input.location ? [`LOCATION:${icsText(input.location)}`] : []),
    ...(input.url ? [`URL:${input.url}`] : []),
    `ORGANIZER;CN=${cn(input.organizerName)}:mailto:${input.organizerEmail}`,
    ...(input.attendeeEmail
      ? [`ATTENDEE;CN=${cn(input.attendeeName)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${input.attendeeEmail}`]
      : []),
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    ...(cancelled
      ? []
      : ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "TRIGGER:-PT15M", "END:VALARM"]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export interface FeedEvent {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location?: string | null;
  /** Last change, so calendar apps notice edits */
  updated?: Date;
}

/** A subscribable calendar (the host's private feed): no METHOD, one VEVENT per call */
export function buildFeed(name: string, events: FeedEvent[], now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//swapnilsrivastava.eu//Booking feed//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${icsText(name)}`,
    // Ask apps to check for changes every 15 minutes (most still decide themselves)
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp(event.updated ?? now)}`,
      `DTSTART:${stamp(event.start)}`,
      `DTEND:${stamp(event.end)}`,
      `SUMMARY:${icsText(event.summary)}`,
      `DESCRIPTION:${icsText(event.description)}`,
      ...(event.location ? [`LOCATION:${icsText(event.location)}`] : []),
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
