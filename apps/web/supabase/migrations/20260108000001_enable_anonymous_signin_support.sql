-- Migration: Enable Anonymous Sign-in Support
-- Description: Enable RLS on addresses table, update policies for anonymous users,
--              and add helper functions for anonymous user detection

-- =====================================================
-- STEP 1: Enable Row Level Security on addresses table
-- =====================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for addresses table
-- Anonymous and permanent users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON public.addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Both anonymous and permanent users can create addresses for themselves
CREATE POLICY "Users can create their own addresses"
ON public.addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Both anonymous and permanent users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON public.addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON public.addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- STEP 2: Create helper function to check anonymous status
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_anonymous_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((auth.jwt()->>'is_anonymous')::boolean, false);
$$;

COMMENT ON FUNCTION public.is_anonymous_user() IS 'Returns true if the current user is an anonymous user';

-- =====================================================
-- STEP 3: Add column to track anonymous orders
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'is_anonymous_order'
  ) THEN
    ALTER TABLE public.orders 
    ADD COLUMN is_anonymous_order BOOLEAN DEFAULT false;
    
    COMMENT ON COLUMN public.orders.is_anonymous_order IS 'Indicates if the order was created by an anonymous user';
  END IF;
END $$;

-- =====================================================
-- STEP 4: Update orders policies to support anonymous users
-- =====================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;

-- Allow authenticated users (including anonymous) to insert their own orders
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 5: Update order_items policies
-- =====================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.order_items;

-- Allow authenticated users to insert order items for their own orders
CREATE POLICY "Users can insert items for their own orders"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 6: Restrict posts creation to permanent users only
-- =====================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;

-- Create restrictive policy: only permanent users can create posts
CREATE POLICY "Only permanent users can create posts"
ON public.posts AS RESTRICTIVE FOR INSERT
TO authenticated
WITH CHECK (
  public.is_anonymous_user() = false
);

-- Permissive policy for authenticated users (works alongside restrictive)
CREATE POLICY "Authenticated users can insert posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uid);

-- =====================================================
-- STEP 7: Create profile for anonymous users (optional)
-- This allows anonymous users to have a basic profile
-- =====================================================
-- Update the handle_new_user function to create profiles for anonymous users too
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    CASE WHEN NEW.is_anonymous THEN NULL ELSE NEW.email END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- =====================================================
-- NOTES FOR ENABLING ANONYMOUS SIGN-IN:
-- =====================================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Providers
-- 3. Enable "Anonymous Sign-ins"
-- 4. Optionally configure rate limits in Auth > Rate Limits
-- 5. Consider enabling CAPTCHA to prevent abuse
-- =====================================================
