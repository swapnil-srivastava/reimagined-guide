import type Stripe from "stripe";

// Promo codes live in Stripe (Product catalog → Coupons → promotion codes),
// for card and PayPal payments alike. The website checks a code here, Stripe
// checkout gets it pre-applied, and PayPal gets the same discount in its
// amount breakdown. Stripe only counts card uses towards a code's limits.

export class PromoError extends Error {}

// pricing.ts CURRENCY; not imported so this file has no server dependencies
// and its tests run without a database
const CURRENCY = "EUR";

export interface Promo {
  /** Stripe promotion code id, e.g. promo_123 */
  id: string;
  /** What the buyer typed, as saved in Stripe, e.g. "TEST10" */
  code: string;
  percentOff: number | null;
  /** In euros */
  amountOff: number | null;
  /** In euros: the order must be at least this much */
  minimumAmount: number | null;
}

const CODE_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

/** Finds an active promotion code, or throws a PromoError with a message for the buyer */
export async function findPromo(stripe: Stripe, raw: unknown): Promise<Promo> {
  const typed = typeof raw === "string" ? raw.trim() : "";
  if (!CODE_PATTERN.test(typed)) throw new PromoError("That promo code isn't valid.");

  const { data } = await stripe.promotionCodes.list({ code: typed, active: true, limit: 1 });
  const promo = data[0];
  const coupon = promo?.coupon;
  const now = Math.floor(Date.now() / 1000);
  if (!promo || !coupon?.valid) throw new PromoError("That promo code isn't valid.");
  if ((promo.expires_at && promo.expires_at <= now) || (coupon.redeem_by && coupon.redeem_by <= now)) {
    throw new PromoError("That promo code has expired.");
  }
  if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) {
    throw new PromoError("That promo code has been used up.");
  }
  // Codes made for one customer only work through Stripe's own checkout box
  if (promo.customer) throw new PromoError("That promo code can't be used here.");
  if (coupon.amount_off && coupon.currency?.toUpperCase() !== CURRENCY) {
    throw new PromoError("That promo code can't be used here.");
  }

  const minimum = promo.restrictions?.minimum_amount;
  const minimumCurrency = promo.restrictions?.minimum_amount_currency;
  return {
    id: promo.id,
    code: promo.code,
    percentOff: coupon.percent_off ?? null,
    amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
    minimumAmount: minimum && (!minimumCurrency || minimumCurrency.toUpperCase() === CURRENCY) ? minimum / 100 : null,
  };
}

/**
 * The discount in euros on an order of `total` (products, tax and delivery,
 * as Stripe applies it to every line), rounded to the cent like Stripe.
 * Throws a PromoError when the order is below the code's minimum.
 */
export function promoDiscount(promo: Promo, total: number): number {
  if (promo.minimumAmount && total < promo.minimumAmount) {
    throw new PromoError(`That promo code needs an order of at least €${promo.minimumAmount.toFixed(2)}.`);
  }
  const cents = Math.round(total * 100);
  const off = promo.percentOff ? Math.round((cents * promo.percentOff) / 100) : Math.round((promo.amountOff ?? 0) * 100);
  return Math.min(off, cents) / 100;
}
