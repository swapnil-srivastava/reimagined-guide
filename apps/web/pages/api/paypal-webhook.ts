// pages/api/paypal-webhook.ts
//
// PayPal refunds and disputes. Set up in the PayPal developer dashboard
// (Apps & Credentials → the app → Webhooks): URL https://<site>/api/paypal-webhook,
// events PAYMENT.CAPTURE.REFUNDED, CUSTOMER.DISPUTE.CREATED and
// CUSTOMER.DISPUTE.RESOLVED, and its Webhook ID saved as PAYPAL_WEBHOOK_ID.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getPaypalCapture, verifyPaypalWebhook } from '../../lib/server/paypal';
import { recordRefund } from '../../lib/server/refunds';
import { handlePaypalDispute } from '../../lib/server/disputes';

export const config = {
  api: {
    // PayPal signs the exact bytes it sent
    bodyParser: false,
  },
};

const MAX_BODY = 256 * 1024;

async function readBody(req: NextApiRequest): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('Body too large');
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** The capture a refund belongs to, from its "up" link */
function captureIdOf(refund: any): string | null {
  const up = (refund?.links ?? []).find((link: any) => link?.rel === 'up')?.href;
  const match = typeof up === 'string' ? up.match(/\/captures\/([A-Za-z0-9-]+)$/) : null;
  return match ? match[1] : null;
}

async function handleRefund(refund: any) {
  const captureId = captureIdOf(refund);
  if (!captureId) throw new Error(`Refund ${refund?.id} has no capture link`);
  // The capture's own status says whether it is now fully refunded
  const capture = await getPaypalCapture(captureId);
  const paid = Number(capture.amount?.value) || 0;
  const refunded = Number(refund?.seller_payable_breakdown?.total_refunded_amount?.value ?? refund?.amount?.value) || 0;
  await recordRefund({
    provider: 'PayPal',
    paymentRef: captureId,
    findBy: captureId,
    refunded,
    paid,
    full: capture.status === 'REFUNDED' || (paid > 0 && refunded >= paid),
    refundRef: String(refund?.id ?? captureId),
    customer: null,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let raw: string;
  let event: any;
  try {
    raw = await readBody(req);
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ received: false });
  }

  try {
    if (!(await verifyPaypalWebhook(req.headers, raw))) {
      console.warn(`PayPal webhook ${event?.id}: signature not verified`);
      return res.status(400).json({ received: false });
    }
  } catch (error) {
    // Configuration or PayPal itself; a 500 makes PayPal retry
    console.error('PayPal webhook verification failed:', error);
    return res.status(500).json({ received: false });
  }

  try {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleRefund(event.resource);
        break;
      case 'CUSTOMER.DISPUTE.CREATED':
      case 'CUSTOMER.DISPUTE.RESOLVED':
        if (event.resource?.dispute_id) {
          await handlePaypalDispute(event.resource, event.event_type === 'CUSTOMER.DISPUTE.RESOLVED');
        }
        break;
      default:
        console.warn(`PayPal webhook: unhandled event type ${event.event_type}`);
    }
  } catch (error) {
    // A 500 makes PayPal retry; both database calls are safe to repeat
    console.error(`PayPal webhook ${event.event_type} failed:`, error);
    return res.status(500).json({ received: false });
  }

  return res.status(200).json({ received: true });
}
