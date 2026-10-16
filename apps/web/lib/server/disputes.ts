import type Stripe from "stripe";
import { supaServerClient } from "../../supa-server-client";
import type { Booking } from "../booking/types";
import { customerEmail, orderNumber } from "../orders";
import { sendCancelledEmails } from "./booking";
import { paypalResolutionCenterUrl } from "./paypal";
import { euro, sendAdminOrderEmail } from "./refunds";
import { SITE_URL } from "./mailer";

/**
 * Whether a lost dispute also cancels the order's upcoming 1:1 calls and
 * switches off its booking link, like a full refund does
 */
export const LOST_DISPUTE_CANCELS_CALLS = true;

export type DisputeStage = "open" | "won" | "lost";

/** What mark_order_disputed() (migration 20261016200000) returns */
interface DisputeResult {
  found: boolean;
  changed?: boolean;
  status?: string;
  cancelled_bookings?: Booking[];
  links_revoked?: number;
}

export interface DisputeInput {
  provider: "Stripe" | "PayPal";
  /** orders.payment_intent_id: the Stripe payment intent or PayPal capture id */
  findBy: string | null;
  disputeId: string;
  stage: DisputeStage;
  /** Disputed amount, in euros */
  amount: number;
  reason: string | null;
  /** ISO date the evidence is due, for an open dispute */
  evidenceDueBy: string | null;
  /** The provider's own result, e.g. "won", "warning_closed", "RESOLVED_BUYER_FAVOUR" */
  outcome: string | null;
  /** Where the admin answers or reads the dispute */
  url: string;
  /** When the provider opened the dispute, in ms */
  openedAt: number;
}

/**
 * How long a dispute with no order is retried before the admin is emailed.
 * A dispute can arrive before its order is saved (Stripe's instant-dispute
 * test card does this every time), and the provider's retry finds it then.
 */
const NO_ORDER_RETRY_MS = 60 * 60 * 1000;

const readable = (code: string | null) => (code ? code.replace(/_/g, " ").toLowerCase() : "not given");

const dueDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });

/**
 * Records a dispute (chargeback) opening, being won or lost on its order and
 * emails the admin about what changed. Throws on a database error so the
 * webhook is retried; emails never throw.
 */
export async function recordDispute(input: DisputeInput): Promise<void> {
  if (!supaServerClient) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  const { provider, findBy, disputeId, stage, amount, url } = input;

  const { data: order, error: findError } = findBy
    ? await supaServerClient.from("orders").select("id, metadata").eq("payment_intent_id", findBy).maybeSingle()
    : { data: null, error: null };
  if (findError) throw new Error(`Finding the disputed order failed: ${findError.message}`);

  const button = { label: `Open in ${provider}`, href: url };
  const details: [string, string][] = [
    ["Reason", readable(input.reason)],
    ["Payment", `${findBy ?? "Unknown"} (${provider})`],
  ];

  if (!order) {
    if (findBy && Date.now() - input.openedAt < NO_ORDER_RETRY_MS) {
      // Thrown, so the webhook answers 500 and the provider sends it again
      throw new Error(`Dispute ${disputeId}: no order for ${findBy} yet`);
    }
    console.warn(`Dispute ${disputeId} (${stage}): no order found for ${findBy}`);
    // Only the opening needs the admin; its closing is in the provider's email
    if (stage === "open") {
      await sendAdminOrderEmail({
        title: "Dispute with no order",
        subject: `Dispute with no order: ${euro(amount)}`,
        lines: [
          `A buyer disputed a ${provider} payment of ${euro(amount)}, but no order on the site has this payment.`,
          input.evidenceDueBy ? `Respond in ${provider} by ${dueDate(input.evidenceDueBy)}.` : `Respond in ${provider}.`,
        ],
        details,
        button,
      });
    }
    return;
  }

  const { data, error } = await supaServerClient.rpc("mark_order_disputed", {
    p_order_id: order.id,
    p_dispute_id: disputeId,
    p_stage: stage,
    p_amount: amount,
    p_details: {
      provider,
      reason: input.reason,
      evidence_due_by: input.evidenceDueBy,
      outcome: input.outcome,
      url,
    },
    p_cancel_bookings: LOST_DISPUTE_CANCELS_CALLS,
  });
  if (error) throw new Error(`mark_order_disputed failed: ${error.message}`);
  const result = data as unknown as DisputeResult;

  if (!result?.found || !result.changed) {
    console.log(`Dispute ${disputeId} (${stage}) on order ${order.id}: already recorded`);
    return;
  }

  const number = orderNumber(order);
  const lines: string[] = [];
  let title: string;
  if (stage === "open") {
    title = "Payment disputed";
    lines.push(
      `The buyer disputed ${euro(amount)} of order ${number} with their bank or ${provider}. It now shows as Disputed.`,
      input.evidenceDueBy
        ? `Send your evidence in ${provider} by ${dueDate(input.evidenceDueBy)}, or the buyer wins.`
        : `Respond in ${provider} as soon as you can, or the buyer wins.`,
      "Nothing else changed: stock and calls stay as they are unless the dispute is lost."
    );
  } else if (stage === "won") {
    title = "Dispute closed";
    lines.push(
      `The dispute on order ${number} closed in your favour (${readable(input.outcome)}). You keep the payment.`,
      result.status === "disputed" ? "" : `The order shows as ${statusWord(result.status)} again.`
    );
  } else {
    title = "Dispute lost";
    lines.push(
      `The dispute on order ${number} was lost: ${euro(amount)} went back to the buyer. It now shows as Dispute lost and no longer counts as revenue.`,
      "Stock wasn't put back, because the buyer kept what they bought."
    );
    const cancelled = result.cancelled_bookings ?? [];
    if (cancelled.length > 0) {
      const sent = await Promise.all(cancelled.map((booking) => sendCancelledEmails(supaServerClient!, booking)));
      lines.push(
        `Cancelled ${cancelled.length === 1 ? "1 upcoming call" : `${cancelled.length} upcoming calls`} and emailed the buyer${
          sent.includes(false) ? ", but a cancellation email didn't send: check the buyer knows" : ""
        }.`
      );
    }
    if ((result.links_revoked ?? 0) > 0) lines.push("Their booking link is switched off.");
  }

  await sendAdminOrderEmail({
    title,
    subject: `${title}: ${euro(amount)} for order ${number}`,
    lines: lines.filter(Boolean),
    details: [["Customer", customerEmail(order as { metadata: Record<string, unknown> | null }) ?? "Unknown"], ...details],
    button: stage === "open" ? button : { label: "Open order", href: `${SITE_URL}/admin/orders/${order.id}` },
  });
}

function statusWord(status: string | undefined): string {
  switch (status) {
    case "completed":
      return "Paid";
    case "partially_refunded":
      return "Partly refunded";
    case "refunded":
      return "Refunded";
    default:
      return status ?? "before";
  }
}

const stripeDisputeUrl = (dispute: Stripe.Dispute) =>
  `https://dashboard.stripe.com/${dispute.livemode ? "" : "test/"}disputes/${dispute.id}`;

/** Stripe's charge.dispute.created and charge.dispute.closed */
export function handleStripeDispute(dispute: Stripe.Dispute, closed: boolean): Promise<void> {
  const paymentIntentId =
    typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id ?? null;
  const dueBy = dispute.evidence_details?.due_by;
  return recordDispute({
    provider: "Stripe",
    findBy: paymentIntentId,
    disputeId: dispute.id,
    // warning_closed: an inquiry that never became a chargeback.
    // charge_refunded: refunded meanwhile, which charge.refunded records.
    stage: !closed ? "open" : dispute.status === "lost" ? "lost" : "won",
    amount: dispute.amount / 100,
    reason: dispute.reason,
    evidenceDueBy: dueBy ? new Date(dueBy * 1000).toISOString() : null,
    outcome: closed ? dispute.status : null,
    url: stripeDisputeUrl(dispute),
    openedAt: dispute.created * 1000,
  });
}

/** PayPal outcomes where the buyer got the money back from you */
const PAYPAL_LOST = new Set(["RESOLVED_BUYER_FAVOUR", "RESOLVED_WITH_PAYOUT"]);

/** PayPal's CUSTOMER.DISPUTE.CREATED and CUSTOMER.DISPUTE.RESOLVED */
export function handlePaypalDispute(resource: any, resolved: boolean): Promise<void> {
  const outcome: string | null = resource?.dispute_outcome?.outcome_code ?? null;
  return recordDispute({
    provider: "PayPal",
    findBy: resource?.disputed_transactions?.[0]?.seller_transaction_id ?? null,
    disputeId: String(resource?.dispute_id ?? ""),
    stage: !resolved ? "open" : outcome && PAYPAL_LOST.has(outcome) ? "lost" : "won",
    amount: Number(resource?.dispute_amount?.value) || 0,
    reason: resource?.reason ?? null,
    evidenceDueBy: resource?.seller_response_due_date ?? null,
    outcome,
    url: paypalResolutionCenterUrl(),
    openedAt: Date.parse(resource?.create_time) || 0,
  });
}
