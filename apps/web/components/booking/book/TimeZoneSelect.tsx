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

function zoneOption(zone: string, now: DateTime) {
  const at = now.setZone(zone);
  return { zone, offset: at.offset, label: `(${at.toFormat("'GMT'ZZ")}) ${zone.replace(/_/g, " ")}` };
}

// Built once per page load: ~400 zones, each needing an offset lookup
let cached: ReturnType<typeof zoneOption>[] | null = null;
function zoneOptions() {
  if (!cached) {
    const now = DateTime.now();
    cached = allTimeZones()
      .map((zone) => zoneOption(zone, now))
      .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone));
  }
  return cached;
}

export default function TimeZoneSelect({ value, onChange }: { value: string; onChange: (zone: string) => void }) {
  const intl = useIntl();
  const options = useMemo(() => {
    const list = zoneOptions();
    return list.some((o) => o.zone === value) ? list : [...list, zoneOption(value, DateTime.now())];
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
        className="w-full min-h-[44px] rounded-lg border border-[var(--border-control)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus:ring-[var(--text-primary)]"
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
