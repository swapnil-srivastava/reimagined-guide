import { supaServerClient } from "../../supa-server-client";
import { ADMIN_EMAIL, SITE_URL, escapeHtml, sendMail } from "./mailer";
import { emailLayout, paragraph } from "./emailLayout";
import type { Json } from "../../database.types";

/** One order_items row; product_id is null for tax and delivery */
export interface OrderItemInput {
  product_id: string | null;
  quantity: number;
  price: number;
  /** What the customer saw at checkout, e.g. the product name, "Delivery" */
  name: string;
}

/** A product that sold out between checkout and payment */
export interface StockShortfall {
  product_id: string;
  name: string;
  ordered: number;
  in_stock: number;
}

/** A product this order took to or below its low-stock threshold */
export interface LowStock {
  product_id: string;
  name: string;
  stock: number;
  threshold: number;
}

export interface SavedOrderItems {
  /** Products that had less stock than was ordered; their stock is now 0 */
  shortfalls: StockShortfall[];
  /** Products that just went low on stock (see sendLowStockEmail) */
  lowStock: LowStock[];
}

/**
 * Saves a paid order's items and lowers stock for its products in one
 * transaction (save_order_items in the database). Throws if nothing was saved.
 */
export async function saveOrderItems(
  orderId: string,
  items: OrderItemInput[]
): Promise<SavedOrderItems> {
  if (!supaServerClient) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const { data, error } = await supaServerClient.rpc("save_order_items", {
    p_order_id: orderId,
    p_items: items as unknown as Json,
  });

  if (error) throw new Error(`Error saving order items: ${error.message}`);

  const result = data as { shortfalls?: StockShortfall[]; low_stock?: LowStock[] } | null;
  return {
    shortfalls: Array.isArray(result?.shortfalls) ? result.shortfalls : [],
    // Missing before migration 20261015170000
    lowStock: Array.isArray(result?.low_stock) ? result.low_stock : [],
  };
}

/**
 * Emails the admin about products a sale just took to or below their
 * low-stock threshold. save_order_items only reports the crossing, so this
 * goes out once per product until it is restocked. Never throws.
 */
export async function sendLowStockEmail(lowStock: LowStock[]): Promise<void> {
  if (lowStock.length === 0) return;
  const lines = lowStock.map((p) => (p.stock === 0 ? `${p.name}: sold out` : `${p.name}: ${p.stock} left`));
  const subject =
    lowStock.length === 1
      ? lowStock[0].stock === 0
        ? `Sold out: ${lowStock[0].name}`
        : `Low stock: ${lowStock[0].name} has ${lowStock[0].stock} left`
      : lowStock.every((p) => p.stock === 0)
        ? `Sold out: ${lowStock.length} products`
        : `Low stock: ${lowStock.length} products`;
  const url = `${SITE_URL}/admin/products?filter=low`;
  const html = emailLayout({
    preheader: lines.join(", "),
    title: lowStock.every((p) => p.stock === 0) ? "Sold out" : "Low stock",
    bodyHtml:
      paragraph("A sale just took these products to their low-stock level or below:") +
      paragraph(lines.map((line) => `<strong>${escapeHtml(line)}</strong>`).join("<br>")) +
      paragraph("Restock them on the products page, or change the level there if this is too early."),
    button: { label: "Open products", href: url },
  });
  const text = `A sale just took these products to their low-stock level or below:\n${lines.join("\n")}\n\nRestock them, or change the level if this is too early: ${url}`;
  try {
    await sendMail(ADMIN_EMAIL, subject, html, text);
  } catch (error) {
    console.error("Low stock email failed", error);
  }
}

/** One line per oversold product */
function describeShortfalls(shortfalls: StockShortfall[]): string[] {
  return shortfalls.map(
    (s) => `${s.name}: ordered ${s.ordered}, only ${s.in_stock} were in stock`
  );
}

const OVERSOLD_NOTE =
  "This order was paid for more than was in stock. Stock is now 0; please contact the customer.";

/** Plain-text oversold note for the admin email, or "" when nothing oversold */
export function shortfallWarningText(shortfalls: StockShortfall[]): string {
  if (shortfalls.length === 0) return "";
  return `OVERSOLD: ${OVERSOLD_NOTE}\n${describeShortfalls(shortfalls).join("\n")}`;
}

/** Red warning block for the admin email, or "" when nothing oversold */
export function shortfallWarningHtml(shortfalls: StockShortfall[]): string {
  if (shortfalls.length === 0) return "";
  const rows = describeShortfalls(shortfalls)
    .map((line) => `<li style="margin: 4px 0;">${escapeHtml(line)}</li>`)
    .join("");
  return `
    <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
      <h2 style="color: #b91c1c; margin: 0 0 10px 0; font-size: 18px;">⚠️ Oversold</h2>
      <p style="color: #374151; margin: 0 0 8px 0;">${OVERSOLD_NOTE}</p>
      <ul style="color: #374151; margin: 0; padding-left: 20px;">${rows}</ul>
    </div>`;
}

const ITEMS_NOT_SAVED_NOTE =
  "Order items were NOT saved and stock was NOT updated. Please lower stock by hand.";

/** Admin email note for an order whose items failed to save */
export function itemsNotSavedText(): string {
  return ITEMS_NOT_SAVED_NOTE;
}

export function itemsNotSavedHtml(): string {
  return `<p style="color: #b91c1c; font-weight: bold; margin: 0 0 20px 0;">⚠️ ${ITEMS_NOT_SAVED_NOTE}</p>`;
}
