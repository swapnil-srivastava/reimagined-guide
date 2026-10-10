// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { getAuthedRequest } from '../../lib/server/supabase-user';

// Sends an SMS from the site's Twilio number. Only the signed-in admin may use
// it, so nobody else can send texts (and run up the Twilio bill) through it.
export default async function sendMessage(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authed = await getAuthedRequest(req);
  if (!authed || authed.user.id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }

  const { phone, message } = req.body ?? {};
  if (typeof phone !== 'string' || !/^\+[1-9]\d{6,14}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Phone must be in E.164 format, e.g. +491512345678.' });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 480) {
    return res.status(400).json({ success: false, message: 'Message must be 1 to 480 characters.' });
  }

  const accountSid = <string>process.env.TWILIO_ACCOUNT_SID;
  const token = <string>process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, token);

  try {
    await client.messages.create({
      body: message,
      from: '+15672020719',
      to: phone,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(502).json({ success: false });
  }
}
