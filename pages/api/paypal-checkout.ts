// pages/api/paypal-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured');
  }

  // Use sandbox for development, live for production
  return process.env.NODE_ENV === 'production'
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
    const { items, email, userId, currency = 'EUR', tax, deliveryCost, totalCost } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid request: items array is required' });
    }

    if (!totalCost || totalCost <= 0) {
      return res.status(400).json({ message: 'Invalid request: totalCost is required' });
    }

    // Build purchase units with itemized breakdown
    const itemsBreakdown = items.map((item: any) => ({
      name: item.name,
      description: item.description || '',
      unit_amount: {
        currency_code: currency.toUpperCase(),
        value: item.price.toFixed(2),
      },
      quantity: item.quantity.toString(),
    }));

    // Build amount breakdown
    const amountBreakdown: any = {
      item_total: {
        currency_code: currency.toUpperCase(),
        value: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2),
      },
    };

    if (tax && tax > 0) {
      amountBreakdown.tax_total = {
        currency_code: currency.toUpperCase(),
        value: tax.toFixed(2),
      };
    }

    if (deliveryCost && deliveryCost > 0) {
      amountBreakdown.shipping = {
        currency_code: currency.toUpperCase(),
        value: deliveryCost.toFixed(2),
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
            currency_code: currency.toUpperCase(),
            value: totalCost.toFixed(2),
            breakdown: amountBreakdown,
          },
          items: itemsBreakdown,
          description: `Order for ${items.length} item(s)`,
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
    console.error('PayPal checkout error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create PayPal order',
      details: error.details || []
    });
  }
}
