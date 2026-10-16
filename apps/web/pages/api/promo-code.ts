import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { PricingError, parseCartItems, priceCart } from "../../lib/server/pricing";
import { PromoError, findPromo, promoDiscount } from "../../lib/server/promo";
import { rateLimited } from "../../lib/server/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Checks a promo code against the cart: { code, items, deliveryOptionId }
 * → { code, discount, total } in euros. Only a preview: /api/checkout and
 * /api/paypal-checkout check the code again when the order is made.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Slows down guessing codes
  if (await rateLimited(req, res, "promo-code", 20)) return;

  try {
    const { code, items, deliveryOptionId } = req.body || {};
    const cart = await priceCart(parseCartItems(items), deliveryOptionId);
    const promo = await findPromo(stripe, code);
    const discount = promoDiscount(promo, cart.total);
    return res.status(200).json({ code: promo.code, discount, total: Math.round((cart.total - discount) * 100) / 100 });
  } catch (error: any) {
    if (error instanceof PromoError || error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Promo code check failed", error);
    return res.status(500).json({ message: "The promo code couldn't be checked. Please try again." });
  }
}
