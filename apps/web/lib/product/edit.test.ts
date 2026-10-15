// Run with: pnpm test:products  (Node's built-in test runner, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCount, parsePrice, stockLevel, validateDraft } from "./edit.ts";

test("prices take a dot or a comma and up to 2 decimals", () => {
  assert.equal(parsePrice("19"), 19);
  assert.equal(parsePrice("19.9"), 19.9);
  assert.equal(parsePrice("19,90"), 19.9);
  assert.equal(parsePrice(" 1 299,00 "), 1299);
  assert.equal(parsePrice("19.999"), "format");
  assert.equal(parsePrice("-5"), "format");
  assert.equal(parsePrice("abc"), "format");
  assert.equal(parsePrice("1e3"), "format");
  assert.equal(parsePrice(""), "required");
  assert.equal(parsePrice("0"), "too_low");
  assert.equal(parsePrice("0,00"), "too_low");
  assert.equal(parsePrice("100000"), 100000);
  assert.equal(parsePrice("100000.01"), "too_high");
});

test("counts are whole numbers from 0", () => {
  assert.equal(parseCount("0"), 0);
  assert.equal(parseCount("42"), 42);
  assert.equal(parseCount("1000000"), 1000000);
  assert.equal(parseCount("1000001"), "too_high");
  assert.equal(parseCount("2.5"), "format");
  assert.equal(parseCount("-1"), "format");
  assert.equal(parseCount(" "), "required");
});

test("a draft is trimmed and checked field by field", () => {
  const ok = validateDraft({ name: "  Mug ", description: "  ", price: "19,5", stock: "4", lowStock: "3" });
  assert.deepEqual(ok, {
    ok: true,
    changes: { name: "Mug", description: null, price: 19.5, stock: 4, low_stock_threshold: 3 },
  });
  const bad = validateDraft({ name: "", description: "x".repeat(2001), price: "0", stock: "x", lowStock: "" });
  assert.deepEqual(bad, {
    ok: false,
    errors: { name: "required", description: "too_long", price: "too_low", stock: "format", lowStock: "required" },
  });
});

test("stock level: sold out, low at or below the threshold, else ok", () => {
  assert.equal(stockLevel(0, 3), "out");
  assert.equal(stockLevel(3, 3), "low");
  assert.equal(stockLevel(4, 3), "ok");
  assert.equal(stockLevel(1, 0), "ok");
});
