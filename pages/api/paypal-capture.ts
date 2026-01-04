// pages/api/paypal-capture.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';
import { supaServerClient } from '../../supa-server-client';

// PayPal environment setup
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('PayPal Configuration Error:', {
      hasClientId: !!clientId,
      hasSecret: !!clientSecret,
    });
    throw new Error('PayPal credentials are not configured');
  }

  // Use PAYPAL_MODE to explicitly control sandbox vs live
  // Default to sandbox unless explicitly set to 'live'
  const mode = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';

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
    const { orderId, userId, items } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const paypalClient = client();
    const capture = await paypalClient.execute(request);

    const captureResult = capture.result;

    if (captureResult.status !== 'COMPLETED') {
      return res.status(400).json({ 
        message: 'Payment capture failed',
        status: captureResult.status 
      });
    }

    // Extract payment details
    const purchaseUnit = captureResult.purchase_units[0];
    const captureDetails = purchaseUnit.payments.captures[0];
    const totalAmount = parseFloat(captureDetails.amount.value);
    const payerId = captureResult.payer.payer_id;
    const payerEmail = captureResult.payer.email_address;

    // Create order in database
    if (userId && items && Array.isArray(items)) {
      const { data: orderData, error: orderError } = await supaServerClient
        .from('orders')
        .insert({
          user_id: userId,
          total: totalAmount,
          status: 'completed',
          payment_method: 'paypal',
          payment_intent_id: captureDetails.id,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
      } else if (orderData) {
        console.log('Order created:', orderData.id);

        // Create order items
        const orderItemsInsert = items.map((item: any) => ({
          order_id: orderData.id,
          product_id: item.id || null,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supaServerClient
          .from('order_items')
          .insert(orderItemsInsert);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
        } else {
          console.log('Order items created successfully');
        }
      }
    }

    res.status(200).json({ 
      success: true,
      orderId: captureResult.id,
      status: captureResult.status,
      payerId,
      payerEmail,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to capture PayPal payment',
      details: error.details || []
    });
  }
}
