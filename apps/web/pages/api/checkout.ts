// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { OrderType } from '../../types/stripe';
import { getAuthedRequest } from '../../lib/server/supabase-user';
import {
  CURRENCY,
  SERVICE_PACKAGES,
  PricingError,
  parseCartItems,
  priceCart,
} from '../../lib/server/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Creates a Stripe Checkout session. Every amount comes from the server:
 * - service packages: `priceId`, which must be one of SERVICE_PACKAGES
 * - cart / Buy now: `items` as [{ id, quantity }] priced from the products
 *   table, plus an optional `deliveryOptionId`
 * The buyer is read from the `Authorization: Bearer <jwt>` header, never from the body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { priceId, items, deliveryOptionId } = req.body || {};

    // A Buy now from the shop works without signing in, but a token that is
    // sent must be valid, so nobody can attach an order to another account
    let user = null;
    if (req.headers.authorization) {
      const authed = await getAuthedRequest(req);
      if (!authed) {
        return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
      }
      user = authed.user;
    }

    const currency = CURRENCY.toLowerCase();
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    let order_type: OrderType;
    const metadata: Record<string, string> = {};

    if (priceId !== undefined) {
      const servicePackage = SERVICE_PACKAGES[priceId];
      if (!servicePackage) {
        return res.status(400).json({ message: 'Unknown package' });
      }
      if (!user) {
        return res.status(401).json({ message: 'Please sign in to book this package' });
      }
      order_type = 'service_package';
      line_items = [{ price: priceId, quantity: 1 }];
      metadata.package_name = servicePackage.name;
      metadata.package_description = servicePackage.description;
      metadata.package_id = servicePackage.package_id;
    } else if (items !== undefined) {
      const cart = await priceCart(parseCartItems(items), deliveryOptionId);
      order_type = 'cart';
      line_items = cart.items.map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
            images: item.image_url ? [item.image_url] : [],
            // The webhook copies this into order_items.product_id
            metadata: { product_id: item.product_id },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      if (cart.tax > 0) {
        line_items.push({
          price_data: {
            currency,
            product_data: { name: 'Tax (19%)', description: 'Sales tax' },
            unit_amount: Math.round(cart.tax * 100),
          },
          quantity: 1,
        });
      }

      if (cart.delivery > 0) {
        line_items.push({
          price_data: {
            currency,
            product_data: { name: 'Delivery', description: 'Shipping and handling' },
            unit_amount: Math.round(cart.delivery * 100),
          },
          quantity: 1,
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid request: provide priceId or items' });
    }

    metadata.user_id = user?.id || '';
    metadata.order_type = order_type;
    metadata.is_anonymous = String(Boolean(user?.is_anonymous));

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      metadata,
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    };

    if (user?.email) {
      sessionOptions.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: error.message });
  }
}
