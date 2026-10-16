import { test } from "node:test";
import assert from "node:assert/strict";
import { amountReturned, orderDispute, orderTotals } from "./orders.ts";

const order = (total: number, metadata: Record<string, unknown>, created_at = new Date().toISOString()) => ({
  total,
  created_at,
  metadata,
});

test("a lost dispute comes off revenue, an open or won one doesn't", () => {
  const rows = [
    order(100, {}),
    order(50, { dispute: { id: "dp_1", stage: "lost", amount: 50 } }),
    order(40, { dispute: { id: "dp_2", stage: "open", amount: 40 } }),
    order(30, { dispute: { id: "dp_3", stage: "won", amount: 30 } }),
  ];
  assert.equal(orderTotals(rows).revenue30d, 170);
});

test("a refund and a lost dispute together never return more than the total", () => {
  assert.equal(amountReturned(order(80, { amount_refunded: 80, dispute: { id: "PP-1", stage: "lost", amount: 80 } })), 80);
  assert.equal(amountReturned(order(80, { amount_refunded: 20, dispute: { id: "PP-1", stage: "lost", amount: 30 } })), 50);
});

test("orderDispute reads metadata.dispute and ignores anything else", () => {
  assert.equal(orderDispute(order(10, {})), null);
  assert.equal(orderDispute(order(10, { dispute: "x" })), null);
  const dispute = orderDispute(order(10, { dispute: { id: "dp_9", stage: "open", amount: "10", reason: "fraudulent" } }));
  assert.equal(dispute?.stage, "open");
  assert.equal(dispute?.amount, 10);
  assert.equal(dispute?.reason, "fraudulent");
});
