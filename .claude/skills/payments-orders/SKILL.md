---
name: payments-orders
description: Use when touching checkout, Stripe or PayPal, webhooks, orders, refunds, disputes, promo codes, stock or paid booking links on swapnilsrivastava.eu. Lists the existing flows and invariants so changes don't double-charge, double-restock or trust client prices.
---

# Payments and orders

Both providers run in test mode (Stripe Sandbox, `PAYPAL_MODE=sandbox`). Switching to
live keys is a deferred go-live task; don't do it unasked.

## Where things are (apps/web)

| Flow | Code |
|---|---|
| Server-side pricing of a cart or service package | `lib/server/pricing.ts` (`priceCart`, `SERVICE_PACKAGES`) |
| Stripe Checkout session | `pages/api/checkout.ts` |
| Stripe webhook (orders, refunds, disputes, booking link) | `pages/api/webhook.ts` |
| PayPal create / capture / webhook | `pages/api/paypal-checkout.ts`, `paypal-capture.ts`, `paypal-webhook.ts`, `lib/server/paypal.ts` |
| Save order items + lower stock (one RPC) | `lib/server/stock.ts` → `save_order_items` |
| Refunds (full: Refunded + restock once + cancel upcoming calls) | `lib/server/refunds.ts` |
| Disputes (Stripe + PayPal) | `lib/server/disputes.ts` |
| Promo codes (validated against Stripe promotion codes) | `lib/server/promo.ts`, `pages/api/promo-code.ts`, `components/PromoCodeField.tsx` |
| Orders UI | `pages/orders.tsx`, `pages/admin/orders/`, `components/AdminOrdersCard.tsx` |
| Paid 1:1 call → booking link | `lib/server/booking.ts` (`createBookingLink`) |

## Invariants

- **Never trust a client price.** The client sends ids and quantities; the server prices.
- **Webhooks are idempotent.** `orders.payment_intent_id` is unique; a retry must not
  create a second order, restock twice or send emails twice. On a partial failure
  (items not saved) delete the incomplete order and return 500 so Stripe retries.
- **Verify every webhook** (Stripe signature with `STRIPE_WEBHOOK_SECRET`, PayPal via
  `PAYPAL_WEBHOOK_ID` verification) before reading the body.
- Events can arrive out of order (the 0259 test card sends the dispute before the
  order exists): retry or park, don't drop.
- Stock changes happen only in database functions, never read-modify-write in JS.
- Emails go through `sendMail()` and never make the webhook fail.
- Swapnil declined server-side re-pricing on PayPal capture; don't re-propose it.
- Tax/delivery are saved as order item rows without a product; that is known and fine.

## Testing

- Unit: `pnpm test:products` (pricing, promo, orders), `pnpm test:booking`.
- End to end in test mode: Stripe test card `4242 4242 4242 4242`; promo code
  `TEST10` (10% off, expires 2026-11-15; create a new one if expired). If the
  Stripe MCP is connected it is the Sandbox account; reading is fine, but ask before
  creating or refunding anything there.
- For webhook changes, say which Stripe/PayPal event types must be ticked on the
  endpoint and check them with Swapnil.
