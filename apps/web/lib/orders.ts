import type { IntlShape } from "react-intl";

// Orders are saved by pages/api/webhook.ts (Stripe) and
// pages/api/paypal-capture.ts. Customers can read their own orders; admins
// (app_admins) can read all of them (migration 20261011090000).

export const ORDER_SELECT =
  "id, created_at, status, total, payment_method, order_type, metadata, user_id, " +
  "order_items(id, name, quantity, price, product_id, products(name))";

export interface OrderItemRow {
  id: string;
  name: string | null;
  quantity: number;
  price: number;
  product_id: string | null;
  products: { name: string } | null;
}

export interface OrderRow {
  id: string;
  created_at: string | null;
  status: string;
  total: number;
  payment_method: string | null;
  order_type: string | null;
  metadata: Record<string, unknown> | null;
  user_id: string | null;
  order_items: OrderItemRow[];
}

const metaString = (order: OrderRow, key: string): string | null => {
  const value = order.metadata?.[key];
  return typeof value === "string" && value.trim() ? value : null;
};

const metaAmount = (order: Pick<OrderRow, "metadata">, key: string): number => {
  const value = Number(order.metadata?.[key]);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export const customerEmail = (order: OrderRow) => metaString(order, "customer_email");

/** Promo code discount taken off at Stripe checkout, saved by the webhook */
export const discountAmount = (order: OrderRow) => metaAmount(order, "discount");
export const promoCode = (order: OrderRow) => metaString(order, "promo_code");

/** Refunded so far, saved by the webhook on charge.refunded */
export const amountRefunded = (order: Pick<OrderRow, "metadata">) => metaAmount(order, "amount_refunded");

/** Short order number customers can quote, e.g. "3F2A9C1B" */
export const orderNumber = (order: OrderRow) => order.id.slice(0, 8).toUpperCase();

/** Product lines first, then tax and delivery, each group in saved order */
export function sortedItems(order: OrderRow): OrderItemRow[] {
  const products = order.order_items.filter((item) => item.product_id);
  const others = order.order_items.filter((item) => !item.product_id);
  return [...products, ...others];
}

/**
 * The item's name as saved at checkout. Items saved before names were stored
 * fall back to the product's current name, or the package name for service
 * packages; tax and delivery rows from that time have no name at all.
 */
export function itemName(order: OrderRow, item: OrderItemRow, intl: IntlShape): string {
  if (item.name) return item.name;
  if (item.products?.name) return item.products.name;
  if (order.order_type === "service_package") {
    return (
      metaString(order, "package_name") ??
      intl.formatMessage({ id: "orders-item-package", description: "Unnamed service package in an order", defaultMessage: "Service package" })
    );
  }
  return intl.formatMessage({ id: "orders-item-unnamed", description: "Order line saved without a name", defaultMessage: "Item" });
}

export const formatEuro = (intl: IntlShape, amount: number) =>
  intl.formatNumber(Number(amount) || 0, { style: "currency", currency: "EUR" });

export const formatOrderDate = (intl: IntlShape, value: string | null) =>
  value ? intl.formatDate(value, { day: "numeric", month: "short", year: "numeric" }) : "–";

export function paymentMethodLabel(intl: IntlShape, method: string | null): string {
  switch (method) {
    case "stripe":
      return intl.formatMessage({ id: "orders-method-card", description: "Paid by card through Stripe", defaultMessage: "Card" });
    case "paypal":
      return "PayPal";
    default:
      return "–";
  }
}

export function orderTypeLabel(intl: IntlShape, type: string | null): string {
  return type === "service_package"
    ? intl.formatMessage({ id: "orders-type-package", description: "Order for a service package", defaultMessage: "Package" })
    : intl.formatMessage({ id: "orders-type-cart", description: "Order of shop products", defaultMessage: "Products" });
}

export function statusLabel(intl: IntlShape, status: string): string {
  switch (status) {
    case "completed":
      return intl.formatMessage({ id: "orders-status-paid", description: "Order status: payment received", defaultMessage: "Paid" });
    case "pending":
      return intl.formatMessage({ id: "orders-status-pending", description: "Order status: waiting for payment", defaultMessage: "Pending" });
    case "refunded":
      return intl.formatMessage({ id: "orders-status-refunded", description: "Order status: refunded", defaultMessage: "Refunded" });
    case "partially_refunded":
      return intl.formatMessage({ id: "orders-status-partly-refunded", description: "Order status: part of the payment was refunded", defaultMessage: "Partly refunded" });
    case "cancelled":
    case "canceled":
      return intl.formatMessage({ id: "orders-status-cancelled", description: "Order status: cancelled", defaultMessage: "Cancelled" });
    default:
      return status;
  }
}

/** Tailwind classes for the status pill, from theme colours only */
export const STATUS_PILL =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[var(--text-primary)] border border-[var(--border-subtle)]";
