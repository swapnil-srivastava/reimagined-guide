import React from "react";
import { DateTime } from "luxon";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faClock, faEarthEurope, faVideo, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import type { PublicContext } from "./api";
import { durationLabel, longDayLabel, rangeLabel } from "../../../lib/booking/format";

// The left side of the booking card: who the call is with, how long it is
// and, once picked, when it is.

type Host = PublicContext["hosts"][number];

const m = defineMessages({
  video: { id: "book-location-video", description: "Booking: the call is a video call", defaultMessage: "Video call, link sent before the call" },
  phone: { id: "book-location-phone", description: "Booking: the call is a phone call", defaultMessage: "Phone call" },
  inPerson: { id: "book-location-in-person", description: "Booking: the call is in person", defaultMessage: "In person" },
  hostTime: {
    id: "book-summary-host-time",
    description: "Booking: the chosen time in the host's zone",
    defaultMessage: "{time} for {name}",
  },
});

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function HostAvatar({ host, size = "lg" }: { host: Host; size?: "lg" | "sm" }) {
  const box = size === "lg" ? "w-16 h-16 text-xl" : "w-11 h-11 text-sm";
  if (host.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={host.photo_url} alt="" className={`${box} rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden
      className={`${box} rounded-full inline-flex items-center justify-center font-bold bg-[var(--accent-ink)] text-[var(--bg-primary)]`}
    >
      {initials(host.name)}
    </span>
  );
}

export default function CallSummary({
  ctx,
  host,
  start,
  end,
  zone,
}: {
  ctx: PublicContext;
  host: Host | undefined;
  start?: string | null;
  end?: string | null;
  zone: string;
}) {
  const intl = useIntl();
  const kind = ctx.type.location_kind;
  const where = kind === "phone" ? m.phone : kind === "in_person" ? m.inPerson : m.video;
  const whereIcon = kind === "phone" ? faPhone : kind === "in_person" ? faLocationDot : faVideo;

  const s = start ? DateTime.fromISO(start).setZone(zone).setLocale(intl.locale) : null;
  const e = end ? DateTime.fromISO(end).setZone(zone).setLocale(intl.locale) : null;
  const hostS = host && start ? DateTime.fromISO(start).setZone(host.timezone).setLocale(intl.locale) : null;
  const hostE = host && end ? DateTime.fromISO(end).setZone(host.timezone).setLocale(intl.locale) : null;
  const differentZone = hostS && s && hostS.offset !== s.offset;

  return (
    <div className="flex flex-col gap-4">
      {host && (
        <div className="flex items-center gap-3">
          <HostAvatar host={host} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-muted)] text-sm">{host.name}</p>
            {host.title && <p className="text-xs text-[var(--text-muted)]">{host.title}</p>}
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold leading-tight">{ctx.type.name}</h1>
      <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)] font-medium">
        <li className="flex items-center gap-3">
          <FontAwesomeIcon icon={faClock} className="w-4" />
          {durationLabel(ctx.type.duration_minutes)}
        </li>
        <li className="flex items-center gap-3">
          <FontAwesomeIcon icon={whereIcon} className="w-4" />
          {intl.formatMessage(where)}
        </li>
        {s && e && (
          <li className="flex items-start gap-3 text-[var(--text-primary)]">
            <FontAwesomeIcon icon={faCalendarDays} className="w-4 mt-0.5" />
            <span>
              {rangeLabel(s, e)}, {longDayLabel(s)}
              {differentZone && hostS && hostE && (
                <span className="block text-xs text-[var(--text-muted)] mt-1">
                  {intl.formatMessage(m.hostTime, { time: rangeLabel(hostS, hostE), name: host!.name.split(" ")[0] })}
                </span>
              )}
            </span>
          </li>
        )}
        {s && (
          <li className="flex items-center gap-3">
            <FontAwesomeIcon icon={faEarthEurope} className="w-4" />
            {zone.replace(/_/g, " ")}
          </li>
        )}
      </ul>
      {ctx.type.description && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{ctx.type.description}</p>}
    </div>
  );
}
