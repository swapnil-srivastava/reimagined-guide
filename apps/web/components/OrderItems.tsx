import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { OrderRow, amountRefunded, discountAmount, formatEuro, itemName, promoCode, sortedItems } from "../lib/orders";

/** An order's lines (name, quantity, line total) and its total */
export default function OrderItems({ order }: { order: OrderRow }) {
  const intl = useIntl();
  const items = sortedItems(order);
  const discount = discountAmount(order);
  const code = promoCode(order);
  const refunded = amountRefunded(order);

  return (
    <div className="text-sm">
      {items.length === 0 ? (
        <p className="opacity-80">
          <FormattedMessage id="orders-no-items" description="Order saved without any lines" defaultMessage="No items were saved for this order." />
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-2">
              <span className="min-w-0 break-words">
                {itemName(order, item, intl)}
                {item.quantity > 1 && <span className="opacity-80"> × {item.quantity}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{formatEuro(intl, item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      {discount > 0 && (
        <div className="flex items-baseline justify-between gap-4 py-2 border-t border-[var(--border-subtle)]">
          <span className="min-w-0 break-words">
            {code ? (
              <FormattedMessage id="orders-discount-code" description="Order line: promo code discount, with the code" defaultMessage="Discount ({code})" values={{ code }} />
            ) : (
              <FormattedMessage id="orders-discount" description="Order line: promo code discount" defaultMessage="Discount" />
            )}
          </span>
          <span className="shrink-0 tabular-nums">−{formatEuro(intl, discount)}</span>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4 pt-2 mt-1 border-t border-[var(--border-subtle)] font-semibold">
        <FormattedMessage id="orders-total" description="Order total label" defaultMessage="Total" />
        <span className="tabular-nums">{formatEuro(intl, order.total)}</span>
      </div>
      {refunded > 0 && (
        <div className="flex items-baseline justify-between gap-4 pt-1">
          <FormattedMessage id="orders-refunded" description="Order line: amount refunded to the customer" defaultMessage="Refunded" />
          <span className="tabular-nums">{formatEuro(intl, refunded)}</span>
        </div>
      )}
    </div>
  );
}
