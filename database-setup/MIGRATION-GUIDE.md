# Database Migration: Add Payment Tracking Fields

## Changes Made

### 1. Database Schema
Added two new columns to the `orders` table:
- `payment_method` (TEXT) - Stores 'stripe' or 'paypal'
- `payment_intent_id` (TEXT) - Stores the transaction ID from the payment provider

### 2. Code Updates
- ✅ `database.types.ts` - Updated TypeScript types
- ✅ `pages/api/webhook.ts` - Stripe webhook now saves payment method
- ✅ `pages/api/paypal-capture.ts` - Already configured correctly

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `database-setup/add-payment-fields.sql`
5. Click **Run** or press `Ctrl+Enter`
6. Verify success message

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the SQL file directly
psql <your-database-url> -f database-setup/add-payment-fields.sql
```

## Verification

After running the migration, you can verify it worked:

```sql
-- Check the columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('payment_method', 'payment_intent_id');

-- Check existing orders
SELECT id, payment_method, payment_intent_id, total, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
```

## Expected Results

### Before Migration:
```
orders table:
- id
- user_id
- total
- status
- created_at
```

### After Migration:
```
orders table:
- id
- user_id
- total
- status
- created_at
- payment_method  ← NEW
- payment_intent_id  ← NEW
```

## What This Enables

✅ Track which payment method was used (Stripe vs PayPal)
✅ Store payment provider transaction IDs for refunds/disputes
✅ Better analytics and reporting
✅ Easier debugging of payment issues
✅ Ability to look up orders by payment provider ID

## Next Steps

1. **Run the migration** using one of the methods above
2. **Test a payment** - Make a test purchase with PayPal
3. **Verify the data** - Check that the order has `payment_method: 'paypal'`
4. **Test Stripe too** - Verify Stripe payments also save correctly
5. **Commit the changes** - Push the updated code to your repository

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Remove the columns
ALTER TABLE orders 
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS payment_intent_id;

-- Remove the index
DROP INDEX IF EXISTS idx_orders_payment_intent_id;
```

## Notes

- Existing orders will have `NULL` for these new fields (that's okay)
- New orders from both Stripe and PayPal will have these fields populated
- The migration is safe and won't affect existing data
