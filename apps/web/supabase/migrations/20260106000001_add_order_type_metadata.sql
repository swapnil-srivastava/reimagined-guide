-- Migration: Add order_type and metadata columns to orders table
-- Purpose: Support both Cart and Service Package orders in a unified table
-- Created: 2026-01-06
-- 
-- Run this script in Supabase SQL Editor terminal

-- Add order_type column to distinguish between 'cart' and 'service_package' orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'cart';

-- Add metadata column to store additional order context (jsonb for flexibility)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index on order_type for faster filtering queries
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

-- Add comment for documentation
COMMENT ON COLUMN public.orders.order_type IS 'Type of order: cart (product purchases) or service_package (service bookings)';
COMMENT ON COLUMN public.orders.metadata IS 'Additional order metadata stored as JSON (e.g., package details, custom fields)';

-- Verify the changes (optional - comment out in production)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND table_schema = 'public';
