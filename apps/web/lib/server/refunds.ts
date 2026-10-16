import type Stripe from "stripe";
import { supaServerClient } from "../../supa-server-client";
import type { Booking } from "../booking/types";
import { customerEmail, orderNumber } from "../orders";
import { sendCancelledEmails } from "./booking";
import { emailLayout, paragraph } from "./emailLayout";
import { ADMIN_EMAIL, SITE_URL, escapeHtml, sendMail } from "./mailer";

/**
 * Whether a full refund also cancels the order's upcoming 1:1 calls and
 * switches off its booking link. A partial refund never does.
 */
export const REFUND_CANCELS_CALLS = true;

interface Restocked {
  product_id: string;
  name: string;
  quantity: number;
  stock: number;
}

/** What mark_order_refunded() (migration 20261015170000) returns */
interface RefundResult {
  found: boolean;
  status?: "refunded" | "partially_refunded";
  amount_refunded?: number;
  changed?: boolean;
  restocked?: Restocked[];
  cancelled_bookings?: Booking[];
  links_revoked?: number;
}

const euro = (amount: number) => `€${amount.toFixed(2)}`;

/**
 * Handles Stripe's charge.refunded event, sent for every full or partial
 * refund with the charge's total refunded so far. Throws on a database error,
 * so the webhook returns 500 and Stripe retries; emails never throw.
 */
export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  if (!supaServerClient) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;
  const refunded = charge.amount_refunded / 100;
  const paid = charge.amount / 100;
  const full = charge.refunded;

  const { data: order, error: findError } = paymentIntentId
    ? await supaServerClient
        .from("orders")
        .select("id, metadata")
        .eq("payment_intent_id", paymentIntentId)
        .maybeSingle()
    : { data: null, error: null };
  if (findError) throw new Error(`Finding the refunded order failed: ${findError.message}`);

  if (!order) {
    // An order saved before orders were stored, or one that never saved.
    // Nothing to change, so tell the admin once instead of failing forever.
    console.warn(`Refund for ${paymentIntentId ?? charge.id}: no order found`);
    await sendAdminRefundEmail({
      title: "Refund with no order",
      subject: `Refund with no order: ${euro(refunded)}`,
      lines: [
        `Stripe refunded ${euro(refunded)} of ${euro(paid)}, but no order on the site has this payment.`,
        "Nothing was changed. Check stock and bookings by hand if needed.",
      ],
      details: [["Payment", paymentIntentId ?? charge.id], ["Customer", charge.billing_details?.email ?? "Unknown"]],
    });
    return;
  }

  const { data, error } = await supaServerClient.rpc("mark_order_refunded", {
    p_order_id: order.id,
    p_amount_refunded: refunded,
    p_full: full,
    p_refund_ref: charge.id,
    p_cancel_bookings: REFUND_CANCELS_CALLS,
  });
  if (error) throw new Error(`mark_order_refunded failed: ${error.message}`);
  const result = data as unknown as RefundResult;

  // A retried event, or a late partial-refund event after the full refund
  if (!result?.found || !result.changed) {
    console.log(`Refund for order ${order.id}: already recorded`);
    return;
  }

  const cancelled = result.cancelled_bookings ?? [];
  const sent = await Promise.all(cancelled.map((booking) => sendCancelledEmails(supaServerClient!, booking)));
  const emailsFailed = sent.includes(false);

  const restocked = result.restocked ?? [];
  const number = orderNumber(order);
  const lines: string[] = [];
  if (result.status === "refunded") {
    lines.push(`Order ${number} was fully refunded (${euro(refunded)}). It now shows as Refunded.`);
    if (restocked.length > 0) {
      lines.push(`Put back into stock: ${restocked.map((r) => `${r.name} +${r.quantity} (now ${r.stock})`).join(", ")}.`);
    }
    if (cancelled.length > 0) {
      lines.push(
        `Cancelled ${cancelled.length === 1 ? "1 upcoming call" : `${cancelled.length} upcoming calls`} and emailed the buyer${
          emailsFailed ? ", but a cancellation email didn't send: check the buyer knows" : ""
        }.`
      );
    }
    if ((result.links_revoked ?? 0) > 0) lines.push("Their booking link is switched off.");
  } else {
    lines.push(
      `Order ${number} was partly refunded: ${euro(refunded)} of ${euro(paid)} so far. It now shows as Partly refunded.`,
      "Stock and bookings were not changed, because Stripe doesn't say which items were refunded. Adjust stock on the products page if needed."
    );
  }

  const title = result.status === "refunded" ? "Refunded" : "Partly refunded";
  await sendAdminRefundEmail({
    title,
    subject: `${title}: ${euro(refunded)} for order ${number}`,
    lines,
    details: [
      ["Customer", customerEmail(order as { metadata: Record<string, unknown> | null }) ?? "Unknown"],
      ["Payment", paymentIntentId ?? charge.id],
    ],
    button: result.status === "refunded" ? undefined : { label: "Open products", href: `${SITE_URL}/admin/products` },
  });
}

async function sendAdminRefundEmail(options: {
  title: string;
  subject: string;
  lines: string[];
  details: [string, string][];
  button?: { label: string; href: string };
}): Promise<void> {
  const { title, subject, lines, details, button } = options;
  const detailsHtml = details
    .map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`)
    .join("<br>");
  const html = emailLayout({
    preheader: lines[0],
    title,
    bodyHtml: lines.map((line) => paragraph(escapeHtml(line))).join("") + paragraph(detailsHtml),
    button: button ?? { label: "Open orders", href: `${SITE_URL}/admin` },
  });
  const text = [...lines, "", ...details.map(([label, value]) => `${label}: ${value}`)].join("\n");
  const sent = await sendMail(ADMIN_EMAIL, subject, html, text);
  if (!sent) console.error(`Refund email "${subject}" failed`);
}
