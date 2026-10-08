import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FormattedMessage, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUpRightFromSquare,
  faBriefcase,
  faCalendarCheck,
  faChartLine,
  faEnvelopeOpenText,
  faEye,
  faHandPointer,
  faLink,
  faPlayCircle,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { supaClient } from "../supa-client";

interface LinkStat {
  link_id: string;
  clicks_30d: number;
  clicks_total: number;
}

interface PageStats {
  views_today: number;
  views_7d: number;
  views_30d: number;
  views_total: number;
  links: LinkStat[];
  subscribers: { confirmed: number; pending: number } | null;
}

// Names and icons for the ids pages/links.tsx tracks (LINKS, and SOCIAL_LINKS
// as social_<id>). Links listed here show even before their first click;
// any other id that has clicks still shows, under its id.
const KNOWN_LINKS: { id: string; name: string; icon: IconDefinition }[] = [
  { id: "consultation", name: "Book 1:1 Call", icon: faCalendarCheck },
  { id: "website-pricing", name: "Website Development", icon: faBriefcase },
  { id: "affiliate-gear", name: "My Tech Gear", icon: faShoppingCart },
  { id: "youtube-latest", name: "Latest YouTube Video", icon: faPlayCircle },
  { id: "social_linkedin", name: "LinkedIn", icon: faLinkedin },
  { id: "social_github", name: "GitHub", icon: faGithub },
  { id: "social_instagram", name: "Instagram", icon: faInstagram },
];

interface LinkRow {
  id: string;
  name: string;
  icon: IconDefinition;
  clicks30d: number;
  clicksTotal: number;
}

function linkRows(stats: LinkStat[]): LinkRow[] {
  const byId = new Map(stats.map((s) => [s.link_id, s]));
  const rows: LinkRow[] = KNOWN_LINKS.map((link) => ({
    ...link,
    clicks30d: byId.get(link.id)?.clicks_30d ?? 0,
    clicksTotal: byId.get(link.id)?.clicks_total ?? 0,
  }));
  for (const s of stats) {
    if (!KNOWN_LINKS.some((link) => link.id === s.link_id)) {
      rows.push({ id: s.link_id, name: s.link_id, icon: faLink, clicks30d: s.clicks_30d, clicksTotal: s.clicks_total });
    }
  }
  return rows.sort((a, b) => b.clicks30d - a.clicks30d || b.clicksTotal - a.clicksTotal);
}

function Tile({
  icon,
  label,
  value,
  detail,
}: {
  icon: IconDefinition;
  label: React.ReactNode;
  value: string;
  detail: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] p-4 flex flex-col gap-1 min-w-0">
      <div className="flex items-start gap-2 text-sm leading-5 text-[var(--text-primary)] opacity-80">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 mt-0.5 shrink-0 text-[color-mix(in_srgb,var(--color-primary)_55%,var(--text-primary))]" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-primary)] opacity-80">{detail}</div>
    </div>
  );
}

// Icons and bars use the theme colour mixed with the text colour, so they stay
// visible on the dark themes' card, where --color-primary is close to the background.

/**
 * Views, link clicks and newsletter signups for /links.
 * get_page_stats returns null for anyone who isn't an admin, so the card
 * simply doesn't show for them.
 */
export default function LinksStatsCard() {
  const intl = useIntl();
  const [stats, setStats] = useState<PageStats | null>(null);

  useEffect(() => {
    supaClient
      .rpc("get_page_stats", { p_page: "links" })
      .then(({ data, error }) => {
        if (error) console.error("get_page_stats failed", error);
        else if (data) setStats(data as unknown as PageStats);
      });
  }, []);

  if (!stats) return null;

  const n = (value: number) => intl.formatNumber(value);
  const rows = linkRows(stats.links);
  const clicks30d = rows.reduce((sum, row) => sum + row.clicks30d, 0);
  const maxClicks = Math.max(1, ...rows.map((row) => row.clicks30d));
  const top = rows[0]?.clicks30d ? rows[0] : null;
  // Share of the month's visitors who clicked a link (each visitor counts once per link and day)
  const clickRate = (clicks: number) =>
    stats.views_30d > 0 ? intl.formatNumber(Math.min(clicks / stats.views_30d, 1), { style: "percent" }) : "–";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="links-stats-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="links-stats-heading" className="text-xl font-bold">
                <FormattedMessage id="links-stats-title" description="Links page stats heading" defaultMessage="Links page" />
              </h2>
              <p className="text-sm opacity-80">
                <FormattedMessage
                  id="links-stats-subtitle"
                  description="Explains how views are counted"
                  defaultMessage="Unique visitors per day. Your own visits while signed in aren't counted."
                />
              </p>
            </div>
          </div>
          <Link
            href="/links"
            target="_blank"
            className="self-start inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-inset)] transition-colors"
          >
            <FormattedMessage id="links-stats-open-page" description="Opens the links page" defaultMessage="Open page" />
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        {/* Headline numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Tile
            icon={faEye}
            label={<FormattedMessage id="links-stats-visitors-30d" description="Visitors in the last 30 days" defaultMessage="Visitors, 30 days" />}
            value={n(stats.views_30d)}
            detail={
              <FormattedMessage
                id="links-stats-visitors-detail"
                description="Visitors today and in the last 7 days"
                defaultMessage="{today} today, {week} this week"
                values={{ today: n(stats.views_today), week: n(stats.views_7d) }}
              />
            }
          />
          <Tile
            icon={faChartLine}
            label={<FormattedMessage id="links-stats-visitors-total" description="All-time visitors" defaultMessage="Visitors, all time" />}
            value={n(stats.views_total)}
            detail={<FormattedMessage id="links-stats-visitors-total-detail" description="Explains all-time count" defaultMessage="Since tracking started" />}
          />
          <Tile
            icon={faHandPointer}
            label={<FormattedMessage id="links-stats-clicks-30d" description="Link clicks in the last 30 days" defaultMessage="Link clicks, 30 days" />}
            value={n(clicks30d)}
            detail={
              top ? (
                <FormattedMessage
                  id="links-stats-top-link"
                  description="Most clicked link"
                  defaultMessage="Top: {name}"
                  values={{ name: top.name }}
                />
              ) : (
                <FormattedMessage id="links-stats-no-clicks" description="No clicks yet" defaultMessage="No clicks yet" />
              )
            }
          />
          <Tile
            icon={faEnvelopeOpenText}
            label={<FormattedMessage id="links-stats-subscribers-label" description="Newsletter subscribers" defaultMessage="Subscribers" />}
            value={n(stats.subscribers?.confirmed ?? 0)}
            detail={
              <FormattedMessage
                id="links-stats-pending"
                description="Signups that haven't confirmed their email yet"
                defaultMessage="{pending} waiting to confirm"
                values={{ pending: n(stats.subscribers?.pending ?? 0) }}
              />
            }
          />
        </div>

        {/* Clicks per link */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="font-semibold">
              <FormattedMessage id="links-stats-top-links" description="Clicks per link heading" defaultMessage="Clicks per link" />
            </h3>
            <span className="text-xs opacity-80">
              <FormattedMessage id="links-stats-columns" description="Explains the numbers in each row" defaultMessage="30 days · all time" />
            </span>
          </div>
          <ul className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-[var(--surface-inset)] text-[color-mix(in_srgb,var(--color-primary)_55%,var(--text-primary))]">
                  <FontAwesomeIcon icon={row.icon} className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium truncate">{row.name}</span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold">{n(row.clicks30d)}</span>
                      <span className="opacity-80"> · {n(row.clicksTotal)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div
                      className="h-2 flex-1 rounded-full bg-[var(--surface-inset)] overflow-hidden"
                      role="img"
                      aria-label={intl.formatMessage(
                        {
                          id: "links-stats-bar-label",
                          description: "Screen reader text for a link's click bar",
                          defaultMessage: "{clicks} clicks in 30 days",
                        },
                        { clicks: row.clicks30d }
                      )}
                    >
                      <div
                        className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_55%,var(--text-primary))]"
                        style={{ width: `${(row.clicks30d / maxClicks) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums opacity-80" title={intl.formatMessage({
                      id: "links-stats-rate-title",
                      description: "Tooltip for the click rate",
                      defaultMessage: "Share of this month's visitors who clicked",
                    })}>
                      {clickRate(row.clicks30d)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
