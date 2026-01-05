-- Migration: Add payment tracking fields to orders table
-- Created: 2026-01-04
-- Purpose: Track payment method (stripe/paypal) and payment provider transaction ID

-- Add payment method and payment intent ID columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Add index on payment_intent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: stripe, paypal, etc.';
COMMENT ON COLUMN orders.payment_intent_id IS 'Payment provider transaction/intent ID';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('payment_method', 'payment_intent_id');
