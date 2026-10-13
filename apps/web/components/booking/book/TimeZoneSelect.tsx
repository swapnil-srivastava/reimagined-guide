import React, { useMemo } from "react";
import { DateTime } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthEurope } from "@fortawesome/free-solid-svg-icons";
import { allTimeZones } from "../../../lib/booking/format";

// Which zone the times are shown in. Starts as the browser's own zone.

const m = defineMessages({
  label: { id: "book-timezone-label", description: "Booking: time zone picker label", defaultMessage: "Time zone" },
});

export default function TimeZoneSelect({ value, onChange }: { value: string; onChange: (zone: string) => void }) {
  const intl = useIntl();
  const options = useMemo(() => {
    const now = DateTime.now();
    const zones = allTimeZones();
    if (!zones.includes(value)) zones.push(value);
    return zones
      .map((zone) => {
        const at = now.setZone(zone);
        return { zone, offset: at.offset, label: `(${at.toFormat("'GMT'ZZ")}) ${zone.replace(/_/g, " ")}` };
      })
      .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone));
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="book-timezone" className="text-sm font-semibold flex items-center gap-2">
        <FontAwesomeIcon icon={faEarthEurope} className="text-[var(--text-muted)]" />
        {intl.formatMessage(m.label)}
      </label>
      <select
        id="book-timezone"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[44px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        {options.map((o) => (
          <option key={o.zone} value={o.zone}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
