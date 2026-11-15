---
name: third-party-adapter
description: Use when adding or calling any outside provider on swapnilsrivastava.eu (video or audio calls, phone, SMS, WhatsApp, payments, email, storage). Swapnil's rule is that every provider sits behind our own interface so it can be swapped without breaking anything.
---

# Third-party services go behind an adapter

Rule (Swapnil, 2026-10-22): every third-party service sits behind our own adapter
interface, so it can be replaced by another provider without changing callers.

Chosen providers for the doctors' practice (primary / backup):

| Capability | Primary | Backup |
|---|---|---|
| Video + audio consults | 100ms | Daily |
| Phone calls | Plivo | Exotel |
| SMS (OTP, reminders; India DLT registration needed) | MSG91 | Exotel |
| WhatsApp | Gupshup | MSG91 |
| Payments (India, ₹) | Razorpay | |

Existing services already in use: Stripe and PayPal (shop, EUR), Postmark email
(`lib/server/mailer.ts`). Treat `sendMail()` as the pattern: one small function the
rest of the code calls.

## Shape

```
apps/web/lib/server/<capability>/
  types.ts        // our interface + our own types, no provider types leak out
  <provider>.ts   // one file per provider implementing the interface
  index.ts        // picks the provider from an env var, e.g. SMS_PROVIDER=msg91
```

- The interface is named for what we need (`sendOtp`, `createRoom`, `refund`), not
  for the provider's API.
- Callers import only from `index.ts`. Provider SDKs are imported only in the
  provider file.
- Inbound webhooks: one route per provider (`pages/api/<capability>/<provider>-webhook.ts`)
  that verifies the signature, then maps the payload to our own event type and calls
  shared handling code.
- Store our own ids in the database plus `provider` and `provider_ref` columns, never
  only the provider's id.
- Secrets come from env vars, added to `turbo.json` `globalEnv` and listed for
  Swapnil to set in Vercel. Never commit or print them.
- Add a fake provider for tests (`fake.ts`) and unit tests against the interface.
- Failures return a typed result instead of throwing into page code; log with the
  provider name.

## Before choosing or adding a provider

Check project memory and the doctors plan for an existing decision. If none exists,
compare at least two options on price in the target country, and ask Swapnil with a
decision card rather than picking silently.
