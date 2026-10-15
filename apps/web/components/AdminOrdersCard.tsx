import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faEuroSign, faReceipt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { supaClient } from "../supa-client";
import OrderItems from "./OrderItems";
import {
  ORDER_SELECT,
  OrderRow,
  STATUS_PILL,
  amountRefunded,
  customerEmail,
  formatEuro,
  formatOrderDate,
  orderNumber,
  orderTypeLabel,
  paymentMethodLabel,
  statusLabel,
} from "../lib/orders";

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Totals {
  revenue30d: number;
  orders30d: number;
  revenueTotal: number;
  ordersTotal: number;
}

function Tile({ icon, label, value, detail }: { icon: IconDefinition; label: React.ReactNode; value: string; detail: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] p-4 flex flex-col gap-1 min-w-0">
      <div className="flex items-start gap-2 text-sm leading-5 opacity-80">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 mt-0.5 shrink-0 text-[color-mix(in_srgb,var(--color-primary)_55%,var(--text-primary))]" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-semibold tabular-nums break-words">{value}</div>
      <div className="text-xs opacity-80">{detail}</div>
    </div>
  );
}

/**
 * Every order (Stripe and PayPal) with its status and total, for admins.
 * Shows nothing for anyone else: is_admin() is false for them, and RLS only
 * lets them read their own orders anyway.
 */
export default function AdminOrdersCard() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (offset: number) => {
    const { data, error } = await supaClient
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) {
      console.error("Loading orders failed", error);
      return;
    }
    const page = (data ?? []) as unknown as OrderRow[];
    setOrders((current) => (offset === 0 ? page : [...current, ...page]));
    setHasMore(page.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    supaClient.rpc("is_admin").then(async ({ data }) => {
      if (data !== true) return;
      setIsAdmin(true);
      loadPage(0);
      // Totals over every order; fine at this volume (a few hundred rows)
      const { data: all, error } = await supaClient.from("orders").select("total, created_at, metadata");
      if (error) {
        console.error("Loading order totals failed", error);
        return;
      }
      const since = Date.now() - 30 * DAY_MS;
      const recent = (all ?? []).filter((o) => o.created_at && new Date(o.created_at).getTime() >= since);
      // Refunds come off: revenue is what was paid and kept
      const sum = (rows: { total: number; metadata: unknown }[]) =>
        rows.reduce((acc, o) => acc + (Number(o.total) || 0) - amountRefunded(o as Pick<OrderRow, "metadata">), 0);
      setTotals({
        revenue30d: sum(recent),
        orders30d: recent.length,
        revenueTotal: sum(all ?? []),
        ordersTotal: (all ?? []).length,
      });
    });
  }, [loadPage]);

  if (!isAdmin) return null;

  const showMore = async () => {
    setLoadingMore(true);
    await loadPage(orders.length);
    setLoadingMore(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-orders-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="admin-orders-heading" className="text-xl font-bold">
              <FormattedMessage id="admin-orders-title" description="Admin orders card heading" defaultMessage="Orders" />
            </h2>
            <p className="text-sm opacity-80">
              <FormattedMessage
                id="admin-orders-subtitle"
                description="Explains what the admin orders card lists"
                defaultMessage="Shop and package orders paid by card or PayPal, newest first."
              />
            </p>
          </div>
        </div>

        {/* Headline numbers */}
        {totals && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Tile
              icon={faEuroSign}
              label={<FormattedMessage id="admin-orders-revenue-30d" description="Revenue in the last 30 days" defaultMessage="Revenue, 30 days" />}
              value={formatEuro(intl, totals.revenue30d)}
              detail={<FormattedMessage id="admin-orders-incl-tax-refunds" description="Revenue includes tax and delivery, minus refunds" defaultMessage="Including tax and delivery, less refunds" />}
            />
            <Tile
              icon={faShoppingCart}
              label={<FormattedMessage id="admin-orders-count-30d" description="Orders in the last 30 days" defaultMessage="Orders, 30 days" />}
              value={intl.formatNumber(totals.orders30d)}
              detail={
                <FormattedMessage
                  id="admin-orders-average"
                  description="Average order value in the last 30 days"
                  defaultMessage="{average} on average"
                  values={{ average: totals.orders30d ? formatEuro(intl, totals.revenue30d / totals.orders30d) : "–" }}
                />
              }
            />
            <Tile
              icon={faEuroSign}
              label={<FormattedMessage id="admin-orders-revenue-total" description="All-time revenue" defaultMessage="Revenue, all time" />}
              value={formatEuro(intl, totals.revenueTotal)}
              detail={<FormattedMessage id="admin-orders-incl-tax-refunds" description="Revenue includes tax and delivery, minus refunds" defaultMessage="Including tax and delivery, less refunds" />}
            />
            <Tile
              icon={faReceipt}
              label={<FormattedMessage id="admin-orders-count-total" description="All-time order count" defaultMessage="Orders, all time" />}
              value={intl.formatNumber(totals.ordersTotal)}
              detail={<FormattedMessage id="admin-orders-since-start" description="Explains all-time count" defaultMessage="Since the shop opened" />}
            />
          </div>
        )}

        {/* Orders */}
        {orders.length === 0 ? (
          <p className="text-sm opacity-80">
            <FormattedMessage id="admin-orders-empty" description="No orders yet" defaultMessage="No orders yet." />
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <AdminOrderRow order={order} />
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={showMore}
              disabled={loadingMore}
              className="font-poppins inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-inset)] transition-colors disabled:opacity-60"
            >
              <FormattedMessage id="admin-orders-show-more" description="Loads older orders" defaultMessage="Show older orders" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminOrderRow({ order }: { order: OrderRow }) {
  const intl = useIntl();
  const email = customerEmail(order);

  return (
    <details className="group rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)]">
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-xl px-4 py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_auto_auto] items-center gap-x-4 gap-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
        <span className="text-sm tabular-nums">{formatOrderDate(intl, order.created_at)}</span>
        <span className="row-start-2 col-span-2 sm:row-start-auto sm:col-span-1 min-w-0 text-sm">
          <span className="block truncate font-medium">
            {email ?? (
              <FormattedMessage id="admin-orders-no-email" description="Order without a customer email" defaultMessage="No email" />
            )}
          </span>
          <span className="block text-xs opacity-80">
            {orderNumber(order)} · {orderTypeLabel(intl, order.order_type)} · {paymentMethodLabel(intl, order.payment_method)}
          </span>
        </span>
        <span className={`hidden sm:inline-flex ${STATUS_PILL}`}>{statusLabel(intl, order.status)}</span>
        <span className="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto flex items-center gap-3 justify-end">
          <span className="font-semibold tabular-nums">{formatEuro(intl, order.total)}</span>
          <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 opacity-70 transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1">
        <p className="sm:hidden mb-2">
          <span className={STATUS_PILL}>{statusLabel(intl, order.status)}</span>
        </p>
        <OrderItems order={order} />
      </div>
    </details>
  );
}
