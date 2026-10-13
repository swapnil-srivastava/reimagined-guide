import React from "react";
import { DateTime } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import type { Slot } from "./api";
import { timeLabel } from "../../../lib/booking/format";

// The free start times of one day. Tapping a time opens a "Next" button
// beside it, so a stray tap never books anything.

const m = defineMessages({
  next: { id: "book-times-next", description: "Booking: continue with the chosen time", defaultMessage: "Next" },
  empty: { id: "book-times-empty", description: "Booking: the chosen day has no times left", defaultMessage: "No times left on this day." },
});

export default function TimeList({
  slots,
  zone,
  chosen,
  onChoose,
  onNext,
}: {
  slots: Slot[];
  zone: string;
  chosen: string | null;
  onChoose: (start: string) => void;
  onNext: () => void;
}) {
  const intl = useIntl();
  if (!slots.length) return <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.empty)}</p>;

  return (
    <ul className="flex flex-col gap-2" role="list">
      {slots.map((slot) => {
        const label = timeLabel(DateTime.fromISO(slot.start).setZone(zone).setLocale(intl.locale));
        const active = chosen === slot.start;
        return (
          <li key={slot.start} className="flex gap-2">
            <button
              type="button"
              onClick={() => onChoose(slot.start)}
              aria-pressed={active}
              className={`min-h-[48px] rounded-lg border text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                active
                  ? "w-1/2 border-[var(--text-muted)] bg-[var(--text-muted)] text-[var(--bg-primary)]"
                  : "w-full border-[color-mix(in_srgb,var(--accent-ink)_55%,transparent)] text-[var(--accent-ink)] hover:border-[var(--accent-ink)] hover:border-2"
              }`}
            >
              {label}
            </button>
            {active && (
              <button
                type="button"
                onClick={onNext}
                autoFocus
                className="w-1/2 min-h-[48px] rounded-lg bg-[var(--accent-ink)] text-[var(--bg-primary)] text-base font-semibold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
              >
                {intl.formatMessage(m.next)}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
