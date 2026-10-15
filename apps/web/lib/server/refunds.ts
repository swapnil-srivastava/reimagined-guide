import type Stripe from "stripe";
import { supaServerClient } from "../../supa-server-client";
import type { Booking, BookingHost, BookingType } from "../booking/types";
import { orderNumber } from "../orders";
import { inviteIdentity } from "./booking";
import { sendBookingEmails } from "./bookingEmails";
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
  previous_status?: string;
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
  const emailsFailed = await emailCancelledCalls(cancelled);

  const restocked = result.restocked ?? [];
  const number = orderNumber(order);
  const email = (order.metadata as Record<string, unknown> | null)?.customer_email;
  const lines: string[] = [];
  if (result.status === "refunded") {
    lines.push(`Order ${number} was fully refunded (${euro(refunded)}). It now shows as Refunded.`);
    if (restocked.length > 0) {
      lines.push(`Put back into stock: ${restocked.map((r) => `${r.name} +${r.quantity} (now ${r.stock})`).join(", ")}.`);
    }
    if (cancelled.length > 0) {
      lines.push(
        `Cancelled ${cancelled.length === 1 ? "1 upcoming call" : `${cancelled.length} upcoming calls`} and emailed the buyer${
          emailsFailed ? ", but at least one email failed: please tell them yourself" : ""
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

  await sendAdminRefundEmail({
    subject: `${result.status === "refunded" ? "Refunded" : "Partly refunded"}: ${euro(refunded)} for order ${number}`,
    lines,
    details: [
      ["Customer", typeof email === "string" && email ? email : "Unknown"],
      ["Payment", paymentIntentId ?? charge.id],
    ],
    button: result.status === "refunded" ? undefined : { label: "Open products", href: `${SITE_URL}/admin/products` },
  });
}

/** Emails the buyer and host about each call a refund cancelled. Returns true if any email failed. */
async function emailCancelledCalls(cancelled: Booking[]): Promise<boolean> {
  if (!supaServerClient || cancelled.length === 0) return false;
  let failed = false;
  for (const booking of cancelled) {
    try {
      const [{ data: type }, { data: host }] = await Promise.all([
        supaServerClient.from("booking_types").select("*").eq("id", booking.booking_type_id).single(),
        supaServerClient.from("booking_hosts").select("*").eq("id", booking.host_id).single(),
      ]);
      if (!type || !host) {
        failed = true;
        continue;
      }
      const sent = await sendBookingEmails({
        event: "cancelled",
        booking,
        type: type as BookingType,
        host: host as BookingHost,
        identity: await inviteIdentity(booking),
        cancelledBy: "refund",
      });
      if (!sent.invitee || !sent.host) failed = true;
    } catch (mailError) {
      failed = true;
      console.error(`Refund: cancel email for booking ${booking.id} failed`, mailError);
    }
  }
  return failed;
}

async function sendAdminRefundEmail(options: {
  subject: string;
  lines: string[];
  details: [string, string][];
  button?: { label: string; href: string };
}): Promise<void> {
  const { subject, lines, details, button } = options;
  const detailsHtml = details
    .map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`)
    .join("<br>");
  const html = emailLayout({
    preheader: lines[0],
    title: subject.split(":")[0],
    bodyHtml: lines.map((line) => paragraph(escapeHtml(line))).join("") + paragraph(detailsHtml),
    button: button ?? { label: "Open orders", href: `${SITE_URL}/admin` },
  });
  const text = [...lines, "", ...details.map(([label, value]) => `${label}: ${value}`)].join("\n");
  const sent = await sendMail(ADMIN_EMAIL, subject, html, text);
  if (!sent) console.error(`Refund email "${subject}" failed`);
}
