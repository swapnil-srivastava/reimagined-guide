// PayPal REST calls the webhook needs. Checkout and capture use the
// @paypal/checkout-server-sdk client instead (pages/api/paypal-*.ts).

export const paypalMode = () => (process.env.PAYPAL_MODE?.toLowerCase() === "live" ? "live" : "sandbox");

const apiBase = () => (paypalMode() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

/** Where the admin answers a PayPal dispute */
export const paypalResolutionCenterUrl = () =>
  paypalMode() === "live" ? "https://www.paypal.com/resolutioncenter" : "https://www.sandbox.paypal.com/resolutioncenter";

async function accessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials are not configured");
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error(`PayPal token request failed: ${response.status}`);
  const { access_token } = (await response.json()) as { access_token: string };
  return access_token;
}

async function paypalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`PayPal ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

const header = (headers: Record<string, string | string[] | undefined>, name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Asks PayPal whether a webhook call really came from PayPal for our webhook
 * (PAYPAL_WEBHOOK_ID). The raw body is sent as it arrived, because PayPal
 * signs the exact bytes and re-serialising the JSON can change them.
 */
export async function verifyPaypalWebhook(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured");

  const fields = {
    auth_algo: header(headers, "paypal-auth-algo"),
    cert_url: header(headers, "paypal-cert-url"),
    transmission_id: header(headers, "paypal-transmission-id"),
    transmission_sig: header(headers, "paypal-transmission-sig"),
    transmission_time: header(headers, "paypal-transmission-time"),
    webhook_id: webhookId,
  };
  if (Object.values(fields).some((value) => !value)) return false;

  const body = `${JSON.stringify(fields).slice(0, -1)},"webhook_event":${rawBody}}`;
  const result = await paypalFetch<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body,
  });
  return result.verification_status === "SUCCESS";
}

export interface PaypalCapture {
  id: string;
  status: string;
  amount: { value: string; currency_code: string };
}

export const getPaypalCapture = (captureId: string) =>
  paypalFetch<PaypalCapture>(`/v2/payments/captures/${encodeURIComponent(captureId)}`);
