import React from "react";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { durationLabel } from "../../lib/booking/format";
import type { PublicDoctor } from "../../lib/doctors/directory";
import { DoctorAvatar, Tag, cardClass, linkButton, m, modesLabel, whenLabel } from "./ui";

// One doctor in the list (P2 / W1)

const msg = defineMessages({
  viewProfile: {
    id: "doctors-card-view-profile",
    description: "Doctor card: open the doctor's profile",
    defaultMessage: "View profile",
  },
  viewProfileOf: {
    id: "doctors-card-view-profile-of",
    description: "Doctor card: screen reader label of the profile link",
    defaultMessage: "View profile of {name}",
  },
  noTimes: {
    id: "doctors-card-no-times",
    description: "Doctor card: no free times are published yet",
    defaultMessage: "Times not published yet",
  },
});

export default function DoctorCard({
  doctor,
  zone,
  showTimes,
}: {
  doctor: PublicDoctor;
  /** The visitor's zone */
  zone: string;
  /** False on the first render, before the visitor's zone and clock are known */
  showTimes: boolean;
}) {
  const intl = useIntl();
  const first = doctor.consultations[0];
  const next = doctor.next_slots[0];
  const subtitle = [doctor.specialty ?? doctor.title, doctor.qualification].filter(Boolean).join(" · ");
  const headingId = `doctor-${doctor.slug}`;

  return (
    <article aria-labelledby={headingId} className={`${cardClass} p-4 sm:p-5 flex flex-col gap-3 w-full`}>
      <div className="flex items-start gap-3">
        <DoctorAvatar doctor={doctor} />
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-bold leading-snug">
            {doctor.name}
          </h2>
          {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>

      {doctor.specialty && (
        <div className="flex flex-wrap gap-2">
          <Tag strong>{doctor.specialty}</Tag>
        </div>
      )}

      {doctor.languages.length > 0 && (
        <p className="flex items-center gap-2 text-sm">
          <FontAwesomeIcon icon={faLanguage} className="text-[var(--text-muted)]" aria-hidden="true" />
          {intl.formatList(doctor.languages)}
        </p>
      )}

      <div className="border-t border-[var(--border-subtle)] pt-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {first ? (
            <p className="text-sm font-semibold">
              {first.name} · {durationLabel(first.duration_minutes)}
            </p>
          ) : (
            <span />
          )}
          {doctor.modes.length > 0 && <Tag>{modesLabel(intl, doctor.modes)}</Tag>}
        </div>
        {showTimes ? (
          <p className={`flex items-center gap-2 text-sm ${next ? "text-[var(--status-success)]" : "text-[var(--text-muted)]"}`}>
            <FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" />
            {next
              ? intl.formatMessage(m.nextAvailable, { when: whenLabel(intl, next, zone) })
              : intl.formatMessage(msg.noTimes)}
          </p>
        ) : (
          <p aria-hidden="true" className="h-5 w-48 max-w-full rounded bg-[var(--surface-inset)] animate-pulse" />
        )}
      </div>

      <Link
        href={`/doctors/${doctor.slug}`}
        className={`${linkButton.primary} w-full mt-auto`}
        aria-label={intl.formatMessage(msg.viewProfileOf, { name: doctor.name })}
      >
        {intl.formatMessage(msg.viewProfile)}
      </Link>
    </article>
  );
}
