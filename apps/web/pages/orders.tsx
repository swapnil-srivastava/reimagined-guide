import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { FormattedMessage, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faReceipt } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../components/AuthCheck";
import Metatags from "../components/Metatags";
import OrderItems from "../components/OrderItems";
import { supaClient } from "../supa-client";
import { useAnonymousAuth } from "../lib/use-anonymous-auth";
import {
  ORDER_SELECT,
  OrderRow,
  STATUS_PILL,
  formatEuro,
  formatOrderDate,
  orderNumber,
  orderTypeLabel,
  paymentMethodLabel,
  statusLabel,
} from "../lib/orders";

// e.g. localhost:3000/orders
// The signed-in customer's orders, newest first. Guests who checked out with
// an anonymous session see theirs too while that session lasts.

const MyOrders: NextPage = () => {
  const intl = useIntl();
  const { user, isLoading: authLoading } = useAnonymousAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setFailed(false);
    // Filtered by user as well as RLS, since admins can read everyone's orders
    supaClient
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Loading orders failed", error);
          setFailed(true);
          setOrders([]);
        } else {
          setOrders((data ?? []) as unknown as OrderRow[]);
        }
      });
  }, [user?.id]);

  const title = intl.formatMessage({ id: "orders-page-title", description: "My orders page heading", defaultMessage: "My orders" });

  return (
    <>
      <Metatags title={title} />
      <div className="font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <AuthCheck>
            {authLoading || (user?.id && orders === null) ? (
              <OrdersSkeleton />
            ) : failed ? (
              <p role="alert" className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-6">
                <FormattedMessage
                  id="orders-load-failed"
                  description="Shown when the orders could not be loaded"
                  defaultMessage="Your orders couldn't be loaded. Please refresh the page to try again."
                />
              </p>
            ) : !orders || orders.length === 0 ? (
              <EmptyOrders />
            ) : (
              <ul className="flex flex-col gap-4">
                {orders.map((order) => (
                  <li key={order.id}>
                    <OrderCard order={order} />
                  </li>
                ))}
              </ul>
            )}
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function OrderCard({ order }: { order: OrderRow }) {
  const intl = useIntl();
  return (
    <article
      className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-md p-5"
      aria-label={intl.formatMessage(
        { id: "orders-card-label", description: "Screen reader label for one order", defaultMessage: "Order {number}" },
        { number: orderNumber(order) }
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-3">
        <div>
          <p className="font-semibold">{formatOrderDate(intl, order.created_at)}</p>
          <p className="text-xs opacity-80">
            <FormattedMessage
              id="orders-card-meta"
              description="Order number, type and payment method"
              defaultMessage="Order {number} · {type} · {method}"
              values={{
                number: orderNumber(order),
                type: orderTypeLabel(intl, order.order_type),
                method: paymentMethodLabel(intl, order.payment_method),
              }}
            />
          </p>
        </div>
        <span className={STATUS_PILL}>{statusLabel(intl, order.status)}</span>
      </header>
      <OrderItems order={order} />
    </article>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-8 text-center flex flex-col items-center gap-3">
      <FontAwesomeIcon icon={faBagShopping} className="w-8 h-8 opacity-70" aria-hidden="true" />
      <p className="text-lg font-semibold">
        <FormattedMessage id="orders-empty-title" description="No orders yet heading" defaultMessage="No orders yet" />
      </p>
      <p className="text-sm opacity-80">
        <FormattedMessage
          id="orders-empty-body"
          description="No orders yet explanation"
          defaultMessage="Things you buy here will show up on this page."
        />
      </p>
      <Link
        href="/products"
        className="mt-2 px-4 py-2 rounded-lg font-medium bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      >
        <FormattedMessage id="orders-empty-browse" description="Link to the products page" defaultMessage="Browse products" />
      </Link>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-5 animate-pulse">
          <div className="h-4 w-32 rounded bg-[var(--surface-inset)] mb-2" />
          <div className="h-3 w-48 rounded bg-[var(--surface-inset)] mb-5" />
          <div className="h-3 w-full rounded bg-[var(--surface-inset)] mb-2" />
          <div className="h-3 w-2/3 rounded bg-[var(--surface-inset)]" />
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
