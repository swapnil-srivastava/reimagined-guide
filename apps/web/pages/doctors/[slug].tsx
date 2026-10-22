import React, { useEffect, useMemo, useState } from "react";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { DateTime, Info } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleCheck,
  faEarthAsia,
  faLanguage,
  faLocationDot,
  faPhone,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";

import Metatags from "../../components/Metatags";
import TimeZoneSelect from "../../components/booking/book/TimeZoneSelect";
import { browserZone } from "../../components/booking/book/api";
import { DoctorAvatar, EmergencyNote, PageHeading, Tag, cardClass, m, modesLabel, whenLabel } from "../../components/doctors/ui";
import { durationLabel, zoneName } from "../../lib/booking/format";
import { clinicAddress, formatRupees, hoursByWeekday, type PublicDoctor } from "../../lib/doctors/directory";
import { SITE_URL } from "../../lib/site";
import { directoryConfigured, loadDoctor, loadDoctorSlugs } from "../../lib/server/doctors";

// e.g. localhost:3000/doctors/garima-srivastava
// A doctor's public profile (P3 / W2, time zone picker N7). Built on the
// server every few minutes; free times are shown in the visitor's zone.

const REVALIDATE_SECONDS = 300;

const msg = defineMessages({
  about: { id: "doctor-profile-about", description: "Doctor profile: about section", defaultMessage: "About" },
  consultations: { id: "doctor-profile-consultations", description: "Doctor profile: what can be booked", defaultMessage: "Consultations" },
  next: {
    id: "doctor-profile-next",
    description: "Doctor profile: next free times heading",
    defaultMessage: "Next available (your time zone)",
  },
  noTimes: {
    id: "doctor-profile-no-times",
    description: "Doctor profile: no free times published",
    defaultMessage: "No free times are published for the next two weeks.",
  },
  timesIn: { id: "doctor-profile-times-in", description: "Doctor profile: zone the times are in", defaultMessage: "Times in {zone}" },
  change: { id: "doctor-profile-change-zone", description: "Doctor profile: change the time zone", defaultMessage: "Change" },
  done: { id: "doctor-profile-zone-done", description: "Doctor profile: close the time zone picker", defaultMessage: "Done" },
  hours: { id: "doctor-profile-hours", description: "Doctor profile: weekly working hours", defaultMessage: "Working hours" },
  hoursIn: { id: "doctor-profile-hours-in", description: "Doctor profile: zone of the working hours", defaultMessage: "Times in {zone}" },
  closed: { id: "doctor-profile-closed", description: "Doctor profile: not working that day", defaultMessage: "Closed" },
  noHours: { id: "doctor-profile-no-hours", description: "Doctor profile: hours not set yet", defaultMessage: "Working hours will be added soon." },
  registration: {
    id: "doctor-profile-registration-heading",
    description: "Doctor profile: qualifications and medical registration heading",
    defaultMessage: "Qualifications and registration",
  },
  regNo: {
    id: "doctor-profile-reg-no",
    description: "Doctor profile: medical registration number and council",
    defaultMessage: "Reg. no. {number}, {council}",
  },
  regNoOnly: { id: "doctor-profile-reg-no-only", description: "Doctor profile: registration number", defaultMessage: "Reg. no. {number}" },
  regPending: {
    id: "doctor-profile-reg-pending",
    description: "Doctor profile: registration not added yet",
    defaultMessage: "Registration details are being added.",
  },
  verified: {
    id: "doctor-profile-verified",
    description: "Doctor profile: the clinic checked the registration",
    defaultMessage: "Registration checked by the clinic",
  },
  clinic: { id: "doctor-profile-clinic", description: "Doctor profile: clinic section", defaultMessage: "Clinic" },
  map: { id: "doctor-profile-map", description: "Doctor profile: open the clinic in maps", defaultMessage: "Open in Maps" },
  call: { id: "doctor-profile-call", description: "Doctor profile: phone the clinic", defaultMessage: "Call the clinic" },
  where: {
    id: "doctor-profile-where",
    description: "Doctor profile: how the doctor sees patients",
    defaultMessage:
      "{clinic, select, none {} other {At the clinic in {clinic}}}{both, select, yes {, or } other {}}{online, select, both {by video or audio call} video {by video call} audio {by audio call} other {}}",
  },
  worksIn: { id: "doctor-profile-works-in", description: "Doctor profile: the doctor's own zone", defaultMessage: "Works in {zone}" },
  firstFee: { id: "doctor-profile-first-fee", description: "Doctor profile: fee of a first consultation", defaultMessage: "First consultation" },
  followUpFee: { id: "doctor-profile-follow-up-fee", description: "Doctor profile: fee of a follow-up", defaultMessage: "Follow-up" },
  book: { id: "doctor-profile-book", description: "Doctor profile: booking card heading", defaultMessage: "Book an appointment" },
  bookSoon: {
    id: "doctor-profile-book-soon",
    description: "Doctor profile: booking not open yet",
    defaultMessage: "Online booking opens soon.",
  },
});

interface Props {
  doctor: PublicDoctor;
}

/** "At the clinic in Pune, or by video or audio call" */
function whereLabel(intl: ReturnType<typeof useIntl>, doctor: PublicDoctor) {
  const city = doctor.modes.includes("in_person") ? doctor.clinic?.city ?? doctor.clinic?.name ?? "none" : "none";
  const video = doctor.modes.includes("video");
  const audio = doctor.modes.includes("audio");
  const online = video && audio ? "both" : video ? "video" : audio ? "audio" : "none";
  if (city === "none" && online === "none") return "";
  return intl.formatMessage(msg.where, { clinic: city, both: city !== "none" && online !== "none" ? "yes" : "no", online });
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${cardClass} p-4 sm:p-5 ${className}`}>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

const DoctorProfile: NextPage<Props> = ({ doctor }) => {
  const intl = useIntl();
  const [zone, setZone] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [pickingZone, setPickingZone] = useState(false);

  // The visitor's zone and clock are only known in the browser
  useEffect(() => {
    setZone(browserZone());
    setNow(Date.now());
  }, []);

  const slots = useMemo(() => doctor.next_slots.filter((s) => Date.parse(s) > now), [doctor.next_slots, now]);
  const hours = hoursByWeekday(doctor.weekly_hours);
  const subtitle = [doctor.specialty ?? doctor.title, doctor.qualification].filter(Boolean).join(" · ");
  const where = whereLabel(intl, doctor);
  const weekdays = Info.weekdays("short", { locale: intl.locale });
  const clinicLine = doctor.clinic ? clinicAddress(doctor.clinic) : "";
  const mapHref =
    doctor.clinic?.map_url ||
    (clinicLine ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${doctor.clinic!.name}, ${clinicLine}`)}` : null);
  const hourLabel = (time: string) =>
    DateTime.fromFormat(time === "24:00" ? "23:59" : time, "HH:mm", { locale: intl.locale }).toLocaleString(DateTime.TIME_SIMPLE);

  const url = `${SITE_URL}/doctors/${doctor.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    url,
    ...(doctor.specialty && { medicalSpecialty: doctor.specialty }),
    ...(doctor.photo_url && { image: doctor.photo_url }),
    ...(doctor.languages.length && { knowsLanguage: doctor.languages }),
    ...(doctor.clinic && {
      address: {
        "@type": "PostalAddress",
        streetAddress: [doctor.clinic.address_line1, doctor.clinic.address_line2].filter(Boolean).join(", "),
        addressLocality: doctor.clinic.city ?? undefined,
        addressRegion: doctor.clinic.state ?? undefined,
        postalCode: doctor.clinic.postcode ?? undefined,
        addressCountry: "IN",
      },
    }),
  };

  return (
    <>
      <Metatags
        title={doctor.name}
        description={[doctor.name, subtitle, where].filter(Boolean).join(". ")}
        url={url}
        jsonLd={jsonLd}
        {...(doctor.photo_url && { image: doctor.photo_url })}
      />
      <div className="font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
          <PageHeading backHref="/doctors">{doctor.name}</PageHeading>

          <div className="grid gap-5 lg:grid-cols-[1fr_22rem] items-start">
            <div className="flex flex-col gap-5 min-w-0">
              <section className={`${cardClass} p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4`}>
                <DoctorAvatar doctor={doctor} size="lg" />
                <div className="flex flex-col gap-2 min-w-0 text-center sm:text-left w-full">
                  {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
                  {doctor.specialty && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Tag strong>{doctor.specialty}</Tag>
                    </div>
                  )}
                  <ul className="flex flex-col gap-1.5 text-sm text-left border-t border-[var(--border-subtle)] pt-3 mt-1">
                    {doctor.languages.length > 0 && (
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faLanguage} className="mt-0.5 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                        {intl.formatList(doctor.languages)}
                      </li>
                    )}
                    {where && (
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                        {where}
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faEarthAsia} className="mt-0.5 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {intl.formatMessage(msg.worksIn, { zone: zoneName(doctor.timezone, intl.locale) })}
                    </li>
                  </ul>
                </div>
              </section>

              {doctor.bio && (
                <Section title={intl.formatMessage(msg.about)}>
                  <p className="text-sm whitespace-pre-line">{doctor.bio}</p>
                </Section>
              )}

              {doctor.consultations.length > 0 && (
                <Section title={intl.formatMessage(msg.consultations)}>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {doctor.consultations.map((c) => (
                      <li key={c.slug} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-3">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {durationLabel(c.duration_minutes)} · {intl.formatMessage(m[c.mode])}
                        </p>
                        {c.description && <p className="text-sm mt-1">{c.description}</p>}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title={intl.formatMessage(msg.registration)}>
                <ul className="flex flex-col gap-2 text-sm">
                  {doctor.qualification && (
                    <li className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faStethoscope} className="mt-0.5 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {doctor.qualification}
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className={`mt-0.5 w-4 ${doctor.registration_verified ? "text-[var(--status-success)]" : "text-[var(--text-muted)]"}`}
                      aria-hidden="true"
                    />
                    <span>
                      {doctor.registration_number
                        ? intl.formatMessage(doctor.registration_council ? msg.regNo : msg.regNoOnly, {
                            number: doctor.registration_number,
                            council: doctor.registration_council,
                          })
                        : intl.formatMessage(msg.regPending)}
                      {doctor.registration_number && doctor.registration_verified && (
                        <span className="block text-xs text-[var(--status-success)]">{intl.formatMessage(msg.verified)}</span>
                      )}
                    </span>
                  </li>
                </ul>
              </Section>

              {doctor.clinic && (
                <Section title={intl.formatMessage(msg.clinic)}>
                  <p className="font-semibold">{doctor.clinic.name}</p>
                  {clinicLine && (
                    <p className="text-sm flex items-start gap-2 mt-1">
                      <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {clinicLine}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm font-semibold">
                    {mapHref && (
                      <a href={mapHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                        {intl.formatMessage(msg.map)}
                      </a>
                    )}
                    {doctor.clinic.phone && (
                      <a href={`tel:${doctor.clinic.phone}`} className="inline-flex items-center gap-1.5 underline underline-offset-2">
                        <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
                        {intl.formatMessage(msg.call)}
                      </a>
                    )}
                  </div>
                </Section>
              )}
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-4">
              <Section title={intl.formatMessage(msg.next)}>
                {zone === null ? (
                  <div aria-hidden="true" className="h-10 rounded-lg bg-[var(--surface-inset)] animate-pulse" />
                ) : slots.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <li key={s} className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-sm">
                        {whenLabel(intl, s, zone)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(msg.noTimes)}</p>
                )}
                {zone !== null && slots.length > 0 && (
                  <div className="mt-3 text-sm">
                    {pickingZone ? (
                      <div className="flex flex-col gap-2">
                        <TimeZoneSelect value={zone} onChange={setZone} />
                        <button
                          type="button"
                          onClick={() => setPickingZone(false)}
                          className="self-start font-semibold underline underline-offset-2"
                        >
                          {intl.formatMessage(msg.done)}
                        </button>
                      </div>
                    ) : (
                      <p>
                        {intl.formatMessage(msg.timesIn, { zone: zoneName(zone, intl.locale) })} ·{" "}
                        <button
                          type="button"
                          onClick={() => setPickingZone(true)}
                          className="font-semibold underline underline-offset-2"
                        >
                          {intl.formatMessage(msg.change)}
                        </button>
                      </p>
                    )}
                  </div>
                )}
              </Section>

              <Section title={intl.formatMessage(msg.hours)}>
                {doctor.weekly_hours.length ? (
                  <>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                      {hours.map((day) => (
                        <React.Fragment key={day.weekday}>
                          <dt className="font-semibold">{weekdays[day.weekday - 1]}</dt>
                          <dd className="text-right">
                            {day.ranges.length
                              ? day.ranges.map(([from, to]) => `${hourLabel(from)} – ${hourLabel(to)}`).join(", ")
                              : intl.formatMessage(msg.closed)}
                          </dd>
                        </React.Fragment>
                      ))}
                    </dl>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {intl.formatMessage(msg.hoursIn, { zone: zoneName(doctor.timezone, intl.locale) })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(msg.noHours)}</p>
                )}
              </Section>

              <Section title={intl.formatMessage(msg.book)}>
                {(doctor.first_fee_paise !== null || doctor.follow_up_fee_paise !== null) && (
                  <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm mb-3">
                    {doctor.first_fee_paise !== null && (
                      <>
                        <dt>{intl.formatMessage(msg.firstFee)}</dt>
                        <dd className="font-semibold text-right">{formatRupees(doctor.first_fee_paise, intl.locale)}</dd>
                      </>
                    )}
                    {doctor.follow_up_fee_paise !== null && (
                      <>
                        <dt>{intl.formatMessage(msg.followUpFee)}</dt>
                        <dd className="font-semibold text-right">{formatRupees(doctor.follow_up_fee_paise, intl.locale)}</dd>
                      </>
                    )}
                  </dl>
                )}
                <p className="text-sm flex items-start gap-2">
                  <FontAwesomeIcon icon={faCalendarDays} className="mt-0.5 text-[var(--text-muted)]" aria-hidden="true" />
                  {intl.formatMessage(msg.bookSoon)}
                </p>
                {doctor.modes.length > 0 && (
                  <div className="mt-3">
                    <Tag>{modesLabel(intl, doctor.modes)}</Tag>
                  </div>
                )}
              </Section>
            </aside>
          </div>

          <EmergencyNote />
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Doctors switched on later, or missed here, are built on their first visit
  const slugs = directoryConfigured ? await loadDoctorSlugs().catch(() => []) : [];
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  const doctor = directoryConfigured && params ? await loadDoctor(params.slug) : null;
  // Switched off or unknown: 404, checked again on the next rebuild
  if (!doctor) return { notFound: true, revalidate: REVALIDATE_SECONDS };
  return { props: { doctor }, revalidate: REVALIDATE_SECONDS };
};

export default DoctorProfile;
