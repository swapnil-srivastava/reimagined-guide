// Run with: pnpm test:products  (Node's built-in test runner, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import { PromoError, promoDiscount, type Promo } from "./promo.ts";

const promo = (fields: Partial<Promo>): Promo => ({ id: "promo_1", code: "TEST", percentOff: null, amountOff: null, minimumAmount: null, ...fields });

test("a percentage rounds to the cent like Stripe", () => {
  // The TEST10 order: €168 + €31.92 tax
  assert.equal(promoDiscount(promo({ percentOff: 10 }), 199.92), 19.99);
  assert.equal(promoDiscount(promo({ percentOff: 10 }), 124), 12.4);
  assert.equal(promoDiscount(promo({ percentOff: 100 }), 50), 50);
});

test("a fixed amount never goes below zero", () => {
  assert.equal(promoDiscount(promo({ amountOff: 5 }), 20), 5);
  assert.equal(promoDiscount(promo({ amountOff: 50 }), 20), 20);
});

test("an order below the minimum is refused", () => {
  assert.throws(() => promoDiscount(promo({ percentOff: 10, minimumAmount: 100 }), 99.99), PromoError);
  assert.equal(promoDiscount(promo({ percentOff: 10, minimumAmount: 100 }), 100), 10);
});
