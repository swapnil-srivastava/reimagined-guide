-- Lower product stock when an order is paid.
--
-- Checkout only checks stock (lib/server/pricing.ts). After payment the Stripe
-- webhook and PayPal capture now save a cart order's items with
-- save_order_items(), which lowers stock in the same transaction, so items and
-- stock can never get out of step.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code
-- that calls save_order_items(). It is safe to run with the old code live.

-- =====================================================
-- STEP 1: Stock can never go below zero
-- =====================================================
UPDATE public.products SET stock = 0 WHERE stock < 0;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_stock_nonnegative;
ALTER TABLE public.products
  ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);

-- =====================================================
-- STEP 2: save_order_items(order_id, items)
-- =====================================================
-- p_items is a JSON array of {product_id, quantity, price}; product_id may be
-- null (tax, delivery). Inserts the items and subtracts each product's
-- quantity from its stock, all or nothing. An order's items can only be saved
-- once, so a retried payment event can't lower stock twice.
--
-- Payment has already been taken when this runs, so a product that sold out
-- in the meantime is set to 0 rather than failing. Such products are returned
-- as shortfalls (for the admin email) and kept in the order's
-- metadata.stock_shortfall.
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

  INSERT INTO public.order_items (order_id, product_id, quantity, price)
  SELECT p_order_id, item.product_id, item.quantity, item.price
  FROM jsonb_to_recordset(p_items) AS item(product_id UUID, quantity INTEGER, price NUMERIC);

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

-- Only the server (service role) may save order items and change stock this way
REVOKE ALL ON FUNCTION public.save_order_items(UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_order_items(UUID, JSONB) TO service_role;

-- =====================================================
-- STEP 3: Orders come from payments only
-- =====================================================
-- These policies let signed-in visitors (guests included) insert orders and
-- order items, so anyone could create a "completed" order at any price. The
-- site never does that from the browser: the webhook and PayPal capture insert
-- with the service role, which bypasses RLS. The live database has the first
-- pair; 20260108000001 would have replaced them with the second pair.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert items for their own orders" ON public.order_items;
