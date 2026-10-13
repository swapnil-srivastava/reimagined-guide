import { DateTime } from "luxon";
import { ADMIN_EMAIL, escapeHtml, sendMail, MailAttachment } from "./mailer";
import { emailLayout, paragraph } from "./emailLayout";
import { buildInvite } from "../booking/ics";
import { SITE_URL } from "../site";
import type { Booking, BookingHost, BookingType } from "../booking/types";

// Emails for booked, moved and cancelled calls. The buyer and the host each
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

/** Sends the buyer's email. Returns false instead of throwing. */
export function sendInviteeEmail(input: BookingEmailInput): Promise<boolean> {
  const { event, booking, previous, type, host, manageUrl } = input;
  const zone = booking.invitee_timezone || host.timezone;
  const first = booking.invitee_name.split(" ")[0] || booking.invitee_name;
  const rows: [string, string][] = [
    ["When", when(booking, zone)],
    ["Time zone", zoneLabel(zone, booking.starts_at)],
    ["With", host.title ? `${host.name}, ${host.title}` : host.name],
    ["Where", locationText(type)],
  ];
  if (zone !== host.timezone) rows.splice(2, 0, [`${host.name.split(" ")[0]}'s time`, `${when(booking, host.timezone)} ${zoneLabel(host.timezone, booking.starts_at)}`]);

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
        : "Your call is cancelled, as you asked. You can pick a new time whenever you like.";
    button = manageUrl ? { label: "Pick a new time", href: manageUrl } : undefined;
  } else if (event === "rescheduled") {
    subject = `Moved: ${type.name} is now ${when(booking, zone)}`;
    title = "Your call has moved";
    intro = previous
      ? `Your call has moved from ${when(previous, zone)} to the new time below. The invite attached updates your calendar.`
      : "Your call has moved to the new time below. The invite attached updates your calendar.";
    button = manageUrl ? { label: "Reschedule or cancel", href: manageUrl } : undefined;
  } else {
    subject = `Booked: ${type.name} on ${when(booking, zone)}`;
    title = "Your call is booked";
    intro = `Thanks, ${first}! Your ${type.duration_minutes}-minute call with ${host.name} is booked. Open the attached invite to add it to your calendar.`;
    button = manageUrl ? { label: "Reschedule or cancel", href: manageUrl } : undefined;
  }

  const reasonRow: [string, string][] = input.reason && event === "cancelled" ? [["Reason", input.reason]] : [];
  const cutoffHours = Math.round(type.cancel_cutoff_minutes / 60);
  const footnote =
    event === "cancelled" || !manageUrl
      ? undefined
      : `You can reschedule or cancel up to ${cutoffHours} hours before the call. After that, just reply to this email.`;

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

/** Sends the host's copy. Returns false instead of throwing. */
export function sendHostEmail(input: BookingEmailInput): Promise<boolean> {
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

  const verb = event === "booked" ? "New booking" : event === "rescheduled" ? "Moved" : "Cancelled";
  const subject = `${verb}: ${booking.invitee_name}, ${when(booking, zone)}`;
  const intro =
    event === "booked"
      ? `${booking.invitee_name} booked a ${type.duration_minutes}-minute ${type.name}.`
      : event === "rescheduled"
        ? `${booking.invitee_name} moved their call.`
        : `The call with ${booking.invitee_name} is cancelled. The time is free again.`;

  const html = emailLayout({
    preheader: `${verb}: ${when(booking, zone)}`,
    title: verb,
    subtitle: type.name,
    bodyHtml: paragraph(escapeHtml(intro)) + detailsHtml(rows),
    button: { label: "Open bookings", href: `${SITE_URL}/admin/booking` },
  });
  const text = [verb, "", intro, "", detailsText(rows), "", `Bookings: ${SITE_URL}/admin/booking`].join("\n");

  return sendMail(ADMIN_EMAIL, subject, html, text, [
    invite(event === "cancelled" ? "CANCEL" : "REQUEST", booking, type, host, input.identity),
  ]);
}

/** Sends both emails; a failed email never fails the booking */
export async function sendBookingEmails(input: BookingEmailInput): Promise<void> {
  const [invitee, hostMail] = await Promise.all([sendInviteeEmail(input), sendHostEmail(input)]);
  if (!invitee || !hostMail) console.error(`Booking ${input.booking.id}: ${input.event} email failed`, { invitee, hostMail });
}
