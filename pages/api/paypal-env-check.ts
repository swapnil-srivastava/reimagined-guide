// Diagnostic endpoint to check PayPal configuration in production
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  const diagnostics = {
    environment: process.env.NODE_ENV,
    hasClientId: !!clientId,
    hasSecret: !!clientSecret,
    clientIdLength: clientId ? clientId.length : 0,
    secretLength: clientSecret ? clientSecret.length : 0,
    clientIdPrefix: clientId ? clientId.substring(0, 10) + '...' : 'MISSING',
    secretPrefix: clientSecret ? clientSecret.substring(0, 10) + '...' : 'MISSING',
    // Check if they look like valid PayPal credentials
    clientIdFormat: clientId ? (clientId.length === 80 ? 'Valid length (80)' : `Invalid length (${clientId.length})`) : 'Missing',
    secretFormat: clientSecret ? (clientSecret.startsWith('E') ? 'Looks valid' : 'Unusual format') : 'Missing',
    expectedMode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX',
    // Security check
    timestamp: new Date().toISOString(),
  };
  
  res.status(200).json(diagnostics);
}
