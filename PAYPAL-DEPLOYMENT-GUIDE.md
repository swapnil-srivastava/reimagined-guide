# PayPal Integration - Deployment Guide

## Problem
The PayPal integration works locally but fails in production with "invalid_client" error.

## Root Cause
Your production environment was trying to use **LIVE** PayPal mode with **SANDBOX** credentials.

## Solution
I've updated the code to use an explicit `PAYPAL_MODE` environment variable that defaults to sandbox.

---

## Environment Variables Required

### For Your Deployment Platform (Vercel/Netlify/etc.)

Add these **3 environment variables** to your production deployment:

```bash
# 1. PayPal Client ID (make it public - starts with NEXT_PUBLIC_)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# 2. PayPal Client Secret (keep private - NO NEXT_PUBLIC_ prefix)
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here

# 3. PayPal Mode (NEW - controls sandbox vs live)
PAYPAL_MODE=sandbox
```

---

## How to Get Your PayPal Credentials

### Option 1: Using Sandbox (Recommended for Testing)

1. Go to https://developer.paypal.com/dashboard/
2. Login with your PayPal account
3. Click **"Apps & Credentials"**
4. Make sure you're on the **"Sandbox"** tab
5. Find your app or click **"Create App"**
6. Copy the **Client ID** → Use for `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
7. Click **"Show"** under Secret → Use for `PAYPAL_CLIENT_SECRET`
8. Set `PAYPAL_MODE=sandbox`

### Option 2: Using Live (For Production Payments)

⚠️ **Only use this when ready to accept real payments!**

1. Go to https://developer.paypal.com/dashboard/
2. Switch to the **"Live"** tab
3. Create a live app or use existing one
4. Copy the **Live Client ID** → Use for `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
5. Copy the **Live Secret** → Use for `PAYPAL_CLIENT_SECRET`
6. Set `PAYPAL_MODE=live`

---

## Setting Environment Variables in Your Deployment

### If using Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all 3 variables above
5. **Redeploy** your application

### If using Netlify:
1. Go to https://app.netlify.com/
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add all 3 variables above
5. **Trigger a new deploy**

### If using other platforms:
- Add the 3 environment variables to your platform's configuration
- Make sure to redeploy after adding them

---

## Testing Your Deployment

### Step 1: Check Environment Variables
Visit this URL after deployment:
```
https://your-domain.com/api/paypal-env-check
```

You should see:
```json
{
  "hasClientId": true,
  "hasSecret": true,
  "clientIdLength": 80,
  "secretLength": 40,
  "expectedMode": "SANDBOX"
}
```

### Step 2: Test PayPal Checkout
1. Add items to cart
2. Go to checkout
3. Click the PayPal button
4. Login with PayPal sandbox account
5. Complete payment

---

## Troubleshooting

### Error: "invalid_client"
**Cause:** Client ID and Secret don't match or are from different apps

**Fix:**
- Go to PayPal Developer Dashboard
- Make sure BOTH credentials are from the SAME app
- Make sure you're using Sandbox credentials with `PAYPAL_MODE=sandbox`
- Redeploy after updating variables

### Error: "CURRENCY_NOT_SUPPORTED"
**Cause:** PayPal might not support EUR in your account

**Fix:**
- Try changing currency to USD in checkout page
- Or enable EUR in your PayPal account settings

### PayPal button doesn't show
**Cause:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is missing or wrong

**Fix:**
- Verify the Client ID starts with `NEXT_PUBLIC_`
- Make sure it's set as a public/client-side variable
- Redeploy after adding it

---

## Important Notes

1. **NEXT_PUBLIC_ prefix** is required for the Client ID to work in the browser
2. **PAYPAL_CLIENT_SECRET** must NOT have NEXT_PUBLIC_ prefix (it's server-only)
3. **Always redeploy** after changing environment variables
4. Use **Sandbox mode** for testing (free, uses test accounts)
5. Switch to **Live mode** only when ready for real payments

---

## Your Current Setup

Based on your `.env.local` file, you have:
- ✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID` configured
- ✅ `PAYPAL_CLIENT_SECRET` configured
- ⚠️ Need to add `PAYPAL_MODE=sandbox` to production

**Next Step:** Add `PAYPAL_MODE=sandbox` to your production environment variables and redeploy!
