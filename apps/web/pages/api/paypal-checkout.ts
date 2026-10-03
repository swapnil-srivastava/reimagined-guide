// pages/api/paypal-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';
import { getAuthedRequest } from '../../lib/server/supabase-user';
import { CURRENCY, PricingError, parseCartItems, priceCart } from '../../lib/server/pricing';

// PayPal environment setup
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured');
  }

  // Use PAYPAL_MODE to explicitly control sandbox vs live
  // Default to sandbox unless explicitly set to 'live'
  const mode = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';

  // Use sandbox by default, live only if explicitly configured
  return mode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal client
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { items, deliveryOptionId } = req.body || {};

    // The buyer comes from their session token, never from the body. A token
    // that is sent must be valid.
    let userId = '';
    if (req.headers.authorization) {
      const authed = await getAuthedRequest(req);
      if (!authed) {
        return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
      }
      userId = authed.user.id;
    }

    // Prices, tax and delivery come from the products table and server constants
    const cart = await priceCart(parseCartItems(items), deliveryOptionId);
    const currency = CURRENCY;

    // Build purchase units with itemized breakdown. The sku carries the
    // product id so the capture can record order items without trusting the browser.
    const itemsBreakdown = cart.items.map((item) => ({
      name: item.name.slice(0, 127),
      description: item.description.slice(0, 127),
      sku: item.product_id,
      unit_amount: {
        currency_code: currency,
        value: item.price.toFixed(2),
      },
      quantity: item.quantity.toString(),
    }));

    const amountBreakdown: any = {
      item_total: {
        currency_code: currency,
        value: cart.subtotal.toFixed(2),
      },
    };

    if (cart.tax > 0) {
      amountBreakdown.tax_total = {
        currency_code: currency,
        value: cart.tax.toFixed(2),
      };
    }

    if (cart.delivery > 0) {
      amountBreakdown.shipping = {
        currency_code: currency,
        value: cart.delivery.toFixed(2),
      };
    }

    // Create order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: cart.total.toFixed(2),
            breakdown: amountBreakdown,
          },
          items: itemsBreakdown,
          description: `Order for ${cart.items.length} item(s)`,
          custom_id: userId || undefined,
        },
      ],
      application_context: {
        brand_name: "Swapnil's Odyssey",
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      },
    });

    // Execute request
    const paypalClient = client();
    const order = await paypalClient.execute(request);

    res.status(200).json({ 
      orderId: order.result.id,
      status: order.result.status 
    });
  } catch (error: any) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    console.error('PayPal checkout error:', error.message);
    
    res.status(500).json({ 
      message: error.message || 'Failed to create PayPal order',
      details: error.details || []
    });
  }
}
