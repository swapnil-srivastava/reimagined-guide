// pages/api/paypal-capture.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';
import { supaServerClient } from '../../supa-server-client';
import * as postmark from 'postmark';

const postMarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

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

        // Fetch order items with product details for email
        const { data: orderItems, error: fetchError } = await supaServerClient
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', orderData.id);

        if (fetchError) {
          console.error('Error fetching order items:', fetchError);
        }

        // Send email notifications
        const orderItemsHtml = (orderItems || []).map((item: any) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: left;">${item.product?.title || 'Product'}</td>
            <td style="padding: 12px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right;">€${(item.price / 100).toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; font-weight: bold;">€${((item.price * item.quantity) / 100).toFixed(2)}</td>
          </tr>
        `).join('');

        const orderItemsText = orderItems.map((item: any) => 
          `${item.product?.title || 'Product'} x${item.quantity} - €${((item.price * item.quantity) / 100).toFixed(2)}`
        ).join('\n');

        // Customer confirmation email
        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #00539c 0%, #004b8c 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Order Confirmed!</h1>
                <p style="color: #bfd4e6; margin: 15px 0 0 0; font-size: 18px;">Thank you for your purchase!</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Hi there! 👋<br><br>
                  Your order has been successfully placed and confirmed. We're excited to get started on fulfilling it!
                </p>
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                  <h2 style="color: #00539c; margin: 0 0 15px 0; font-size: 18px;">📦 Order Summary</h2>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                      <tr style="background-color: #00539c; color: #ffffff;">
                        <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Product</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                        <th style="padding: 12px; text-align: right; border-radius: 0 8px 0 0;">Total</th>
                      </tr>
                    </thead>
                    <tbody style="color: #374151;">
                      ${orderItemsHtml}
                    </tbody>
                  </table>
                  <div style="border-top: 2px solid #00539c; margin-top: 15px; padding-top: 15px; text-align: right;">
                    <span style="font-size: 20px; font-weight: bold; color: #00539c;">Total: €${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0070ba;">
                  <p style="color: #374151; margin: 0; font-size: 14px;">
                    <strong>Payment Method:</strong> <span style="display: inline-block; background-color: #0070ba; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 5px;">PayPal</span>
                  </p>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Need help? Contact us at contact@swapnilsrivastava.eu</p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Swapnil's Odyssey. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Admin notification email
        const adminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">💰 New Order Received!</h1>
                <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">Ka-ching! PayPal payment processed!</p>
              </div>
              <div style="padding: 30px;">
                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">👤 Customer Information</h2>
                  <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${payerEmail || 'Not provided'}</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>User ID:</strong> ${userId || 'Guest'}</p>
                </div>
                <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0070ba;">
                  <h2 style="color: #0070ba; margin: 0 0 15px 0; font-size: 18px;">💳 Payment Information</h2>
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background-color: #0070ba; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">PayPal</span>
                  </div>
                  <p style="color: #374151; margin: 10px 0 5px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #6b7280;">Transaction ID:</p>
                  <div style="background-color: #f3f4f6; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #1f2937; word-break: break-all;">
                    ${captureResult.id}
                  </div>
                </div>
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                  <h2 style="color: #00539c; margin: 0 0 15px 0; font-size: 18px;">📦 Order Details</h2>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                      <tr style="background-color: #00539c; color: #ffffff;">
                        <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Product</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                        <th style="padding: 12px; text-align: right; border-radius: 0 8px 0 0;">Total</th>
                      </tr>
                    </thead>
                    <tbody style="color: #374151;">
                      ${orderItemsHtml}
                    </tbody>
                  </table>
                  <div style="border-top: 2px solid #059669; margin-top: 15px; padding-top: 15px; text-align: right;">
                    <span style="font-size: 20px; font-weight: bold; color: #059669;">Total: €${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Order received at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send email to customer
        if (payerEmail) {
          try {
            await postMarkClient.sendEmail({
              From: process.env.EMAIL,
              To: payerEmail,
              Subject: "🎉 Your Order is Confirmed! - Swapnil's Odyssey",
              HtmlBody: customerEmailHtml,
              TextBody: `Order Confirmed!\n\nThank you for your purchase via PayPal!\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}\n\nVisit us at https://swapnilsrivastava.eu`,
              MessageStream: "outbound",
            });
            console.log('✅ PayPal customer email sent to:', payerEmail);
          } catch (emailError) {
            console.error('❌ Error sending PayPal customer email:', emailError);
          }
        }

        // Send email to admin
        try {
          await postMarkClient.sendEmail({
            From: process.env.EMAIL,
            To: "contact@swapnilsrivastava.eu",
            Subject: `💰 New PayPal Order - €${totalAmount.toFixed(2)}`,
            HtmlBody: adminEmailHtml,
            TextBody: `New PayPal Order Received!\n\nCustomer: ${payerEmail || 'Guest'}\nUser ID: ${userId || 'N/A'}\nPayPal Transaction ID: ${captureResult.id}\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}`,
            MessageStream: "outbound",
          });
          console.log('✅ PayPal admin email sent');
        } catch (emailError) {
          console.error('❌ Error sending PayPal admin email:', emailError);
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
