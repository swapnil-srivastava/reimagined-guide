import React from "react";
import { DateTime, Info } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// A month of days, Monday first. Days with a free time are tappable; the
// rest are greyed out, as in Calendly.

const m = defineMessages({
  prev: { id: "book-calendar-prev", description: "Booking calendar: previous month", defaultMessage: "Previous month" },
  next: { id: "book-calendar-next", description: "Booking calendar: next month", defaultMessage: "Next month" },
  free: { id: "book-calendar-day-free", description: "Booking calendar: a day with free times (screen readers)", defaultMessage: "{day}, times available" },
  none: { id: "book-calendar-day-none", description: "Booking calendar: a day without free times (screen readers)", defaultMessage: "{day}, no times" },
});

export default function MonthCalendar({
  month,
  available,
  selected,
  loading,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onSelect,
}: {
  /** Any moment in the month, in the buyer's zone */
  month: DateTime;
  /** "YYYY-MM-DD" dates in the buyer's zone that have a free time */
  available: Set<string>;
  selected: string | null;
  loading: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: string) => void;
}) {
  const intl = useIntl();
  const first = month.startOf("month");
  const lead = first.weekday - 1; // Monday first
  const days = first.daysInMonth ?? 30;
  const today = DateTime.now().setZone(month.zone).toISODate();
  const weekdays = Info.weekdays("short", { locale: intl.locale });

  const cells: (DateTime | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => first.plus({ days: i })),
  ];

  const navButton =
    "inline-flex items-center justify-center w-11 h-11 rounded-full text-[var(--accent-ink)] " +
    "bg-[color-mix(in_srgb,var(--accent-ink)_14%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent-ink)_24%,transparent)] " +
    "disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold capitalize" aria-live="polite">
          {first.setLocale(intl.locale).toLocaleString({ month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button type="button" className={navButton} onClick={onPrev} disabled={!canPrev} aria-label={intl.formatMessage(m.prev)}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button type="button" className={navButton} onClick={onNext} disabled={!canNext} aria-label={intl.formatMessage(m.next)}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
        {weekdays.map((d) => (
          <div key={d} aria-hidden>
            {d}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 transition-opacity ${loading ? "opacity-50" : ""}`} role="grid">
        {cells.map((day, i) => {
          if (!day) return <div key={`lead-${i}`} />;
          const iso = day.toISODate()!;
          const free = available.has(iso);
          const isSelected = selected === iso;
          const label = day.setLocale(intl.locale).toLocaleString({ weekday: "long", day: "numeric", month: "long" });
          const tone = isSelected
            ? "bg-[var(--accent-ink)] text-[var(--bg-primary)] font-bold shadow"
            : free
              ? "bg-[color-mix(in_srgb,var(--accent-ink)_14%,transparent)] text-[var(--accent-ink)] font-bold hover:bg-[color-mix(in_srgb,var(--accent-ink)_26%,transparent)]"
              : "text-[var(--text-muted)] opacity-60 cursor-default";
          return (
            <div key={iso} className="flex justify-center">
              <button
                type="button"
                disabled={!free}
                onClick={() => onSelect(iso)}
                aria-pressed={isSelected}
                aria-label={intl.formatMessage(free ? m.free : m.none, { day: label })}
                className={`relative w-full max-w-[3rem] aspect-square min-h-[40px] rounded-full text-sm sm:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${tone}`}
              >
                {day.day}
                {iso === today && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 -translate-x-1/2 bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-[var(--bg-primary)]" : "bg-[var(--text-primary)]"}`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
