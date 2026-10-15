// Checks for the admin products page (/admin/products). The database has the
// same rules (migration 20261015170000), so these are for friendly messages.

export const MAX_PRICE = 100_000;
export const MAX_STOCK = 1_000_000;
export const MAX_NAME = 120;
export const MAX_DESCRIPTION = 2_000;
export const DEFAULT_LOW_STOCK = 3;

export type FieldError = "required" | "too_long" | "format" | "too_low" | "too_high";

export interface ProductDraft {
  name: string;
  description: string;
  /** As typed, e.g. "19,90" */
  price: string;
  stock: string;
  lowStock: string;
}

export interface ProductChanges {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
}

/** A euro amount with up to 2 decimals, "." or "," as the separator */
export function parsePrice(raw: string): number | FieldError {
  const value = raw.trim().replace(/\s/g, "");
  if (!value) return "required";
  if (!/^\d{1,6}([.,]\d{1,2})?$/.test(value)) return "format";
  const price = Number(value.replace(",", "."));
  if (price <= 0) return "too_low";
  if (price > MAX_PRICE) return "too_high";
  return price;
}

/** A whole number from 0 to MAX_STOCK */
export function parseCount(raw: string): number | FieldError {
  const value = raw.trim();
  if (!value) return "required";
  if (!/^\d{1,7}$/.test(value)) return "format";
  const count = Number(value);
  if (count > MAX_STOCK) return "too_high";
  return count;
}

/** The checked values, or an error per field */
export function validateDraft(
  draft: ProductDraft
): { ok: true; changes: ProductChanges } | { ok: false; errors: Partial<Record<keyof ProductDraft, FieldError>> } {
  const errors: Partial<Record<keyof ProductDraft, FieldError>> = {};
  const name = draft.name.trim();
  const description = draft.description.trim();
  if (!name) errors.name = "required";
  else if (name.length > MAX_NAME) errors.name = "too_long";
  if (description.length > MAX_DESCRIPTION) errors.description = "too_long";
  const price = parsePrice(draft.price);
  if (typeof price === "string") errors.price = price;
  const stock = parseCount(draft.stock);
  if (typeof stock === "string") errors.stock = stock;
  const lowStock = parseCount(draft.lowStock);
  if (typeof lowStock === "string") errors.lowStock = lowStock;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    changes: {
      name,
      description: description || null,
      price: price as number,
      stock: stock as number,
      low_stock_threshold: lowStock as number,
    },
  };
}

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(stock: number, threshold: number): StockLevel {
  if (stock <= 0) return "out";
  return stock <= threshold ? "low" : "ok";
}
