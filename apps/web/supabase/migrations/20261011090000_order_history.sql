-- Order history for customers (/orders) and admins (/admin).
--
-- Customers can already read their own orders and items. This adds:
--   1. Admins (app_admins) can read every order and its items.
--   2. order_items.name, so tax, delivery and service package rows (which
--      have no product) show what they were. save_order_items() saves it.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code
-- that reads order_items.name. It is safe to run with the old code live.

-- =====================================================
-- STEP 1: Item names
-- =====================================================
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS name TEXT;

COMMENT ON COLUMN public.order_items.name IS
  'What was bought, as shown at checkout (product name, Tax, Delivery, package name). Null on items saved before 2026-10-11.';

-- Same as 20261010230000 except that each item's name is saved too
CREATE OR REPLACE FUNCTION public.save_order_items(p_order_id UUID, p_items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_item RECORD;
  v_in_stock INTEGER;
  v_name TEXT;
  v_shortfalls JSONB := '[]'::jsonb;
BEGIN
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order % has no items', p_order_id;
  END IF;

  -- Locking the order makes parallel calls for the same order run one at a time
  PERFORM 1 FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.order_items WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'Order % already has items', p_order_id;
  END IF;

  INSERT INTO public.order_items (order_id, product_id, quantity, price, name)
  SELECT p_order_id, item.product_id, item.quantity, item.price, NULLIF(item.name, '')
  FROM jsonb_to_recordset(p_items) AS item(product_id UUID, quantity INTEGER, price NUMERIC, name TEXT);

  -- Products in id order, so two orders never lock the same rows in opposite
  -- order. NO KEY UPDATE (not UPDATE) because the order_items insert above
  -- already holds KEY SHARE on these rows, and a parallel order holding it
  -- too would otherwise deadlock with this one.
  FOR v_item IN
    SELECT product_id, SUM(quantity)::integer AS quantity
    FROM public.order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
    GROUP BY product_id
    ORDER BY product_id
  LOOP
    SELECT stock, name INTO v_in_stock, v_name
    FROM public.products
    WHERE id = v_item.product_id
    FOR NO KEY UPDATE;

    CONTINUE WHEN NOT FOUND;

    UPDATE public.products
    SET stock = GREATEST(stock - v_item.quantity, 0)
    WHERE id = v_item.product_id;

    IF v_in_stock < v_item.quantity THEN
      v_shortfalls := v_shortfalls || jsonb_build_object(
        'product_id', v_item.product_id,
        'name', v_name,
        'ordered', v_item.quantity,
        'in_stock', v_in_stock
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_shortfalls) > 0 THEN
    UPDATE public.orders
    SET metadata = COALESCE(metadata, '{}'::jsonb)
      || jsonb_build_object('stock_shortfall', v_shortfalls)
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object('shortfalls', v_shortfalls);
END;
$$;

REVOKE ALL ON FUNCTION public.save_order_items(UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_order_items(UUID, JSONB) TO service_role;

-- =====================================================
-- STEP 2: Admins can read all orders
-- =====================================================
-- The existing policies ("Enable read access for orders which are done by the
-- user only", "Allow users to read their own order items") stay: customers
-- still see only their own orders.
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;
CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Newest-first lists for one customer, and for the admin
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
