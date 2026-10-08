import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
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

/**
 * Views, link clicks and newsletter signups for /links.
 * get_page_stats returns null for anyone who isn't an admin, so the card
 * simply doesn't show for them.
 */
export default function LinksStatsCard() {
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

  const tiles = [
    { label: <FormattedMessage id="links-stats-today" description="Views today" defaultMessage="Today" />, value: stats.views_today },
    { label: <FormattedMessage id="links-stats-7d" description="Views in 7 days" defaultMessage="7 days" />, value: stats.views_7d },
    { label: <FormattedMessage id="links-stats-30d" description="Views in 30 days" defaultMessage="30 days" />, value: stats.views_30d },
    { label: <FormattedMessage id="links-stats-total" description="All-time views" defaultMessage="All time" />, value: stats.views_total },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="links-stats-heading">
      <div className="bg-white card--white rounded-xl p-6 drop-shadow-lg">
        <h2 id="links-stats-heading" className="text-xl font-bold mb-1">
          <FormattedMessage id="links-stats-title" description="Links page stats heading" defaultMessage="Links page" />
        </h2>
        <p className="text-sm opacity-70 mb-4">
          <FormattedMessage
            id="links-stats-subtitle"
            description="Explains how views are counted"
            defaultMessage="Unique visitors per day. Your own visits while signed in aren't counted."
          />
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {tiles.map((tile, i) => (
            <div key={i} className="rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-sm opacity-70">{tile.label}</div>
              <div className="text-2xl font-semibold tabular-nums">{tile.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">
              <FormattedMessage id="links-stats-top-links" description="Top links heading" defaultMessage="Clicks per link (30 days)" />
            </h3>
            {stats.links.length === 0 ? (
              <p className="text-sm opacity-70">
                <FormattedMessage id="links-stats-no-clicks" description="No clicks yet" defaultMessage="No clicks yet." />
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left opacity-70">
                    <th className="font-normal py-1">
                      <FormattedMessage id="links-stats-link" description="Link column" defaultMessage="Link" />
                    </th>
                    <th className="font-normal py-1 text-right">
                      <FormattedMessage id="links-stats-30d-col" description="30 day clicks column" defaultMessage="30 days" />
                    </th>
                    <th className="font-normal py-1 text-right">
                      <FormattedMessage id="links-stats-total-col" description="All-time clicks column" defaultMessage="All time" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.links.map((link) => (
                    <tr key={link.link_id} className="border-t border-gray-100">
                      <td className="py-1 font-mono">{link.link_id}</td>
                      <td className="py-1 text-right tabular-nums">{link.clicks_30d.toLocaleString()}</td>
                      <td className="py-1 text-right tabular-nums">{link.clicks_total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {stats.subscribers && (
            <div>
              <h3 className="font-semibold mb-2">
                <FormattedMessage id="links-stats-newsletter" description="Newsletter heading" defaultMessage="Newsletter" />
              </h3>
              <p className="text-sm">
                <FormattedMessage
                  id="links-stats-subscribers"
                  description="Subscriber counts"
                  defaultMessage="{confirmed} confirmed, {pending} waiting for confirmation"
                  values={{ confirmed: stats.subscribers.confirmed, pending: stats.subscribers.pending }}
                />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
