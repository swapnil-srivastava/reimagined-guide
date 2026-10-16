import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faChevronRight, faEuroSign, faReceipt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../../components/AuthCheck";
import Metatags from "../../../components/Metatags";
import AdminGate, { ListSkeleton, NotAdmin } from "../../../components/admin/AdminGate";
import { Button, ChipGroup, Notice, Panel, inputClass } from "../../../components/booking/admin/ui";
import { supaClient } from "../../../supa-client";
import {
  ORDER_SELECT,
  OrderRow,
  STATUS_PILL,
  customerEmail,
  formatEuro,
  formatOrderDate,
  orderNumber,
  orderSearchText,
  orderTotals,
  orderTypeLabel,
  paymentMethodLabel,
  promoCode,
  statusLabel,
} from "../../../lib/orders";

// e.g. localhost:3000/admin/orders?status=refunded
// Every order (Stripe and PayPal) for admins, with totals, search and a status
// filter. Each order opens /admin/orders/[id].

const PAGE_SIZE = 30;

const m = defineMessages({
  title: { id: "admin-orders-page-title", description: "Admin orders page heading", defaultMessage: "Orders" },
  subtitle: {
    id: "admin-orders-subtitle",
    description: "Explains what the admin orders page lists",
    defaultMessage: "Shop and package orders paid by card or PayPal, newest first.",
  },
  back: { id: "admin-orders-back", description: "Link back to the admin page", defaultMessage: "Admin" },
  loadFailed: { id: "admin-orders-load-failed", description: "Admin orders: orders could not be loaded", defaultMessage: "Orders couldn't be loaded ({error})." },
  retry: { id: "admin-orders-retry", description: "Admin orders: try loading again", defaultMessage: "Try again" },
  revenue30d: { id: "admin-orders-revenue-30d", description: "Revenue in the last 30 days", defaultMessage: "Revenue, 30 days" },
  orders30d: { id: "admin-orders-count-30d", description: "Orders in the last 30 days", defaultMessage: "Orders, 30 days" },
  revenueTotal: { id: "admin-orders-revenue-total", description: "All-time revenue", defaultMessage: "Revenue, all time" },
  ordersTotal: { id: "admin-orders-count-total", description: "All-time order count", defaultMessage: "Orders, all time" },
  inclTax: { id: "admin-orders-incl-tax-refunds", description: "Revenue includes tax and delivery, minus refunds", defaultMessage: "Including tax and delivery, less refunds" },
  average: { id: "admin-orders-average", description: "Average order value in the last 30 days", defaultMessage: "{average} on average" },
  sinceStart: { id: "admin-orders-since-start", description: "Explains all-time count", defaultMessage: "Since the shop opened" },
  search: { id: "admin-orders-search", description: "Admin orders: search box label", defaultMessage: "Search by email, order number, product or promo code" },
  filter: { id: "admin-orders-filter", description: "Admin orders: label of the status chips", defaultMessage: "Status" },
  all: { id: "admin-orders-filter-all", description: "Admin orders filter: every order", defaultMessage: "All" },
  shown: {
    id: "admin-orders-shown",
    description: "Admin orders: how many orders match the search or filter",
    defaultMessage: "{count, plural, =0 {No orders match.} one {# order} other {# orders}}",
  },
  empty: { id: "admin-orders-empty", description: "No orders yet", defaultMessage: "No orders yet." },
  noEmail: { id: "admin-orders-no-email", description: "Order without a customer email", defaultMessage: "No email" },
  open: { id: "admin-orders-open", description: "Admin orders: screen reader label of an order link", defaultMessage: "Order {number}, {email}, {total}" },
  showMore: { id: "admin-orders-show-more", description: "Loads older orders", defaultMessage: "Show older orders" },
});

// Statuses an admin can filter by; "partially_refunded" is the saved value
const STATUSES = ["completed", "refunded", "partially_refunded", "disputed", "dispute_lost"] as const;
type StatusFilter = "all" | (typeof STATUSES)[number];

const AdminOrders: NextPage = () => {
  const intl = useIntl();
  return (
    <>
      <Metatags title={intl.formatMessage(m.title)} />
      <div className="booking-ui font-poppins [&_button]:font-poppins [&_input]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AuthCheck>
            <AdminGate loading={<ListSkeleton />} denied={<NotAdmin />}>
              <OrdersAdmin />
            </AdminGate>
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function Tile({ icon, label, value, detail }: { icon: IconDefinition; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 flex flex-col gap-1 min-w-0">
      <div className="flex items-start gap-2 text-sm leading-5 opacity-80">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-semibold tabular-nums break-words">{value}</div>
      <div className="text-xs opacity-80">{detail}</div>
    </div>
  );
}

function OrdersAdmin() {
  const intl = useIntl();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const status: StatusFilter = (STATUSES as readonly string[]).includes(String(router.query.status))
    ? (router.query.status as StatusFilter)
    : "all";
  const setStatus = (next: StatusFilter) => {
    setLimit(PAGE_SIZE);
    router.replace({ pathname: router.pathname, query: next === "all" ? {} : { status: next } }, undefined, { shallow: true, scroll: false });
  };

  const load = async () => {
    setLoadError(null);
    // Every order at once: a few hundred rows, so totals, search and the
    // filter all work on the same list
    const { data, error } = await supaClient.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
    if (error) {
      console.error("Loading orders failed", error);
      setLoadError(error.message);
      return;
    }
    setOrders((data ?? []) as unknown as OrderRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => orderTotals(orders ?? []), [orders]);
  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const order of orders ?? []) byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    return byStatus;
  }, [orders]);

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (orders ?? []).filter((o) => (status === "all" || o.status === status) && (!needle || orderSearchText(o).includes(needle)));
  }, [orders, query, status]);

  const filtered = status !== "all" || query.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
          {intl.formatMessage(m.back)}
        </Link>
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title)}</h1>
            <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.subtitle)}</p>
          </div>
        </div>
      </header>

      {loadError ? (
        <Panel>
          <div className="flex flex-col gap-3 items-start">
            <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error: loadError })}</Notice>
            <Button onClick={load}>{intl.formatMessage(m.retry)}</Button>
          </div>
        </Panel>
      ) : orders === null ? (
        <ListSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile icon={faEuroSign} label={intl.formatMessage(m.revenue30d)} value={formatEuro(intl, totals.revenue30d)} detail={intl.formatMessage(m.inclTax)} />
            <Tile
              icon={faShoppingCart}
              label={intl.formatMessage(m.orders30d)}
              value={intl.formatNumber(totals.orders30d)}
              detail={intl.formatMessage(m.average, { average: totals.orders30d ? formatEuro(intl, totals.revenue30d / totals.orders30d) : "–" })}
            />
            <Tile icon={faEuroSign} label={intl.formatMessage(m.revenueTotal)} value={formatEuro(intl, totals.revenueTotal)} detail={intl.formatMessage(m.inclTax)} />
            <Tile icon={faReceipt} label={intl.formatMessage(m.ordersTotal)} value={intl.formatNumber(totals.ordersTotal)} detail={intl.formatMessage(m.sinceStart)} />
          </div>

          {orders.length === 0 ? (
            <Panel>
              <p className="text-sm">{intl.formatMessage(m.empty)}</p>
            </Panel>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  {intl.formatMessage(m.search)}
                  <input
                    type="search"
                    className={inputClass}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLimit(PAGE_SIZE);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
                <ChipGroup<StatusFilter>
                  label={intl.formatMessage(m.filter)}
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: `${intl.formatMessage(m.all)} (${orders.length})` },
                    ...STATUSES.filter((s) => counts[s]).map((s) => ({ value: s, label: `${statusLabel(intl, s)} (${counts[s]})` })),
                  ]}
                />
              </div>

              <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
                {filtered ? intl.formatMessage(m.shown, { count: shown.length }) : ""}
              </p>

              {shown.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {shown.slice(0, limit).map((order) => (
                    <li key={order.id}>
                      <OrderLink order={order} />
                    </li>
                  ))}
                </ul>
              )}

              {shown.length > limit && (
                <div className="flex justify-center">
                  <Button onClick={() => setLimit((n) => n + PAGE_SIZE)}>{intl.formatMessage(m.showMore)}</Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function OrderLink({ order }: { order: OrderRow }) {
  const intl = useIntl();
  const email = customerEmail(order);
  const code = promoCode(order);
  const total = formatEuro(intl, order.total);

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      aria-label={intl.formatMessage(m.open, { number: orderNumber(order), email: email ?? intl.formatMessage(m.noEmail), total })}
      className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] px-4 py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_auto_auto] items-center gap-x-4 gap-y-1 hover:bg-[var(--surface-inset)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
    >
      <span className="text-sm tabular-nums">{formatOrderDate(intl, order.created_at)}</span>
      <span className="row-start-2 col-span-2 sm:row-start-auto sm:col-span-1 min-w-0 text-sm">
        <span className="block truncate font-medium">{email ?? intl.formatMessage(m.noEmail)}</span>
        <span className="block text-xs opacity-80">
          {orderNumber(order)} · {orderTypeLabel(intl, order.order_type)} · {paymentMethodLabel(intl, order.payment_method)}
          {code && ` · ${code}`}
        </span>
      </span>
      <span className={`hidden sm:inline-flex ${STATUS_PILL}`}>{statusLabel(intl, order.status)}</span>
      <span className="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto flex items-center gap-3 justify-end">
        <span className="sm:hidden">
          <span className={STATUS_PILL}>{statusLabel(intl, order.status)}</span>
        </span>
        <span className="font-semibold tabular-nums">{total}</span>
        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 opacity-70" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default AdminOrders;
