// pages/api/webhook.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import * as postmark from "postmark";
import { supaServerClient } from '../../supa-server-client';

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
        // Retrieve line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product'],
        });

        const userId = session.metadata?.user_id || null;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const totalAmount = (session.amount_total || 0) / 100;

        // Build order items HTML for email
        let orderItemsHtml = '';
        let orderItemsText = '';
        const orderItemsData: { name: string; quantity: number; price: number; product_id?: string }[] = [];

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

        // Save order to database
        if (supaServerClient && userId) {
          const { data: orderData, error: orderError } = await supaServerClient
            .from('orders')
            .insert({
              user_id: userId,
              total: totalAmount,
              status: 'completed',
              payment_method: 'stripe',
              payment_intent_id: session.payment_intent as string,
            })
            .select()
            .single();

          if (orderError) {
            console.error('Error creating order:', orderError);
          } else if (orderData) {
            console.log('Order created:', orderData.id);

            const orderItemsInsert = orderItemsData.map((item) => ({
              order_id: orderData.id,
              product_id: item.product_id || null,
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

        // Email template for customer
        const customerEmailHtml = `
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

        // Email template for admin
        const adminEmailHtml = `
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
                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">👤 Customer Information</h2>
                  <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>User ID:</strong> ${userId || 'Guest'}</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>Payment ID:</strong> ${session.payment_intent}</p>
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
        if (customerEmail) {
          try {
            await postMarkClient.sendEmail({
              From: process.env.EMAIL,
              To: customerEmail,
              Subject: "🎉 Your Order is Confirmed! - Swapnil's Odyssey",
              HtmlBody: customerEmailHtml,
              TextBody: `Order Confirmed!\n\nThank you for your purchase!\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}\n\nVisit us at https://swapnilsrivastava.eu`,
              MessageStream: "outbound",
            });
            console.log('✅ Customer email sent to:', customerEmail);
          } catch (emailError) {
            console.error('❌ Error sending customer email:', emailError);
          }
        }

        // Send email to admin
        try {
          await postMarkClient.sendEmail({
            From: process.env.EMAIL,
            To: "contact@swapnilsrivastava.eu",
            Subject: `💰 New Order Received - €${totalAmount.toFixed(2)}`,
            HtmlBody: adminEmailHtml,
            TextBody: `New Order Received!\n\nCustomer: ${customerEmail || 'Guest'}\nUser ID: ${userId || 'N/A'}\n\nOrder Details:\n${orderItemsText}\nTotal: €${totalAmount.toFixed(2)}`,
            MessageStream: "outbound",
          });
          console.log('✅ Admin email sent');
        } catch (emailError) {
          console.error('❌ Error sending admin email:', emailError);
        }

      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
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