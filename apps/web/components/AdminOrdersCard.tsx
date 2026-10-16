import React, { useEffect, useState } from "react";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { supaClient } from "../supa-client";
import { OrderTotals, formatEuro, orderTotals } from "../lib/orders";

const m = defineMessages({
  title: { id: "admin-orders-title", description: "Admin orders card heading", defaultMessage: "Orders" },
  summary: {
    id: "admin-orders-card-summary",
    description: "Admin orders card: revenue and number of orders in the last 30 days",
    defaultMessage: "{revenue} from {count, plural, one {# order} other {# orders}} in the last 30 days, less refunds",
  },
  loadFailed: { id: "admin-orders-card-load-failed", description: "Admin orders card: the orders could not be loaded", defaultMessage: "Couldn't load orders." },
  open: { id: "admin-orders-card-open", description: "Admin orders card: open the orders page", defaultMessage: "See all orders" },
});

/** Revenue and order count for the last 30 days with a link to /admin/orders. Admins only. */
export default function AdminOrdersCard() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState(false);
  const [totals, setTotals] = useState<OrderTotals | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    supaClient.rpc("is_admin").then(async ({ data }) => {
      if (data !== true) return;
      setIsAdmin(true);
      // Fine at this volume (a few hundred rows)
      const { data: rows, error } = await supaClient.from("orders").select("total, created_at, metadata");
      if (error) {
        console.error("Loading order totals failed", error);
        setFailed(true);
        return;
      }
      setTotals(orderTotals(rows ?? []));
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-orders-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="admin-orders-heading" className="text-xl font-bold">
              {intl.formatMessage(m.title)}
            </h2>
            <p className="text-sm opacity-80">
              {totals
                ? intl.formatMessage(m.summary, { revenue: formatEuro(intl, totals.revenue30d), count: totals.orders30d })
                : failed
                  ? intl.formatMessage(m.loadFailed)
                  : " "}
            </p>
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-semibold bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
        >
          {intl.formatMessage(m.open)}
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
