// pages/api/paypal-capture.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';
import { supaServerClient } from '../../supa-server-client';
import { getAuthedRequest } from '../../lib/server/supabase-user';
import { ADMIN_EMAIL, escapeHtml, sendMail } from '../../lib/server/mailer';
import {
  itemsNotSavedHtml,
  itemsNotSavedText,
  saveOrderItems,
  shortfallWarningHtml,
  shortfallWarningText,
  StockShortfall,
} from '../../lib/server/stock';

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
    const { orderId } = req.body || {};

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const paypalClient = client();

    // Read the order PayPal holds. Its buyer (custom_id) and items (sku =
    // product id) were set by /api/paypal-checkout from server prices, so
    // nothing the browser sends here decides what gets recorded.
    const orderResult = (await paypalClient.execute(new paypal.orders.OrdersGetRequest(orderId))).result;
    const orderUnit = orderResult.purchase_units?.[0];
    const userId: string = orderUnit?.custom_id || '';
    const paidItems: any[] = orderUnit?.items || [];

    // Only the buyer who created the order may capture it
    if (userId) {
      const authed = await getAuthedRequest(req);
      if (!authed || authed.user.id !== userId) {
        return res.status(403).json({ message: 'This order belongs to another account' });
      }
    }

    // Capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

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

    // PayPal's copy of the order: product lines in euros, set by
    // /api/paypal-checkout from server prices. Parsed once for saving and email.
    const items = paidItems.map((item: any) => {
      const quantity = parseInt(item?.quantity, 10) || 0;
      const price = parseFloat(item?.unit_amount?.value) || 0;
      return {
        product_id: (item?.sku as string) || null,
        name: String(item?.name || 'Product'),
        quantity,
        price,
        lineTotal: price * quantity,
      };
    });
    // Tax and delivery are in the amount breakdown, not in items
    const breakdown = orderUnit?.amount?.breakdown;
    const extraLines = [
      { name: 'Tax', amount: parseFloat(breakdown?.tax_total?.value) || 0 },
      { name: 'Delivery', amount: parseFloat(breakdown?.shipping?.value) || 0 },
    ].filter((line) => line.amount > 0);

    // Create order in database. Guest checkouts (no account) are saved too,
    // with no user_id, so their stock is lowered like any other order.
    let orderData: { id: string } | null = null;
    let saveError = '';
    if (!supaServerClient) {
      saveError = 'SUPABASE_SERVICE_ROLE_KEY is not configured';
    } else if (items.length === 0) {
      saveError = 'PayPal returned no items for this order';
    } else if (items.some((item) => item.quantity < 1)) {
      saveError = 'PayPal returned an item without a valid quantity';
    } else {
      const { data, error } = await supaServerClient
        .from('orders')
        .insert({
          user_id: userId || null,
          total: totalAmount,
          status: 'completed',
          payment_method: 'paypal',
          payment_intent_id: captureDetails.id,
          metadata: { customer_email: payerEmail || null, paypal_order_id: orderId },
          is_anonymous_order: !userId,
        })
        .select()
        .single();
      if (error || !data) {
        saveError = error?.message || 'no order returned';
      } else {
        orderData = data;
      }
    }

    if (!orderData) {
      // The payment is already captured and PayPal won't retry, so tell the
      // admin rather than lose the order silently
      console.error('Error creating order:', saveError);
      const alertText = `A PayPal payment was captured but the order could not be saved, so stock was not updated and no confirmation email went out.\n\nCustomer: ${payerEmail || 'Unknown'}\nUser ID: ${userId || 'Guest'}\nPayPal Transaction ID: ${captureDetails.id}\nTotal: €${totalAmount.toFixed(2)}\n\nItems:\n${items.map((item) => `${item.name} x${item.quantity} (product ${item.product_id || 'n/a'})`).join('\n') || 'none'}\n\nError: ${saveError}`;
      await sendMail(
        ADMIN_EMAIL,
        `⚠️ PayPal order NOT saved - €${totalAmount.toFixed(2)}`,
        `<pre style="font-family: monospace; white-space: pre-wrap;">${escapeHtml(alertText)}</pre>`,
        alertText
      );
    } else {
      console.log('Order created:', orderData.id);

      // Save the items and lower stock in one transaction. PayPal has no
      // retry, so if this fails the admin email says stock wasn't updated.
      let stockShortfalls: StockShortfall[] = [];
      let itemsSaved = false;
      try {
        stockShortfalls = await saveOrderItems(
          orderData.id,
          [
            ...items.map(({ product_id, quantity, price, name }) => ({ product_id, quantity, price, name })),
            // Tax and delivery as rows without a product, as the Stripe webhook saves them
            ...extraLines.map((line) => ({ product_id: null, quantity: 1, price: line.amount, name: line.name })),
          ]
        );
        itemsSaved = true;
        console.log('Order items created and stock updated');
        if (stockShortfalls.length > 0) {
          console.warn(`⚠️ Order ${orderData.id} oversold:`, stockShortfalls);
        }
      } catch (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      const stockNoteText = [
        shortfallWarningText(stockShortfalls),
        itemsSaved ? '' : itemsNotSavedText(),
      ].filter(Boolean).join('\n\n');

      // Email lines come from PayPal's copy of the order, so they show even
      // if saving the items failed
      const orderItemsHtml = [
        ...items.map((item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">${escapeHtml(item.name)}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">€${item.price.toFixed(2)}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">€${item.lineTotal.toFixed(2)}</td>
        </tr>`),
        ...extraLines.map((line) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">${line.name}</td>
          <td style="padding: 12px; text-align: center;"></td>
          <td style="padding: 12px; text-align: right;">€${line.amount.toFixed(2)}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">€${line.amount.toFixed(2)}</td>
        </tr>`),
      ].join('');

      const orderItemsText = [
        ...items.map((item) => `${item.name} x${item.quantity} - €${item.lineTotal.toFixed(2)}`),
        ...extraLines.map((line) => `${line.name} - €${line.amount.toFixed(2)}`),
      ].join('\n');

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
              ${shortfallWarningHtml(stockShortfalls)}
              ${itemsSaved ? '' : itemsNotSavedHtml()}
              <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">👤 Customer Information</h2>
                <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(payerEmail) || 'Not provided'}</p>
                <p style="color: #374151; margin: 5px 0;"><strong>User ID:</strong> ${escapeHtml(userId) || 'Guest'}</p>
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

      // Emails go through sendMail (EMAIL_KEY), like the Stripe webhook's
      if (payerEmail) {
        await sendMail(
          payerEmail,
          "🎉 Your Order is Confirmed! - Swapnil's Odyssey",
          customerEmailHtml,
          `Order Confirmed!\n\nThank you for your purchase via PayPal!\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}\n\nVisit us at https://swapnilsrivastava.eu`
        );
      }

      await sendMail(
        ADMIN_EMAIL,
        `${stockNoteText ? '⚠️ STOCK: ' : ''}💰 New PayPal Order - €${totalAmount.toFixed(2)}`,
        adminEmailHtml,
        `New PayPal Order Received!\n\nCustomer: ${payerEmail || 'Guest'}\nUser ID: ${userId || 'N/A'}\nPayPal Transaction ID: ${captureResult.id}\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}${stockNoteText ? `\n\n${stockNoteText}` : ''}`
      );
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
