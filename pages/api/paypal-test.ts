// pages/api/paypal-test.ts
// Diagnostic endpoint to verify PayPal credentials
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const publicClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const diagnostics = {
    hasClientId: !!clientId,
    hasSecret: !!clientSecret,
    hasPublicClientId: !!publicClientId,
    clientIdMatch: clientId === publicClientId,
    clientIdPrefix: clientId ? clientId.substring(0, 15) + '...' : 'MISSING',
    publicClientIdPrefix: publicClientId ? publicClientId.substring(0, 15) + '...' : 'MISSING',
    secretPrefix: clientSecret ? clientSecret.substring(0, 10) + '...' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    expectedMode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX',
  };

  // Security check: Don't expose actual credentials
  if (clientId && clientId.length > 20) {
    diagnostics.clientIdLength = clientId.length;
  }
  if (clientSecret && clientSecret.length > 20) {
    diagnostics.secretLength = clientSecret.length;
  }

  res.status(200).json(diagnostics);
}
