// pages/api/checkout.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendServerEmail } from "../../services/email.service";
import * as postmark from "postmark";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET;


  

  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      const body = await buffer(req);
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // Handle 'checkout.session.completed' logic here
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("checkout session completed ===> ", session);
    }

    if (event.type === 'customer.subscription.updated') {
      // Handle subscription update logic here
    }

    if (event.type === 'customer.subscription.deleted') {
      // Handle subscription deletion logic here
    }

    // Cast event data to Stripe object
    if (event.type === 'payment_intent.succeeded') {
      const stripeObject: Stripe.PaymentIntent = event.data
        .object as Stripe.PaymentIntent;

        const emailMessage: Partial<postmark.Message> = {
          To: "contact@swapnilsrivastava.eu",
          Subject: "Payment received hurray - payment_intent.succeeded",
          HtmlBody: `<strong>Hello</strong> Swapnil Srivastava, payment has been received through webhook`,
        };
      
        sendServerEmail(emailMessage);

      console.log(`💰 PaymentIntent status: ${stripeObject.status}`);
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      console.log(`💵 Charge id: ${charge.id}`);
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
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
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
};

export default handler;