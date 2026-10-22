import React from "react";
import Link from "next/link";
import { DateTime } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { initials } from "../booking/book/CallSummary";
import { dayLabel, inZone, timeLabel } from "../../lib/booking/format";
import type { PublicDoctor, VisitMode } from "../../lib/doctors/directory";

// Pieces shared by the doctor directory pages. Colours come from the theme
// variables in styles/globals.css (Tailwind `dark:` never applies).

export const m = defineMessages({
  in_person: { id: "doctors-mode-in-person", description: "Doctors: visit at the clinic", defaultMessage: "Clinic" },
  video: { id: "doctors-mode-video", description: "Doctors: video consultation", defaultMessage: "Video" },
  audio: { id: "doctors-mode-audio", description: "Doctors: audio (phone) consultation", defaultMessage: "Audio" },
  modeInPersonLong: { id: "doctors-mode-in-person-long", description: "Doctors filter: in-person visit", defaultMessage: "In person" },
  emergency: {
    id: "doctors-emergency",
    description: "Doctors: warning that the service is not for emergencies (112 is India's emergency number)",
    defaultMessage: "Not for emergencies. In an emergency, call 112.",
  },
  nextAvailable: {
    id: "doctors-next-available",
    description: "Doctors: the doctor's first free time, e.g. 'Next available: Today, 4:30 PM'",
    defaultMessage: "Next available: {when}",
  },
  today: { id: "doctors-today", description: "Doctors: a time today, e.g. 'Today, 4:30 PM'", defaultMessage: "Today, {time}" },
  tomorrow: { id: "doctors-tomorrow", description: "Doctors: a time tomorrow", defaultMessage: "Tomorrow, {time}" },
  bookingSoon: {
    id: "doctors-booking-soon",
    description: "Doctors: online booking is not open yet",
    defaultMessage: "Online booking opens soon",
  },
  back: { id: "doctors-back", description: "Doctors: back button label", defaultMessage: "Back" },
  from: { id: "doctors-fee-from", description: "Doctors: first consultation fee, e.g. 'From ₹600'", defaultMessage: "From {fee}" },
});

/** "Video · Clinic" */
export function modesLabel(intl: ReturnType<typeof useIntl>, modes: VisitMode[]) {
  return modes.map((mode) => intl.formatMessage(m[mode])).join(" · ");
}

/** "Today, 4:30 PM", "Tomorrow, 9:00 AM" or "Tue, 27 Oct, 9:00 AM", in the given zone */
export function whenLabel(intl: ReturnType<typeof useIntl>, iso: string, zone: string, now = DateTime.now()) {
  const at = inZone(iso, zone, intl.locale);
  const today = now.setZone(zone);
  const time = timeLabel(at);
  if (at.hasSame(today, "day")) return intl.formatMessage(m.today, { time });
  if (at.hasSame(today.plus({ days: 1 }), "day")) return intl.formatMessage(m.tomorrow, { time });
  return `${dayLabel(at)}, ${time}`;
}

export function DoctorAvatar({ doctor, size = "md" }: { doctor: Pick<PublicDoctor, "name" | "photo_url">; size?: "md" | "lg" }) {
  const box = size === "lg" ? "w-24 h-24 text-3xl" : "w-14 h-14 text-lg";
  if (doctor.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={doctor.photo_url} alt="" className={`${box} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden
      className={`${box} shrink-0 rounded-full inline-flex items-center justify-center font-bold bg-[var(--accent-ink)] text-[var(--bg-primary)]`}
    >
      {initials(doctor.name.replace(/^Dr\.?\s+/i, ""))}
    </span>
  );
}

/** Small outlined label, e.g. a specialty or "Video · Clinic" */
export function Tag({ strong = false, children }: { strong?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${
        strong
          ? "border-[var(--accent-ink)] text-[var(--text-primary)] font-semibold"
          : "border-[var(--border-subtle)] text-[var(--text-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

export const cardClass =
  "rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md";

const linkButtonBase =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--text-primary)]";

export const linkButton = {
  primary: `${linkButtonBase} bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)]`,
  secondary: `${linkButtonBase} border border-[var(--accent-ink)] text-[var(--text-primary)] hover:bg-[var(--surface-inset)]`,
};

/** Round back button and page heading, as on every doctor screen */
export function PageHeading({ backHref, children }: { backHref: string; children: React.ReactNode }) {
  const intl = useIntl();
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Link
        href={backHref}
        aria-label={intl.formatMessage(m.back)}
        className="w-10 h-10 shrink-0 rounded-full inline-flex items-center justify-center bg-[var(--surface-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
      >
        <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight min-w-0">{children}</h1>
    </div>
  );
}

export function EmergencyNote() {
  const intl = useIntl();
  return (
    <p className="flex items-start gap-2 rounded-lg border border-[var(--status-warning)] bg-[var(--surface-inset)] px-3 py-2 text-sm">
      <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-[var(--status-warning)]" aria-hidden="true" />
      <span>{intl.formatMessage(m.emergency)}</span>
    </p>
  );
}
