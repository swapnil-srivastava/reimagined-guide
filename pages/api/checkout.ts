// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Accept either a pre-created Stripe priceId OR raw price data (price, name, currency).
      // This enables "Buy now" flows from product listings without requiring a stored Stripe Price object.
      const { priceId, price, currency = 'EUR', name, email, userId, items } = req.body;

      let line_items;

      if (items && Array.isArray(items) && items.length > 0) {
        // Handle multiple items from cart
        line_items = items.map((item: any) => ({
          price_data: {
            currency: (currency || 'EUR').toLowerCase(),
            product_data: {
              name: item.name,
              description: item.description,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));
      } else if (priceId) {
        line_items = [ { price: priceId, quantity: 1 } ];
      } else if (typeof price === 'number' && name) {
        // unit_amount expects cents
        const unit_amount = Math.round(price * 100);
        line_items = [
          {
            price_data: {
              currency: (currency || 'EUR').toLowerCase(),
              product_data: { name },
              unit_amount,
            },
            quantity: 1,
          },
        ];
      } else {
        return res.status(400).json({ message: 'Invalid request: Provide items array, priceId, or price and name' });
      }

      const sessionOptions: Stripe.Checkout.SessionCreateParams = {
        metadata: { user_id: userId },
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      };

      if (email) {
        sessionOptions.customer_email = email;
      }

      const session = await stripe.checkout.sessions.create(sessionOptions);
      res.status(200).json({ id: session.id });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}