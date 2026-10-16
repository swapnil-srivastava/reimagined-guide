import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowUpRightFromSquare, faReceipt } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../../components/AuthCheck";
import Metatags from "../../../components/Metatags";
import OrderItems from "../../../components/OrderItems";
import AdminGate, { ListSkeleton, NotAdmin } from "../../../components/admin/AdminGate";
import { Panel } from "../../../components/booking/admin/ui";
import { supaClient } from "../../../supa-client";
import { dayLabel, inZone, timeLabel } from "../../../lib/booking/format";
import {
  ORDER_SELECT,
  OrderRow,
  STATUS_PILL,
  amountRefunded,
  customerEmail,
  discountAmount,
  formatEuro,
  metaString,
  orderNumber,
  orderTypeLabel,
  paymentMethodLabel,
  promoCode,
  statusLabel,
  stripePaymentUrl,
} from "../../../lib/orders";

// e.g. localhost:3000/admin/orders/5a99b58d-...
// One order for admins: items, customer, payment, promo code, refund, stock
// put back and the 1:1 calls booked with it.

const m = defineMessages({
  title: { id: "admin-order-title", description: "Admin order page heading", defaultMessage: "Order {number}" },
  back: { id: "admin-order-back", description: "Link back to the orders list", defaultMessage: "Orders" },
  notFound: { id: "admin-order-not-found", description: "Admin order: no order with this id", defaultMessage: "This order doesn't exist." },
  loadFailed: { id: "admin-order-load-failed", description: "Admin order: the order could not be loaded", defaultMessage: "The order couldn't be loaded ({error})." },
  items: { id: "admin-order-items", description: "Admin order: heading of the items section", defaultMessage: "Items" },
  details: { id: "admin-order-details", description: "Admin order: heading of the details section", defaultMessage: "Details" },
  date: { id: "admin-order-date", description: "Admin order: when it was paid", defaultMessage: "Paid on" },
  customer: { id: "admin-order-customer", description: "Admin order: customer email", defaultMessage: "Customer" },
  account: { id: "admin-order-account", description: "Admin order: whether the buyer had an account", defaultMessage: "Account" },
  guest: { id: "admin-order-guest", description: "Admin order: bought without an account", defaultMessage: "Guest checkout" },
  signedIn: { id: "admin-order-signed-in", description: "Admin order: bought while signed in", defaultMessage: "Signed in" },
  type: { id: "admin-order-type", description: "Admin order: products or package", defaultMessage: "Type" },
  method: { id: "admin-order-method", description: "Admin order: payment method", defaultMessage: "Paid by" },
  promo: { id: "admin-order-promo", description: "Admin order: promo code and its discount", defaultMessage: "Promo code" },
  reference: { id: "admin-order-reference", description: "Admin order: payment id at Stripe or PayPal", defaultMessage: "Payment reference" },
  openStripe: { id: "admin-order-open-stripe", description: "Admin order: open the payment in Stripe", defaultMessage: "Open in Stripe" },
  refund: { id: "admin-order-refund", description: "Admin order: heading of the refund section", defaultMessage: "Refund" },
  refunded: { id: "admin-order-refunded", description: "Admin order: amount refunded and when", defaultMessage: "{amount} refunded on {date}" },
  restocked: { id: "admin-order-restocked", description: "Admin order: stock put back by the refund", defaultMessage: "Put back into stock" },
  notRestocked: {
    id: "admin-order-not-restocked",
    description: "Admin order: a partial refund doesn't change stock",
    defaultMessage: "Stock wasn't changed, because Stripe doesn't say which items a partial refund covers.",
  },
  calls: { id: "admin-order-calls", description: "Admin order: heading of the booked calls section", defaultMessage: "Calls" },
  callStatus: { id: "admin-order-call-status", description: "Admin order: a booked call's status", defaultMessage: "{status, select, confirmed {Booked} cancelled {Cancelled} other {{status}}}" },
  cancelledBy: {
    id: "admin-order-call-cancelled-by",
    description: "Admin order: who cancelled the call",
    defaultMessage: "{by, select, refund {by the refund} host {by you} invitee {by the buyer} other {}}",
  },
});

interface CallRow {
  id: string;
  starts_at: string;
  status: string;
  cancelled_by: string | null;
}

interface Restocked {
  name: string;
  quantity: number;
}

const AdminOrder: NextPage = () => {
  const intl = useIntl();
  return (
    <>
      <Metatags title={intl.formatMessage(m.back)} />
      <div className="booking-ui font-poppins [&_button]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AuthCheck>
            <AdminGate loading={<ListSkeleton />} denied={<NotAdmin />}>
              <OrderDetail />
            </AdminGate>
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function OrderDetail() {
  const intl = useIntl();
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const [order, setOrder] = useState<OrderRow | null | undefined>(undefined);
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [zone, setZone] = useState("Europe/Berlin");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // Not a uuid: no such order, and PostgREST would reject the filter
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      setOrder(null);
      return;
    }
    Promise.all([
      supaClient.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle(),
      supaClient.from("bookings").select("id, starts_at, status, cancelled_by").eq("order_id", id).order("starts_at"),
      supaClient.from("booking_hosts").select("timezone").eq("is_default", true).maybeSingle(),
    ]).then(([orderResult, callsResult, hostResult]) => {
      if (orderResult.error) {
        console.error("Loading the order failed", orderResult.error);
        setLoadError(orderResult.error.message);
        return;
      }
      setOrder((orderResult.data as unknown as OrderRow) ?? null);
      setCalls((callsResult.data as CallRow[] | null) ?? []);
      if (hostResult.data?.timezone) setZone(hostResult.data.timezone);
    });
  }, [id]);

  const back = (
    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
      <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
      {intl.formatMessage(m.back)}
    </Link>
  );

  if (loadError) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <Panel>
          <p role="alert" className="text-sm">
            {intl.formatMessage(m.loadFailed, { error: loadError })}
          </p>
        </Panel>
      </div>
    );
  }
  if (order === undefined) return <ListSkeleton />;
  if (order === null) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <Panel>
          <p className="text-sm">{intl.formatMessage(m.notFound)}</p>
        </Panel>
      </div>
    );
  }

  const number = orderNumber(order);
  const refunded = amountRefunded(order);
  const refundedAt = metaString(order, "refunded_at");
  const restocked = (Array.isArray(order.metadata?.restocked) ? order.metadata?.restocked : []) as Restocked[];
  const code = promoCode(order);
  const discount = discountAmount(order);
  const stripeUrl = stripePaymentUrl(order.payment_intent_id);
  const reference = order.payment_intent_id ?? metaString(order, "paypal_order_id");
  const paidAt = order.created_at
    ? intl.formatDate(order.created_at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "–";

  const rows: [string, React.ReactNode][] = [
    [intl.formatMessage(m.date), paidAt],
    [intl.formatMessage(m.customer), customerEmail(order) ?? "–"],
    [intl.formatMessage(m.account), intl.formatMessage(order.user_id && order.metadata?.is_anonymous !== true ? m.signedIn : m.guest)],
    [intl.formatMessage(m.type), orderTypeLabel(intl, order.order_type)],
    [intl.formatMessage(m.method), paymentMethodLabel(intl, order.payment_method)],
  ];
  if (discount > 0) rows.push([intl.formatMessage(m.promo), `${code ?? "–"} (−${formatEuro(intl, discount)})`]);
  if (reference) {
    rows.push([
      intl.formatMessage(m.reference),
      <span key="ref" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="break-all font-mono text-xs">{reference}</span>
        {stripeUrl && (
          <a href={stripeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
            {intl.formatMessage(m.openStripe)}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </span>,
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        {back}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title, { number })}</h1>
              <p className="text-2xl font-semibold tabular-nums">{formatEuro(intl, order.total)}</p>
            </div>
          </div>
          <span className={STATUS_PILL}>{statusLabel(intl, order.status)}</span>
        </div>
      </header>

      <Panel title={intl.formatMessage(m.items)}>
        <OrderItems order={order} />
      </Panel>

      <Panel title={intl.formatMessage(m.details)}>
        <dl className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-4 gap-y-1 sm:gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt className="text-[var(--text-muted)] mt-2 sm:mt-0">{label}</dt>
              <dd className="min-w-0 break-words">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Panel>

      {refunded > 0 && (
        <Panel title={intl.formatMessage(m.refund)}>
          <div className="flex flex-col gap-2 text-sm">
            <p>
              {intl.formatMessage(m.refunded, {
                amount: formatEuro(intl, refunded),
                date: refundedAt ? intl.formatDate(refundedAt, { day: "numeric", month: "short", year: "numeric" }) : "–",
              })}
            </p>
            {restocked.length > 0 ? (
              <p>
                {intl.formatMessage(m.restocked)}: {restocked.map((r) => `${r.name} +${r.quantity}`).join(", ")}
              </p>
            ) : order.status === "partially_refunded" ? (
              <p className="text-[var(--text-muted)]">{intl.formatMessage(m.notRestocked)}</p>
            ) : null}
          </div>
        </Panel>
      )}

      {calls.length > 0 && (
        <Panel title={intl.formatMessage(m.calls)}>
          <ul className="flex flex-col gap-2 text-sm">
            {calls.map((call) => {
              const when = inZone(call.starts_at, zone, intl.locale);
              return (
                <li key={call.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="tabular-nums">
                    {dayLabel(when)} {timeLabel(when)}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {intl.formatMessage(m.callStatus, { status: call.status })}
                    {call.status === "cancelled" && call.cancelled_by ? ` ${intl.formatMessage(m.cancelledBy, { by: call.cancelled_by })}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}

export default AdminOrder;
