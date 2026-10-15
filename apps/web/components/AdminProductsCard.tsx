import React, { useEffect, useState } from "react";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { supaClient } from "../supa-client";
import { stockLevel } from "../lib/product/edit";

const m = defineMessages({
  title: { id: "admin-products-card-title", description: "Admin products card heading", defaultMessage: "Products" },
  summary: {
    id: "admin-products-card-summary",
    description: "Admin products card: number of products and how many are low on stock",
    defaultMessage: "{count, plural, one {# product} other {# products}} · {low, plural, =0 {none low on stock} other {# low on stock}}",
  },
  open: { id: "admin-products-card-open", description: "Admin products card: open the products page", defaultMessage: "Manage products" },
  openLow: { id: "admin-products-card-open-low", description: "Admin products card: open the products that are low on stock", defaultMessage: "See low stock" },
});

/** Product count and low-stock count with a link to /admin/products. Admins only. */
export default function AdminProductsCard() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState<{ count: number; low: number } | null>(null);

  useEffect(() => {
    supaClient.rpc("is_admin").then(async ({ data }) => {
      if (data !== true) return;
      setIsAdmin(true);
      const { data: products, error } = await supaClient.from("products").select("stock, low_stock_threshold");
      if (error) {
        // The products migration hasn't been run yet
        console.error("Loading products failed", error);
        return;
      }
      const list = products ?? [];
      setCounts({ count: list.length, low: list.filter((p) => stockLevel(p.stock, p.low_stock_threshold) !== "ok").length });
    });
  }, []);

  if (!isAdmin) return null;
  const low = (counts?.low ?? 0) > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-products-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faBoxesStacked} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="admin-products-heading" className="text-xl font-bold">
              {intl.formatMessage(m.title)}
            </h2>
            <p className="text-sm opacity-80">{counts ? intl.formatMessage(m.summary, counts) : " "}</p>
          </div>
        </div>
        <Link
          href={low ? "/admin/products?filter=low" : "/admin/products"}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-semibold bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
        >
          {intl.formatMessage(low ? m.openLow : m.open)}
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
