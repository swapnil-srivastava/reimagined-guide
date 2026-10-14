import { DateTime } from "luxon";
import { ADMIN_EMAIL, escapeHtml, getUserEmail, sendMail, MailAttachment } from "./mailer";
import { emailLayout, paragraph } from "./emailLayout";
import { buildInvite } from "../booking/ics";
import { durationLabel } from "../booking/format";
import { SITE_URL } from "../site";
import type { Booking, BookingHost, BookingType } from "../booking/types";

// Emails for booked, rescheduled and cancelled calls. The buyer and the host each
// get one, with an .ics invite so the call lands in (or leaves) their
// calendar. Times are shown in the reader's own zone, with the other side's
// zone next to it when they differ.

const LOCALE = "en-GB";

function when(booking: Booking, zone: string): string {
  const start = DateTime.fromISO(booking.starts_at).setZone(zone).setLocale(LOCALE);
  const end = DateTime.fromISO(booking.ends_at).setZone(zone).setLocale(LOCALE);
  return `${start.toFormat("cccc d LLLL yyyy")}, ${start.toFormat("HH:mm")} – ${end.toFormat("HH:mm")}`;
}

const zoneLabel = (zone: string, at: string) =>
  `${DateTime.fromISO(at).setZone(zone).setLocale(LOCALE).toFormat("ZZZZZ")} (${zone.replace(/_/g, " ")})`;

function locationText(type: BookingType): string {
  if (type.location_value) return type.location_value;
  if (type.location_kind === "phone") return "Phone call, details to follow";
  if (type.location_kind === "in_person") return "In person, details to follow";
  return "Video call, the link follows by email before the call";
}

function detailsHtml(rows: [string, string][]): string {
  const body = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding: 6px 12px 6px 0; color: #6b7280; font-size: 14px; vertical-align: top; white-space: nowrap;">${escapeHtml(label)}</td>
        <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
    style="margin: 0 0 20px 0; background: #f9fafb; border-radius: 12px; padding: 12px 16px; font-family: 'Poppins', 'Segoe UI', Helvetica, Arial, sans-serif;">${body}</table>`;
}

const detailsText = (rows: [string, string][]) => rows.map(([l, v]) => `${l}: ${v}`).join("\n");

function invite(
  kind: "REQUEST" | "CANCEL",
  booking: Booking,
  type: BookingType,
  host: BookingHost,
  identity: { uid: string; sequence: number },
  manageUrl?: string
): MailAttachment {
  const ics = buildInvite({
    uid: identity.uid,
    sequence: identity.sequence + (kind === "CANCEL" ? 1 : 0),
    method: kind,
    start: new Date(booking.starts_at),
    end: new Date(booking.ends_at),
    summary: `${type.name}: ${host.name} and ${booking.invitee_name}`,
    description: [
      `${type.name} with ${host.name}.`,
      booking.notes ? `Notes: ${booking.notes}` : "",
      manageUrl ? `Reschedule or cancel: ${manageUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    location: type.location_value,
    url: manageUrl,
    organizerName: host.name,
    organizerEmail: ADMIN_EMAIL,
    attendeeName: booking.invitee_name,
    attendeeEmail: booking.invitee_email,
  });
  return {
    Name: kind === "CANCEL" ? "cancelled.ics" : "invite.ics",
    Content: Buffer.from(ics, "utf8").toString("base64"),
    ContentType: `text/calendar; charset=utf-8; method=${kind}`,
  };
}

export type BookingEvent = "booked" | "rescheduled" | "cancelled";

export interface BookingEmailInput {
  event: BookingEvent;
  booking: Booking;
  /** For a reschedule: the booking it replaced */
  previous?: Booking | null;
  type: BookingType;
  host: BookingHost;
  identity: { uid: string; sequence: number };
  /** The buyer's /book/<token> page, when known */
  manageUrl?: string;
  cancelledBy?: "invitee" | "host";
  reason?: string | null;
}

/** The call's details as the buyer reads them, in their own zone */
function inviteeRows(booking: Booking, type: BookingType, host: BookingHost): [string, string][] {
  const zone = booking.invitee_timezone || host.timezone;
  const rows: [string, string][] = [
    ["When", when(booking, zone)],
    ["Time zone", zoneLabel(zone, booking.starts_at)],
    ["With", host.title ? `${host.name}, ${host.title}` : host.name],
    ["Where", locationText(type)],
  ];
  if (zone !== host.timezone) rows.splice(2, 0, [`${host.name.split(" ")[0]}'s time`, `${when(booking, host.timezone)} ${zoneLabel(host.timezone, booking.starts_at)}`]);
  return rows;
}

/** Plain-text version of an email: lines, with runs of blank lines collapsed */
const textOf = (lines: string[]) => lines.filter((line, i, all) => line !== "" || all[i - 1] !== "").join("\n");

/** Sends the buyer's email. Returns false instead of throwing. */
export function sendInviteeEmail(input: BookingEmailInput): Promise<boolean> {
  const { event, booking, previous, type, host, manageUrl } = input;
  const zone = booking.invitee_timezone || host.timezone;
  const first = booking.invitee_name.split(" ")[0] || booking.invitee_name;
  const rows = inviteeRows(booking, type, host);

  let subject: string;
  let title: string;
  let intro: string;
  let button: { label: string; href: string } | undefined;
  if (event === "cancelled") {
    subject = `Cancelled: ${type.name} on ${when(booking, zone)}`;
    title = "Your call is cancelled";
    intro =
      input.cancelledBy === "host"
        ? `${host.name} had to cancel your call. Sorry about that. You can pick a new time with the link in your order email${manageUrl ? " or the button below" : ""}.`
        : manageUrl
          ? "Your call is cancelled, as you asked. You can pick a new time whenever you like."
          : "Your call is cancelled, as you asked.";
    button = manageUrl ? { label: "Pick a new time", href: manageUrl } : undefined;
  } else if (event === "rescheduled") {
    subject = `Rescheduled: ${type.name} is now ${when(booking, zone)}`;
    title = "Your call is rescheduled";
    intro = previous
      ? `Your call is moved from ${when(previous, zone)} to the new time below. The attached invite updates your calendar.`
      : "Your call is moved to the new time below. The attached invite updates your calendar.";
    button = manageUrl ? { label: "Reschedule or cancel", href: manageUrl } : undefined;
  } else {
    subject = `Booked: ${type.name} on ${when(booking, zone)}`;
    title = "Your call is booked";
    intro = `Thanks, ${first}! Your ${type.duration_minutes}-minute call with ${host.name} is booked. Open the attached invite to add it to your calendar.`;
    button = manageUrl ? { label: "Reschedule or cancel", href: manageUrl } : undefined;
  }

  const reasonRow: [string, string][] = input.reason && event === "cancelled" ? [["Reason", input.reason]] : [];
  const footnote =
    event === "cancelled" || !manageUrl
      ? undefined
      : `You can reschedule or cancel up to ${durationLabel(type.cancel_cutoff_minutes)} before the call. After that, just reply to this email.`;

  const html = emailLayout({
    preheader: `${title}: ${when(booking, zone)}`,
    title,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)) + detailsHtml([...rows, ...reasonRow]),
    button,
    footnoteHtml: footnote ? escapeHtml(footnote) : undefined,
    footerHtml: "Questions before the call? Reply to this email.",
  });
  const text = [title, "", intro, "", detailsText([...rows, ...reasonRow]), "", button ? `${button.label}: ${button.href}` : "", footnote ?? ""]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return sendMail(booking.invitee_email, subject, html, text, [
    invite(event === "cancelled" ? "CANCEL" : "REQUEST", booking, type, host, input.identity, manageUrl),
  ]);
}

/** Sends the host's copy, to the host's own account email when they have one. Returns false instead of throwing. */
export async function sendHostEmail(input: BookingEmailInput): Promise<boolean> {
  const { event, booking, previous, type, host } = input;
  const zone = host.timezone;
  const rows: [string, string][] = [
    ["When", `${when(booking, zone)} ${zoneLabel(zone, booking.starts_at)}`],
    ["Name", booking.invitee_name],
    ["Email", booking.invitee_email],
  ];
  if (booking.invitee_timezone && booking.invitee_timezone !== zone) {
    rows.push(["Their time", `${when(booking, booking.invitee_timezone)} ${zoneLabel(booking.invitee_timezone, booking.starts_at)}`]);
  }
  if (previous && event === "rescheduled") rows.push(["Was", when(previous, zone)]);
  if (booking.notes) rows.push(["Notes", booking.notes]);
  if (event === "cancelled") {
    rows.push(["Cancelled by", input.cancelledBy === "host" ? "You" : booking.invitee_name]);
    if (input.reason) rows.push(["Reason", input.reason]);
  }

  const verb = event === "booked" ? "New booking" : event === "rescheduled" ? "Rescheduled" : "Cancelled";
  const subject = `${verb}: ${booking.invitee_name}, ${when(booking, zone)}`;
  const intro =
    event === "booked"
      ? `${booking.invitee_name} booked a ${type.duration_minutes}-minute ${type.name}.`
      : event === "rescheduled"
        ? `${booking.invitee_name} rescheduled their call.`
        : `The call with ${booking.invitee_name} is cancelled. The time is free again.`;

  const html = emailLayout({
    preheader: `${verb}: ${when(booking, zone)}`,
    title: verb,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)) + detailsHtml(rows),
    button: { label: "Open bookings", href: `${SITE_URL}/admin/booking` },
  });
  const text = [verb, "", intro, "", detailsText(rows), "", `Bookings: ${SITE_URL}/admin/booking`].join("\n");

  const to = host.user_id ? await getUserEmail(host.user_id, ADMIN_EMAIL) : ADMIN_EMAIL;
  return sendMail(to ?? ADMIN_EMAIL, subject, html, text, [
    invite(event === "cancelled" ? "CANCEL" : "REQUEST", booking, type, host, input.identity),
  ]);
}

/** Sends both emails; a failed email never fails the booking. Says which ones went. */
export async function sendBookingEmails(input: BookingEmailInput): Promise<{ invitee: boolean; host: boolean }> {
  const [invitee, host] = await Promise.all([sendInviteeEmail(input), sendHostEmail(input)]);
  if (!invitee || !host) console.error(`Booking ${input.booking.id}: ${input.event} email failed`, { invitee, host });
  return { invitee, host };
}

export type ReminderKind = "24h" | "1h";

/** Reminds the buyer of their call, a day and an hour before. No invite: the call is already in their calendar. */
export function sendReminderEmail(kind: ReminderKind, booking: Booking, type: BookingType, host: BookingHost): Promise<boolean> {
  const zone = booking.invitee_timezone || host.timezone;
  const start = DateTime.fromISO(booking.starts_at).setZone(zone).setLocale(LOCALE);
  const first = booking.invitee_name.split(" ")[0] || booking.invitee_name;
  const soon = kind === "1h";
  const subject = soon ? `Starting soon: ${type.name} at ${start.toFormat("HH:mm")}` : `Reminder: ${type.name} on ${when(booking, zone)}`;
  const title = soon ? "Your call starts in an hour" : "Your call is coming up";
  const intro = soon
    ? `Hi ${first}, your ${type.duration_minutes}-minute call with ${host.name} starts at ${start.toFormat("HH:mm")}.`
    : `Hi ${first}, a reminder that your ${type.duration_minutes}-minute call with ${host.name} is on ${start.toFormat("cccc d LLLL")} at ${start.toFormat("HH:mm")}.`;
  const rows = inviteeRows(booking, type, host);
  const footnote = "Something came up? Reply to this email.";

  const html = emailLayout({
    preheader: `${title}: ${when(booking, zone)}`,
    title,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)) + detailsHtml(rows),
    footnoteHtml: escapeHtml(footnote),
  });
  const text = textOf([title, "", intro, "", detailsText(rows), "", footnote]);
  return sendMail(booking.invitee_email, subject, html, text);
}

/** Tells the host a call starts within the hour */
export async function sendHostReminderEmail(booking: Booking, type: BookingType, host: BookingHost): Promise<boolean> {
  const zone = host.timezone;
  const start = DateTime.fromISO(booking.starts_at).setZone(zone).setLocale(LOCALE);
  const subject = `In an hour: ${booking.invitee_name}, ${start.toFormat("HH:mm")}`;
  const title = "Call in an hour";
  const intro = `Your ${type.duration_minutes}-minute ${type.name} with ${booking.invitee_name} starts at ${start.toFormat("HH:mm")}.`;
  const rows: [string, string][] = [
    ["When", `${when(booking, zone)} ${zoneLabel(zone, booking.starts_at)}`],
    ["Name", booking.invitee_name],
    ["Email", booking.invitee_email],
  ];
  if (booking.notes) rows.push(["Notes", booking.notes]);

  const html = emailLayout({
    preheader: `${title}: ${booking.invitee_name}`,
    title,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)) + detailsHtml(rows),
    button: { label: "Open bookings", href: `${SITE_URL}/admin/booking` },
  });
  const text = textOf([title, "", intro, "", detailsText(rows), "", `Bookings: ${SITE_URL}/admin/booking`]);
  const to = host.user_id ? await getUserEmail(host.user_id, ADMIN_EMAIL) : ADMIN_EMAIL;
  return sendMail(to ?? ADMIN_EMAIL, subject, html, text);
}

/** Reminds a buyer who paid but hasn't picked a time, with a fresh link */
export function sendNudgeEmail(options: { email: string; name: string | null; type: BookingType; url: string; paidOn: string }): Promise<boolean> {
  const { email, type, url } = options;
  const first = options.name?.trim().split(" ")[0];
  const paid = DateTime.fromISO(options.paidOn).setLocale(LOCALE).toFormat("d LLLL");
  const subject = `Pick a time for your ${type.name}`;
  const title = "Pick a time for your call";
  const intro = `${first ? `Hi ${first}, you` : "You"} bought a ${type.duration_minutes}-minute ${type.name} on ${paid} but haven't picked a time yet. It only takes a minute.`;
  const footnote = "The link in your order email works too. Questions? Reply to this email.";

  const html = emailLayout({
    preheader: "Your call is paid for. Pick a time that suits you.",
    title,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)),
    button: { label: "Pick a time", href: url },
    footnoteHtml: escapeHtml(footnote),
  });
  const text = textOf([title, "", intro, "", `Pick a time: ${url}`, "", footnote]);
  return sendMail(email, subject, html, text);
}

/**
 * Sends the buyer their booking link again (from /admin/booking), for when
 * the order email went missing. Works whether or not they have booked yet.
 */
export function sendLinkEmail(options: { email: string; name: string | null; type: BookingType; url: string; booked: boolean }): Promise<boolean> {
  const { email, type, url, booked } = options;
  const first = options.name?.trim().split(" ")[0];
  const subject = `Your booking link for the ${type.name}`;
  const title = "Your booking link";
  const intro = booked
    ? `${first ? `Hi ${first}, here` : "Here"} is your booking link again. Use it to see, move or cancel your call.`
    : `${first ? `Hi ${first}, here` : "Here"} is your booking link again. Use it to pick a time for your ${type.duration_minutes}-minute call.`;
  const label = booked ? "Open my booking" : "Pick a time";
  const footnote = "Keep this email: the link is how you change your call later. Questions? Reply to this email.";

  const html = emailLayout({
    preheader: booked ? "See, move or cancel your call." : "Your call is paid for. Pick a time that suits you.",
    title,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)),
    button: { label, href: url },
    footnoteHtml: escapeHtml(footnote),
  });
  const text = textOf([title, "", intro, "", `${label}: ${url}`, "", footnote]);
  return sendMail(email, subject, html, text);
}
