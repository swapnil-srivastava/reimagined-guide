// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { OrderType } from '../../types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Accept either a pre-created Stripe priceId OR raw price data (price, name, currency).
      // This enables "Buy now" flows from product listings without requiring a stored Stripe Price object.
      // NEW: Also accepts order_type for distinguishing cart vs service_package orders
      // NEW: Supports anonymous user checkout
      const { 
        priceId, 
        price, 
        currency = 'EUR', 
        name, 
        email, 
        userId, 
        items, 
        tax, 
        deliveryCost,
        // New fields for order type support
        order_type = 'cart' as OrderType,
        package_name,
        package_description,
        package_id,
        // Anonymous user flag
        is_anonymous = false,
      } = req.body;

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

        // Add tax as a separate line item if provided
        if (tax && tax > 0) {
          line_items.push({
            price_data: {
              currency: (currency || 'EUR').toLowerCase(),
              product_data: {
                name: 'Tax (19%)',
                description: 'Sales tax',
              },
              unit_amount: Math.round(tax * 100),
            },
            quantity: 1,
          });
        }

        // Add delivery cost as a separate line item if provided
        if (deliveryCost && deliveryCost > 0) {
          line_items.push({
            price_data: {
              currency: (currency || 'EUR').toLowerCase(),
              product_data: {
                name: 'Delivery',
                description: 'Shipping and handling',
              },
              unit_amount: Math.round(deliveryCost * 100),
            },
            quantity: 1,
          });
        }
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

      // Build metadata object with order type information
      const metadata: Record<string, string> = {
        user_id: userId || '',
        order_type: order_type,
        is_anonymous: String(is_anonymous),
      };

      // Add service package specific metadata if applicable
      if (order_type === 'service_package') {
        if (package_name) metadata.package_name = package_name;
        if (package_description) metadata.package_description = package_description;
        if (package_id) metadata.package_id = package_id;
      }

      const sessionOptions: Stripe.Checkout.SessionCreateParams = {
        metadata,
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