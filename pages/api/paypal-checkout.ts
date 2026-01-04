// pages/api/paypal-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('PayPal Configuration Error:', {
      hasClientId: !!clientId,
      hasSecret: !!clientSecret,
      clientIdPrefix: clientId ? clientId.substring(0, 10) + '...' : 'missing',
    });
    throw new Error('PayPal credentials are not configured');
  }

  // Use PAYPAL_MODE to explicitly control sandbox vs live
  // Default to sandbox unless explicitly set to 'live'
  const mode = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';

  console.log('PayPal Environment:', {
    mode: mode.toUpperCase(),
    nodeEnv: process.env.NODE_ENV,
    clientIdPrefix: clientId.substring(0, 10) + '...',
  });

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

    // Build amount breakdown with precise calculations
    const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const taxAmount = tax || 0;
    const shippingAmount = deliveryCost || 0;
    
    // Calculate total to verify it matches
    const calculatedTotal = itemsTotal + taxAmount + shippingAmount;
    
    console.log('PayPal Order Breakdown:', {
      itemsTotal: itemsTotal.toFixed(2),
      tax: taxAmount.toFixed(2),
      shipping: shippingAmount.toFixed(2),
      calculatedTotal: calculatedTotal.toFixed(2),
      receivedTotal: totalCost.toFixed(2),
      match: Math.abs(calculatedTotal - totalCost) < 0.01
    });
    
    const amountBreakdown: any = {
      item_total: {
        currency_code: currency.toUpperCase(),
        value: itemsTotal.toFixed(2),
      },
    };

    if (taxAmount > 0) {
      amountBreakdown.tax_total = {
        currency_code: currency.toUpperCase(),
        value: taxAmount.toFixed(2),
      };
    }

    if (shippingAmount > 0) {
      amountBreakdown.shipping = {
        currency_code: currency.toUpperCase(),
        value: shippingAmount.toFixed(2),
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
    console.error('PayPal checkout error:', {
      message: error.message,
      name: error.name,
      details: error.details,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    // Extract more specific error info
    let errorMessage = error.message || 'Failed to create PayPal order';
    let errorDetails = error.details || [];
    
    if (error.message && error.message.includes('CURRENCY_NOT_SUPPORTED')) {
      errorMessage = 'Currency not supported. Please use USD for sandbox testing.';
    } else if (error.message && error.message.includes('AMOUNT_MISMATCH')) {
      errorMessage = 'Amount calculation error. Please try again.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: errorDetails,
      error: error.message
    });
  }
}
