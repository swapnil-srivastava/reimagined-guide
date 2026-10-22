import React from "react";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faClock, faMagnifyingGlass, faStethoscope } from "@fortawesome/free-solid-svg-icons";

import Metatags from "../../components/Metatags";
import { EmergencyNote, cardClass, linkButton } from "../../components/doctors/ui";
import { SITE_URL } from "../../lib/site";
import { directoryConfigured, loadSpecialties } from "../../lib/server/doctors";

// e.g. localhost:3000/book-appointment
// Start of the doctor booking journey (P1): what it is, how it works and the
// clinic's specialties, each leading to the filtered doctor list.

const REVALIDATE_SECONDS = 300;

const msg = defineMessages({
  title: {
    id: "book-appointment-title",
    description: "Book an appointment: page heading",
    defaultMessage: "Schedule appointments with ease",
  },
  intro: {
    id: "book-appointment-intro",
    description: "Book an appointment: line under the heading",
    defaultMessage: "Book, reschedule or cancel with trusted doctors in a few clicks.",
  },
  find: { id: "book-appointment-find", description: "Book an appointment: go to the doctor list", defaultMessage: "Find a doctor" },
  how: { id: "book-appointment-how", description: "Book an appointment: how it works heading", defaultMessage: "How it works" },
  step1: { id: "book-appointment-step1", description: "How it works, step 1 title", defaultMessage: "Choose a doctor" },
  step1Text: {
    id: "book-appointment-step1-text",
    description: "How it works, step 1 text",
    defaultMessage: "Filter by specialty, language and availability.",
  },
  step2: { id: "book-appointment-step2", description: "How it works, step 2 title", defaultMessage: "Pick a time" },
  step2Text: {
    id: "book-appointment-step2-text",
    description: "How it works, step 2 text",
    defaultMessage: "Times are shown in your own time zone.",
  },
  step3: { id: "book-appointment-step3", description: "How it works, step 3 title", defaultMessage: "Get your confirmation" },
  step3Text: {
    id: "book-appointment-step3-text",
    description: "How it works, step 3 text",
    defaultMessage: "A calendar invite and reminders before your visit.",
  },
  specialties: { id: "book-appointment-specialties", description: "Book an appointment: specialties heading", defaultMessage: "Specialties" },
  doctors: {
    id: "book-appointment-doctor-count",
    description: "Book an appointment: doctors in a specialty",
    defaultMessage: "{count, plural, one {# doctor} other {# doctors}}",
  },
  seeDoctors: {
    id: "book-appointment-see-doctors",
    description: "Book an appointment: screen reader label of a specialty link",
    defaultMessage: "{specialty}, {count, plural, one {# doctor} other {# doctors}}",
  },
  changeRule: {
    id: "book-appointment-change-rule",
    description: "Book an appointment: reassurance about changing a booking",
    defaultMessage: "Reschedule or cancel up to 24 hours before",
  },
  reminders: {
    id: "book-appointment-reminders",
    description: "Book an appointment: reassurance about reminders",
    defaultMessage: "Reminders a day and an hour before",
  },
});

interface Props {
  specialties: { specialty: string; count: number }[];
}

const BookAppointment: NextPage<Props> = ({ specialties }) => {
  const intl = useIntl();
  const steps = [
    [msg.step1, msg.step1Text],
    [msg.step2, msg.step2Text],
    [msg.step3, msg.step3Text],
  ] as const;

  return (
    <>
      <Metatags title={intl.formatMessage(msg.find)} description={intl.formatMessage(msg.intro)} url={`${SITE_URL}/book-appointment`} />
      <div className="font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-balance">{intl.formatMessage(msg.title)}</h1>
            <p className="text-base text-[var(--text-muted)]">{intl.formatMessage(msg.intro)}</p>
            <Link href="/doctors" className={`${linkButton.primary} w-full sm:w-auto sm:self-start text-base`}>
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              {intl.formatMessage(msg.find)}
            </Link>
          </header>

          <section className={`${cardClass} p-4 sm:p-5`}>
            <h2 className="text-lg font-bold mb-3">{intl.formatMessage(msg.how)}</h2>
            <ol className="flex flex-col gap-3">
              {steps.map(([heading, text], i) => (
                <li key={heading.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="w-8 h-8 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-bold bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{intl.formatMessage(heading)}</p>
                    <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(text)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {specialties.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">{intl.formatMessage(msg.specialties)}</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specialties.map(({ specialty, count }) => (
                  <li key={specialty} className="flex">
                    <Link
                      href={{ pathname: "/doctors", query: { specialty } }}
                      aria-label={intl.formatMessage(msg.seeDoctors, { specialty, count })}
                      className={`${cardClass} w-full p-4 flex flex-col gap-2 hover:border-[var(--accent-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]`}
                    >
                      <span className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-[var(--surface-inset)]">
                        <FontAwesomeIcon icon={faStethoscope} aria-hidden="true" />
                      </span>
                      <span className="font-semibold">{specialty}</span>
                      <span className="text-sm text-[var(--text-muted)]">{intl.formatMessage(msg.doctors, { count })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ul className="rounded-2xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] p-4 flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCalendarCheck} className="mt-0.5 w-4" aria-hidden="true" />
              {intl.formatMessage(msg.changeRule)}
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faClock} className="mt-0.5 w-4" aria-hidden="true" />
              {intl.formatMessage(msg.reminders)}
            </li>
          </ul>

          <EmergencyNote />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return { props: { specialties: directoryConfigured ? await loadSpecialties() : [] }, revalidate: REVALIDATE_SECONDS };
};

export default BookAppointment;
