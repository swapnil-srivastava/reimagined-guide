// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = {
    api: {
      bodyParser: false,
    },
};  

function getRawBody(req: NextApiRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      req.on('error', reject);
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
      const buf = await getRawBody(req);
      const sig = req.headers['stripe-signature'] as string;
      
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ message: 'Webhook Error' });
      }
  
      // Handle 'checkout.session.completed' logic here
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log("checkout session completed ===> ", session);

        const userId = session.metadata?.user_id;
  
        // const { error } = await supabaseAdmin
        //   .from('stripe_customers')
        //   .upsert({ 
        //     user_id: userId, 
        //     stripe_customer_id: session.customer as string, 
        //     plan_active: true, 
        //     plan_expires: null 
        //   });
  
        // if (error) {
        //   console.error('Error updating stripe_customers:', error);
        //   return res.status(500).json({ message: 'Internal Server Error' });
        // }
      }
  
      if (event.type === 'customer.subscription.updated') {
        // Handle subscription update logic here
      }
  
      if (event.type === 'customer.subscription.deleted') {
        // Handle subscription deletion logic here
      }
  
      return res.status(200).json({ message: 'success' });
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}