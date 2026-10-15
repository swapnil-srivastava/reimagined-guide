// pages/api/webhook.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import * as postmark from "postmark";
import { supaServerClient } from '../../supa-server-client';
import { 
  OrderType, 
  OrderItemData, 
  isServicePackageOrder, 
  isCartOrder 
} from '../../types/stripe';
import {
  LowStock,
  saveOrderItems,
  sendLowStockEmail,
  shortfallWarningHtml,
  shortfallWarningText,
  StockShortfall,
} from '../../lib/server/stock';
import { handleChargeRefunded } from '../../lib/server/refunds';
import { createBookingLink } from '../../lib/server/booking';
import { escapeHtml } from '../../lib/server/mailer';

/**
 * Removes an order whose items failed to save, so Stripe's retry can write
 * the whole order again instead of hitting the duplicate check
 */
async function deleteOrder(orderId: string) {
  const { error } = await supaServerClient.from('orders').delete().eq('id', orderId);
  if (error) console.error(`Error removing incomplete order ${orderId}:`, error);
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET;
  const postMarkClient = new postmark.ServerClient(process.env.EMAIL_KEY);

  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      const body = await buffer(req);
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.log(`❌ Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    console.log('✅ Success:', event.id);

    // Handle 'checkout.session.completed' logic here
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("checkout session completed ===> ", session);

      try {
        // ============================================
        // COMMON LOGIC: Extract shared data from session
        // ============================================
        // A 100%-off promo code means no payment, so no payment intent: the
        // session id is then the order's unique key, so a retry can't save it twice
        const paymentIntentId = (session.payment_intent as string | null) || session.id;
        const userId = session.metadata?.user_id || null;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const totalAmount = (session.amount_total || 0) / 100;
        const sessionMetadata = session.metadata || {};
        
        // Determine order type from metadata (defaults to 'cart' for backwards compatibility)
        const orderType: OrderType = isServicePackageOrder(sessionMetadata) 
          ? 'service_package' 
          : 'cart';

        // ============================================
        // IDEMPOTENCY CHECK: Prevent duplicate orders
        // ============================================
        if (supaServerClient) {
          const { data: existingOrder } = await supaServerClient
            .from('orders')
            .select('id')
            .eq('payment_intent_id', paymentIntentId)
            .single();

          if (existingOrder) {
            console.log(`⚠️ Order already exists for payment_intent: ${paymentIntentId}, skipping...`);
            res.json({ received: true, duplicate: true });
            return;
          }
        }

        // Line items with their products, and the promo code when there was a discount
        const discount = (session.total_details?.amount_discount || 0) / 100;
        const [lineItems, promoCode] = await Promise.all([
          stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] }),
          discount > 0 ? promotionCodeOf(stripe, session.id) : Promise.resolve(null),
        ]);

        // Build order items HTML for email
        let orderItemsHtml = '';
        let orderItemsText = '';
        const orderItemsData: OrderItemData[] = [];

        lineItems.data.forEach((item) => {
          const product = item.price?.product as Stripe.Product;
          const productName = product?.name || item.description || 'Unknown Product';
          const quantity = item.quantity || 1;
          const unitPrice = (item.price?.unit_amount || 0) / 100;
          const itemTotal = unitPrice * quantity;
          
          orderItemsData.push({
            name: productName,
            quantity,
            price: unitPrice,
            product_id: product?.metadata?.product_id || undefined,
          });

          orderItemsHtml += `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${unitPrice.toFixed(2)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${itemTotal.toFixed(2)}</td>
            </tr>
          `;
          orderItemsText += `${productName} x${quantity} - €${itemTotal.toFixed(2)}\n`;
        });

        // Line prices are before the discount; this row explains the total
        if (discount > 0) {
          const label = promoCode ? `Discount (${promoCode})` : 'Discount';
          const amount = `−€${discount.toFixed(2)}`;
          orderItemsHtml += `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;" colspan="3">${escapeHtml(label)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${amount}</td>
            </tr>
          `;
          orderItemsText += `${label} - ${amount}\n`;
        }

        // ============================================
        // DATABASE OPERATIONS: Create order and items
        // ============================================
        // Products that sold out between checkout and payment
        let stockShortfalls: StockShortfall[] = [];
        let lowStock: LowStock[] = [];
        // The buyer's link to pick a time, when the package includes a call
        let bookingLink: string | null = null;
        let callMinutes = 30;
        let bookingLinkFailed = false;

        if (!supaServerClient) {
          // Without the service role key nothing can be saved; a 500 makes Stripe retry
          throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }

        // Guest checkouts (no account) are saved too, with no user_id, so
        // their stock is lowered like any other order
        // Check if this is an anonymous user order
        const isAnonymousOrder = sessionMetadata.is_anonymous === 'true';
        
        // Prepare order metadata based on order type
        const orderMetadata: Record<string, unknown> = {
          stripe_session_id: session.id,
          customer_email: customerEmail,
          is_anonymous: isAnonymousOrder,
        };
        if (discount > 0) {
          orderMetadata.discount = discount;
          if (promoCode) orderMetadata.promo_code = promoCode;
        }

        // Add service package specific metadata
        if (orderType === 'service_package') {
          orderMetadata.package_name = sessionMetadata.package_name;
          orderMetadata.package_description = sessionMetadata.package_description;
          orderMetadata.package_id = sessionMetadata.package_id;
        }

        // Insert order with unified structure
        const { data: orderData, error: orderError } = await supaServerClient
          .from('orders')
          .insert({
            user_id: userId,
            total: totalAmount,
            status: 'completed',
            payment_method: 'stripe',
            payment_intent_id: paymentIntentId,
            order_type: orderType,
            metadata: orderMetadata,
            is_anonymous_order: isAnonymousOrder,
          })
          .select()
          .single();

        if (orderError) {
          // 23505 = unique violation on payment_intent_id: a parallel delivery
          // of this event already saved the order
          if (orderError.code === '23505') {
            console.log(`⚠️ Order already exists for payment_intent: ${paymentIntentId}, skipping...`);
            res.json({ received: true, duplicate: true });
            return;
          }
          throw new Error(`Error creating order: ${orderError.message}`);
        } else if (orderData) {
          console.log(`Order created: ${orderData.id} (type: ${orderType}, anonymous: ${isAnonymousOrder})`);

          // ============================================
          // CONDITIONAL LOGIC: Handle order items based on type
          // ============================================
          if (orderType === 'service_package') {
            // SERVICE PACKAGE: Insert single order item from line_items[0] or metadata
            const packageItem = orderItemsData[0] || {
              name: sessionMetadata.package_name || 'Service Package',
              quantity: 1,
              price: totalAmount,
            };

            const { error: itemsError } = await supaServerClient
              .from('order_items')
              .insert({
                order_id: orderData.id,
                product_id: null, // Service packages don't have product_id
                quantity: packageItem.quantity,
                price: packageItem.price,
                name: packageItem.name,
              });

            if (itemsError) {
              await deleteOrder(orderData.id);
              throw new Error(`Error creating service package order item: ${itemsError.message}`);
            } else {
              console.log('Service package order item created successfully');
            }

            // A failure here must not lose the paid order: the admin email
            // then asks for the link to be sent by hand, as before
            try {
              const link = await createBookingLink({
                orderId: orderData.id,
                quantity: packageItem.quantity,
                packageId: sessionMetadata.package_id,
                email: customerEmail,
                name: session.customer_details?.name,
              });
              if (link) {
                bookingLink = link.url;
                callMinutes = link.type.duration_minutes;
              }
            } catch (linkError) {
              bookingLinkFailed = true;
              console.error(`❌ Booking link for order ${orderData.id} failed:`, linkError);
            }
          } else {
            // CART: Save the items and lower stock in one transaction
            try {
              ({ shortfalls: stockShortfalls, lowStock } = await saveOrderItems(
                orderData.id,
                orderItemsData.map((item) => ({
                  product_id: item.product_id || null,
                  quantity: item.quantity,
                  price: item.price,
                  name: item.name,
                }))
              ));
            } catch (itemsError) {
              // Nothing was saved, so remove the order and let Stripe retry.
              // If the call did save but its response was lost, the delete
              // fails on the items' foreign key and the retry sees the order
              // as a duplicate, so stock is never lowered twice.
              await deleteOrder(orderData.id);
              throw itemsError;
            }
            console.log('Order items created and stock updated');
            if (stockShortfalls.length > 0) {
              console.warn(`⚠️ Order ${orderData.id} oversold:`, stockShortfalls);
            }
          }
        }

        // ============================================
        // EMAIL TEMPLATES: Different for Cart vs Service Package
        // ============================================
        
        // Get package name for service packages
        const packageName = sessionMetadata.package_name || orderItemsData[0]?.name || 'Service Package';

        // Customer email template - CART orders
        const cartCustomerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #00539c 0%, #003e75 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
                <p style="color: #bfd4e6; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hello,<br><br>
                  We're excited to confirm your order has been successfully placed and payment received!
                </p>
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
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
                  <div style="border-top: 2px solid #00539c; margin-top: 15px; padding-top: 15px; text-align: right;">
                    <span style="font-size: 18px; font-weight: bold; color: #00539c;">Total: €${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                  If you have any questions about your order, please don't hesitate to contact us.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://swapnilsrivastava.eu" style="display: inline-block; background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Visit Our Store</a>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Swapnil's Odyssey. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Customer email template - SERVICE PACKAGE orders
        const servicePackageCustomerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${bookingLink ? 'Payment received – now pick your call time' : '🚀 Consultation Booked!'}</h1>
                <p style="color: #ddd6fe; margin: 10px 0 0 0; font-size: 16px;">Your journey to an amazing website starts here</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hello! 👋<br><br>
                  Thank you so much for booking a <strong>${packageName}</strong>! We're genuinely excited to connect with you and discuss your web development vision.
                </p>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; font-style: italic;">
                    💡 <strong>Fun fact:</strong> While you wait for our call, your future website is already dreaming about how awesome it's going to be. It told me it wants a "cool vibe" — whatever that means! 😄
                  </p>
                </div>

                <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
                  <h2 style="color: #15803d; margin: 0 0 15px 0; font-size: 18px;">📅 What's Next?</h2>
                  ${bookingLink ? `
                  <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.8;">
                    Pick a date and time for your <strong>${callMinutes}-minute consultation call</strong>. The times are shown in your own time zone.
                  </p>
                  <div style="text-align: center; margin: 20px 0 8px 0;">
                    <a href="${escapeHtml(bookingLink)}" style="display: inline-block; background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Pick a time</a>
                  </div>
                  <p style="color: #6b7280; margin: 12px 0 0 0; font-size: 12px; line-height: 1.6;">
                    Keep this email: the same button lets you reschedule or cancel later. If the button doesn't work, copy and paste this link into your browser: <a href="${escapeHtml(bookingLink)}" style="color: #00539c; word-break: break-all;">${escapeHtml(bookingLink)}</a>
                  </p>` : `
                  <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.8;">
                    We're preparing your <strong>${callMinutes}-minute consultation call</strong>! Shortly, you'll receive another email with a <strong>calendar link</strong> where you can select a date and time that works best for you.
                  </p>
                  <p style="color: #374151; margin: 15px 0 0 0; font-size: 14px; line-height: 1.8;">
                    Once you pick your slot, we'll send a meeting invite to <strong>${customerEmail}</strong> with all the details you need.
                  </p>`}
                </div>

                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px;">🎯 Booking Summary</h2>
                  <table style="width: 100%; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Package:</td>
                      <td style="padding: 8px 0; color: #374151; font-weight: bold; text-align: right;">${packageName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                      <td style="padding: 8px 0; color: #15803d; font-weight: bold; text-align: right;">€${totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Call Duration:</td>
                      <td style="padding: 8px 0; color: #374151; font-weight: bold; text-align: right;">${callMinutes} minutes</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Got questions before our call? Feel free to reply to this email — we're always happy to chat!
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://swapnilsrivastava.eu" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Explore Our Work</a>
                </div>

                <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">
                  Can't wait to turn your ideas into pixels! ✨
                </p>
              </div>
              <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Swapnil's Odyssey. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Admin email template - CART orders
        const cartAdminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">💰 New Order Received!</h1>
                <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">Ka-ching! Time to celebrate!</p>
              </div>
              <div style="padding: 30px;">
                ${shortfallWarningHtml(stockShortfalls)}
                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">👤 Customer Information</h2>
                  <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>User ID:</strong> ${userId || 'Guest'}</p>
                </div>
                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #5469d4;">
                  <h2 style="color: #5469d4; margin: 0 0 15px 0; font-size: 18px;">💳 Payment Information</h2>
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background-color: #5469d4; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">STRIPE</span>
                  </div>
                  <p style="color: #374151; margin: 10px 0 5px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #6b7280;">Transaction ID:</p>
                  <div style="background-color: #f3f4f6; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #1f2937; word-break: break-all;">
                    ${session.payment_intent}
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

        // Admin email template - SERVICE PACKAGE orders
        const servicePackageAdminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${bookingLink ? '📅 New Consultation' : '📅 ACTION REQUIRED'}</h1>
                <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">${bookingLink ? 'The buyer picks their own time' : 'New Consultation Booking - Send Calendar Invite!'}</p>
              </div>
              <div style="padding: 30px;">
                
                <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 2px solid #fca5a5;">
                  ${bookingLink ? `
                  <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Nothing to do yet</h2>
                  <p style="color: #7f1d1d; margin: 0; font-size: 15px; line-height: 1.6;">
                    ${customerEmail ? 'The customer got a link to book' : 'There was no customer email, so forward this link to the customer to book'} their <strong>${callMinutes}-minute consultation call</strong>. You'll get another email with an invite once they pick a time.
                  </p>
                  ${customerEmail ? '' : `<p style="color: #7f1d1d; margin: 15px 0 0 0; font-size: 13px; word-break: break-all;">${escapeHtml(bookingLink)}</p>`}` : `
                  <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">⚡ Immediate Action Needed</h2>
                  <p style="color: #7f1d1d; margin: 0; font-size: 15px; line-height: 1.6;">
                    This customer has booked a <strong>${packageName}</strong> and is waiting for a calendar invite to schedule their <strong>${callMinutes}-minute consultation call</strong>.${bookingLinkFailed ? ' Creating their booking link failed, so it was not sent.' : ''}
                  </p>
                  <p style="color: #7f1d1d; margin: 15px 0 0 0; font-size: 15px; font-weight: bold;">
                    📧 Please send the calendar scheduling link to: <span style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px;">${customerEmail}</span>
                  </p>`}
                </div>

                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">👤 Customer Information</h2>
                  <table style="width: 100%; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                      <td style="padding: 8px 0; color: #374151; font-weight: bold;">${customerEmail || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">User ID:</td>
                      <td style="padding: 8px 0; color: #374151;">${userId || 'Guest'}</td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #7c3aed;">
                  <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px;">🎯 Booking Details</h2>
                  <table style="width: 100%; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Package:</td>
                      <td style="padding: 8px 0; color: #374151; font-weight: bold;">${packageName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                      <td style="padding: 8px 0; color: #15803d; font-weight: bold;">€${totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Call Duration:</td>
                      <td style="padding: 8px 0; color: #374151; font-weight: bold;">${callMinutes} minutes</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Package ID:</td>
                      <td style="padding: 8px 0; color: #374151; font-family: monospace;">${sessionMetadata.package_id || 'N/A'}</td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #5469d4;">
                  <h2 style="color: #5469d4; margin: 0 0 15px 0; font-size: 18px;">💳 Payment Information</h2>
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background-color: #5469d4; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">STRIPE</span>
                    <span style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 8px;">SERVICE PACKAGE</span>
                  </div>
                  <p style="color: #374151; margin: 10px 0 5px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #6b7280;">Transaction ID:</p>
                  <div style="background-color: #f3f4f6; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #1f2937; word-break: break-all;">
                    ${session.payment_intent}
                  </div>
                </div>

                <div style="background-color: #fffbeb; border-radius: 12px; padding: 15px; text-align: center;">
                  <p style="color: #92400e; margin: 0; font-size: 13px;">
                    💡 <strong>Tip:</strong> Respond within 24 hours to maintain a great customer experience!
                  </p>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Booking received at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Select appropriate email templates based on order type
        const customerEmailHtml = orderType === 'service_package' 
          ? servicePackageCustomerEmailHtml 
          : cartCustomerEmailHtml;
        
        const adminEmailHtml = orderType === 'service_package' 
          ? servicePackageAdminEmailHtml 
          : cartAdminEmailHtml;

        // Customer email subject and text based on order type
        const customerEmailSubject = orderType === 'service_package'
          ? (bookingLink ? `Next step: pick a time for your ${/call$/i.test(packageName) ? packageName : `${packageName} call`}` : `🚀 Consultation Booked! - ${packageName} - Swapnil's Odyssey`)
          : "🎉 Your Order is Confirmed! - Swapnil's Odyssey";

        const customerEmailText = orderType === 'service_package'
          ? `${bookingLink ? 'Payment received – now pick your call time' : 'Consultation Booked!'}\n\nThank you for booking ${packageName}!\n\nWhat's Next:\n${bookingLink ? `Pick a date and time for your ${callMinutes}-minute consultation call (times are shown in your own time zone):\n${bookingLink}\n\nKeep this email: the same link lets you reschedule or cancel later.` : `We're preparing your ${callMinutes}-minute consultation call. Shortly, you'll receive another email with a calendar link where you can select a date and time that works best for you.`}\n\nBooking Summary:\nPackage: ${packageName}\nAmount Paid: €${totalAmount.toFixed(2)}\nCall Duration: ${callMinutes} minutes\n\nCan't wait to turn your ideas into pixels!\n\nVisit us at https://swapnilsrivastava.eu`
          : `Order Confirmed!\n\nThank you for your purchase!\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}\n\nVisit us at https://swapnilsrivastava.eu`;

        // Admin email subject and text based on order type
        const stockNoteText = shortfallWarningText(stockShortfalls);
        const adminEmailSubject = orderType === 'service_package'
          ? `${bookingLink ? '📅 New Consultation' : '📅 ACTION REQUIRED: New Consultation Booking'} - ${packageName} - €${totalAmount.toFixed(2)}`
          : `${stockNoteText ? '⚠️ OVERSOLD: ' : ''}💰 New Order Received - €${totalAmount.toFixed(2)}`;

        const adminEmailText = orderType === 'service_package'
          ? `${bookingLink ? `New Consultation Booking\n\nThe customer picks their own time for their ${callMinutes}-minute call. You'll get an invite once they book.${customerEmail ? '' : `\nThere was no customer email, so forward this link: ${bookingLink}`}` : `ACTION REQUIRED: New Consultation Booking!\n\n⚡ This customer needs a calendar invite for their ${callMinutes}-minute consultation call!${bookingLinkFailed ? ' Creating their booking link failed.' : ''}`}\n\nCustomer Email: ${customerEmail || 'Not provided'}\nUser ID: ${userId || 'N/A'}\n\nBooking Details:\nPackage: ${packageName}\nAmount Paid: €${totalAmount.toFixed(2)}\nCall Duration: ${callMinutes} minutes\nPackage ID: ${sessionMetadata.package_id || 'N/A'}${bookingLink ? '' : `\n\nPlease send the calendar scheduling link to: ${customerEmail}`}`
          : `New Order Received!\n\nCustomer: ${customerEmail || 'Guest'}\nUser ID: ${userId || 'N/A'}\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}${stockNoteText ? `\n\n${stockNoteText}` : ''}`;

        // Send email to customer
        if (customerEmail) {
          try {
            await postMarkClient.sendEmail({
              From: process.env.EMAIL,
              To: customerEmail,
              Subject: customerEmailSubject,
              HtmlBody: customerEmailHtml,
              TextBody: customerEmailText,
              MessageStream: "outbound",
            });
            console.log(`✅ Customer email sent to: ${customerEmail} (type: ${orderType})`);
          } catch (emailError) {
            console.error('❌ Error sending customer email:', emailError);
          }
        }

        // Send email to admin
        try {
          await postMarkClient.sendEmail({
            From: process.env.EMAIL,
            To: "contact@swapnilsrivastava.eu",
            Subject: adminEmailSubject,
            HtmlBody: adminEmailHtml,
            TextBody: adminEmailText,
            MessageStream: "outbound",
          });
          console.log(`✅ Admin email sent (type: ${orderType})`);
        } catch (emailError) {
          console.error('❌ Error sending admin email:', emailError);
        }

        await sendLowStockEmail(lowStock);

      } catch (error) {
        // A non-2xx response makes Stripe retry the event (for up to 3 days),
        // so an order that failed to save is not lost
        console.error('Error processing checkout session:', error);
        res.status(500).json({ received: false, message: error.message });
        return;
      }
    }

    // A full or partial refund from the Stripe dashboard. Needs charge.refunded
    // turned on for this endpoint in Stripe (Developers → Webhooks).
    if (event.type === 'charge.refunded') {
      try {
        await handleChargeRefunded(event.data.object as Stripe.Charge);
      } catch (error) {
        // A 500 makes Stripe retry; mark_order_refunded is safe to repeat
        console.error('Error processing refund:', error);
        res.status(500).json({ received: false, message: error.message });
        return;
      }
      res.json({ received: true });
      return;
    }

    if (event.type === 'customer.subscription.updated') {
      // Handle subscription update logic here
    }

    if (event.type === 'customer.subscription.deleted') {
      // Handle subscription deletion logic here
    }

    if (event.type === 'payment_intent.succeeded') {
      const stripeObject: Stripe.PaymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💰 PaymentIntent status: ${stripeObject.status}`);
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      console.log(`💵 Charge id: ${charge.id}`);
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    res.json({received: true});
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

/** The promotion code the buyer typed at checkout, e.g. "WELCOME10", or null */
async function promotionCodeOf(stripe: Stripe, sessionId: string): Promise<string | null> {
  try {
    const full = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['total_details.breakdown'] });
    for (const { discount } of full.total_details?.breakdown?.discounts ?? []) {
      const promo = discount.promotion_code;
      if (!promo) continue;
      if (typeof promo !== 'string') return promo.code;
      return (await stripe.promotionCodes.retrieve(promo)).code;
    }
  } catch (error) {
    // The order matters more than the code's name
    console.error(`Promotion code for session ${sessionId} could not be read:`, error);
  }
  return null;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    req.on('data', (chunk: Uint8Array) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
};

export default handler;