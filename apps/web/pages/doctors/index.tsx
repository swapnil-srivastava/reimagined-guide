import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSliders, faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import Metatags from "../../components/Metatags";
import DoctorCard from "../../components/doctors/DoctorCard";
import FilterPanel from "../../components/doctors/FilterPanel";
import { EmergencyNote, PageHeading, cardClass, linkButton } from "../../components/doctors/ui";
import { ChipGroup, inputClass } from "../../components/booking/admin/ui";
import { browserZone } from "../../components/booking/book/api";
import {
  NO_FILTERS,
  activeFilterCount,
  allLanguages,
  filterDoctors,
  filtersFromQuery,
  filtersToQuery,
  specialtyCounts,
  withoutPastSlots,
  type DirectoryFilters,
  type PublicDoctor,
} from "../../lib/doctors/directory";
import { SITE_URL } from "../../lib/site";
import { directoryConfigured, loadDoctors } from "../../lib/server/doctors";

// e.g. localhost:3000/doctors?specialty=General%20Physician
// Find a doctor (P2 / W1, filters N8, no match S2). The list is built on the
// server every few minutes; search and filters run in the browser and are
// kept in the URL so a filtered list can be shared.

/** Seconds a built list is served before it is rebuilt */
const REVALIDATE_SECONDS = 300;
/** Typing pause before the URL catches up with the search box */
const URL_SYNC_MS = 300;

const msg = defineMessages({
  title: { id: "doctors-list-title", description: "Doctors list: page heading", defaultMessage: "Doctors" },
  metaDescription: {
    id: "doctors-list-meta",
    description: "Doctors list: search engine description",
    defaultMessage: "Find a doctor at Srivastava Family Clinic and book a clinic, video or audio consultation.",
  },
  search: { id: "doctors-list-search", description: "Doctors list: search field label", defaultMessage: "Search" },
  searchPlaceholder: {
    id: "doctors-list-search-placeholder",
    description: "Doctors list: search field placeholder",
    defaultMessage: "Search by name or specialty…",
  },
  specialty: { id: "doctors-list-specialty", description: "Doctors list: specialty chips label", defaultMessage: "Specialty" },
  all: { id: "doctors-list-all", description: "Doctors list: every specialty", defaultMessage: "All" },
  count: {
    id: "doctors-list-count",
    description: "Doctors list: how many doctors are shown",
    defaultMessage: "{count, plural, one {# doctor} other {# doctors}}",
  },
  filters: { id: "doctors-list-filters", description: "Doctors list: open the filters (phone)", defaultMessage: "Filters" },
  filtersOn: {
    id: "doctors-list-filters-on",
    description: "Doctors list: filters button with how many are on",
    defaultMessage: "Filters ({count})",
  },
  show: {
    id: "doctors-list-show",
    description: "Doctors filters sheet: close and show the results",
    defaultMessage: "{count, plural, =0 {No doctors match} one {Show # doctor} other {Show # doctors}}",
  },
  noMatch: { id: "doctors-list-no-match", description: "Doctors list: nothing matches", defaultMessage: "No doctors match" },
  noMatchHint: {
    id: "doctors-list-no-match-hint",
    description: "Doctors list: what to try when nothing matches",
    defaultMessage: "Try fewer filters or another specialty.",
  },
  clear: { id: "doctors-list-clear", description: "Doctors list: reset search and filters", defaultMessage: "Clear filters" },
  none: { id: "doctors-list-none", description: "Doctors list: no doctor is listed yet", defaultMessage: "Doctors will be listed here soon" },
  noneHint: {
    id: "doctors-list-none-hint",
    description: "Doctors list: no doctor is listed yet, hint",
    defaultMessage: "We're getting the clinic's profiles ready. Please check back in a few days.",
  },
});

interface Props {
  doctors: PublicDoctor[];
}

const DoctorsPage: NextPage<Props> = ({ doctors: built }) => {
  const intl = useIntl();
  const router = useRouter();
  const searchId = useId();
  const [filters, setFilters] = useState<DirectoryFilters>(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const filtersButton = useRef<HTMLButtonElement>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  // Times depend on the visitor's zone and clock, so they appear after the first render
  const [clock, setClock] = useState<{ zone: string; now: number } | null>(null);

  useEffect(() => setClock({ zone: browserZone(), now: Date.now() }), []);

  // Filters come from the URL once Next has read it
  useEffect(() => {
    if (!router.isReady) return;
    setFilters(filtersFromQuery(router.query));
    setUrlReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // The URL follows the filters, after a short pause so typing stays cheap
  useEffect(() => {
    if (!urlReady) return;
    const timer = setTimeout(() => {
      router.replace({ pathname: router.pathname, query: filtersToQuery(filters) }, undefined, { shallow: true, scroll: false });
    }, URL_SYNC_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, urlReady]);

  const update = setFilters;
  const clear = () => update(NO_FILTERS);
  const closeSheet = () => {
    setSheetOpen(false);
    // The sheet's button goes away with it, so focus returns to the one that opened it
    filtersButton.current?.focus();
  };

  const doctors = useMemo(() => (clock ? withoutPastSlots(built, clock.now) : built), [built, clock]);
  const specialties = useMemo(() => specialtyCounts(doctors), [doctors]);
  // A language picked from a shared link stays visible so it can be switched off
  const languages = useMemo(
    () => Array.from(new Set([...allLanguages(doctors), ...filters.languages])),
    [doctors, filters.languages]
  );
  // Typing stays smooth while the list catches up
  const deferred = useDeferredValue(filters);
  const shown = useMemo(
    () =>
      clock
        ? filterDoctors(doctors, deferred, new Date(clock.now), clock.zone)
        : // Until the visitor's clock is known, "today" and "this week" can't be judged
          filterDoctors(doctors, { ...deferred, availability: "any" }, new Date(), "UTC"),
    [doctors, deferred, clock]
  );
  const filterCount = activeFilterCount(filters);
  const title = intl.formatMessage(msg.title);

  const panel = (footer?: React.ReactNode) => (
    <FilterPanel filters={filters} languages={languages} onChange={update} onClear={clear} footer={footer} />
  );

  return (
    <>
      <Metatags title={title} description={intl.formatMessage(msg.metaDescription)} url={`${SITE_URL}/doctors`} />
      <div className="booking-ui doctors-ui font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
          <PageHeading backHref="/book-appointment">{title}</PageHeading>

          {built.length === 0 ? (
            <div className={`${cardClass} p-8 text-center flex flex-col items-center gap-3`}>
              <FontAwesomeIcon icon={faUserDoctor} className="w-8 h-8 opacity-70" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{intl.formatMessage(msg.none)}</h2>
              <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(msg.noneHint)}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 max-w-md">
                <label htmlFor={searchId} className="text-sm font-semibold">
                  {intl.formatMessage(msg.search)}
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchBox}
                    id={searchId}
                    type="search"
                    value={filters.query}
                    onChange={(e) => update({ ...filters, query: e.target.value })}
                    placeholder={intl.formatMessage(msg.searchPlaceholder)}
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {specialties.length > 0 && (
                <ChipGroup<string>
                  label={intl.formatMessage(msg.specialty)}
                  options={[
                    { value: "", label: intl.formatMessage(msg.all) },
                    ...specialties.map((s) => ({ value: s.specialty, label: s.specialty })),
                  ]}
                  value={filters.specialty}
                  onChange={(specialty) => update({ ...filters, specialty })}
                />
              )}

              <div className="flex items-center justify-between gap-3 lg:hidden">
                <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
                  {intl.formatMessage(msg.count, { count: shown.length })}
                </p>
                <button
                  ref={filtersButton}
                  type="button"
                  aria-expanded={sheetOpen}
                  aria-controls="doctors-filters-sheet"
                  onClick={() => setSheetOpen((open) => !open)}
                  className={linkButton.secondary}
                >
                  <FontAwesomeIcon icon={faSliders} aria-hidden="true" />
                  {filterCount ? intl.formatMessage(msg.filtersOn, { count: filterCount }) : intl.formatMessage(msg.filters)}
                </button>
              </div>

              {sheetOpen && (
                <div id="doctors-filters-sheet" className={`${cardClass} p-4 lg:hidden`}>
                  {panel(
                    <button type="button" onClick={closeSheet} className={`${linkButton.primary} w-full`}>
                      {intl.formatMessage(msg.show, { count: shown.length })}
                    </button>
                  )}
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-[16rem_1fr] items-start">
                <aside className={`${cardClass} p-4 hidden lg:block`}>{panel()}</aside>

                <section className="flex flex-col gap-3 min-w-0">
                  <p className="hidden lg:block text-sm text-[var(--text-muted)]" aria-live="polite">
                    {intl.formatMessage(msg.count, { count: shown.length })}
                  </p>
                  {shown.length ? (
                    <ul className="grid gap-4 md:grid-cols-2">
                      {shown.map((doctor) => (
                        <li key={doctor.slug} className="flex">
                          <DoctorCard doctor={doctor} zone={clock?.zone ?? doctor.timezone} showTimes={!!clock} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={`${cardClass} p-8 text-center flex flex-col items-center gap-3`}>
                      <span className="w-14 h-14 rounded-full inline-flex items-center justify-center bg-[var(--surface-inset)]">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <h2 className="text-lg font-bold">{intl.formatMessage(msg.noMatch)}</h2>
                      <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(msg.noMatchHint)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          clear();
                          // This button goes away with the empty state
                          searchBox.current?.focus();
                        }}
                        className={`${linkButton.secondary} w-full max-w-xs`}
                      >
                        {intl.formatMessage(msg.clear)}
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          <EmergencyNote />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Builds without database access (e.g. a local build) get an empty list.
  // A failed load throws, so Next keeps serving the last good list.
  const doctors = directoryConfigured ? await loadDoctors() : [];
  // The list only needs what a card shows; the profile page has the rest
  const cards = doctors.map((d) => ({ ...d, bio: null, clinic: null, weekly_hours: [], consultations: d.consultations.slice(0, 1) }));
  return { props: { doctors: cards }, revalidate: REVALIDATE_SECONDS };
};

export default DoctorsPage;
