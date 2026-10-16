-- Stripe refunds, the admin products page and low-stock emails.
--
--   1. products.low_stock_threshold, and price must be above 0
--   2. Admins (is_admin()) add, edit and delete products, instead of one
--      hard-coded user id
--   3. save_order_items() also reports products that just went low on stock
--   4. admin_update_product(): the products page saves a product, with
--      stock as a change (+3, -1), so a sale meanwhile is never overwritten
--   5. mark_order_refunded(): the Stripe webhook marks an order refunded,
--      puts a fully refunded order's stock back once, and switches off its
--      booking link and upcoming calls (cancelled_by = 'refund')
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code
-- that uses it. It is safe to run with the old code live.

-- =====================================================
-- STEP 1: Products
-- =====================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 3;

COMMENT ON COLUMN public.products.low_stock_threshold IS
  'Email the admin when a sale takes stock to this number or below. 0 = only when sold out.';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_low_stock_threshold_range;
ALTER TABLE public.products
  ADD CONSTRAINT products_low_stock_threshold_range CHECK (low_stock_threshold BETWEEN 0 AND 1000000);

-- Every product had a price above 0 when this was written
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE public.products
  ADD CONSTRAINT products_price_positive CHECK (price > 0);

-- =====================================================
-- STEP 2: Admins manage products
-- =====================================================
-- The old policies allowed one hard-coded user id. Reading stays open to all.
DROP POLICY IF EXISTS "Enable insert for particular users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.products;

DROP POLICY IF EXISTS "Admins can add products" ON public.products;
CREATE POLICY "Admins can add products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can edit products" ON public.products;
CREATE POLICY "Admins can edit products"
  ON public.products FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- =====================================================
-- STEP 3: save_order_items() reports low stock
-- =====================================================
-- Same as 20261011090000, and it also returns low_stock: the products this
-- order took from above their low_stock_threshold to at or below it. Only
-- that crossing counts, so the admin gets one email per product, not one
-- per sale, until it is restocked above the threshold.
CREATE OR REPLACE FUNCTION public.save_order_items(p_order_id UUID, p_items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_item RECORD;
  v_in_stock INTEGER;
  v_name TEXT;
  v_threshold INTEGER;
  v_left INTEGER;
  v_shortfalls JSONB := '[]'::jsonb;
  v_low_stock JSONB := '[]'::jsonb;
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
    SELECT stock, name, low_stock_threshold INTO v_in_stock, v_name, v_threshold
    FROM public.products
    WHERE id = v_item.product_id
    FOR NO KEY UPDATE;

    CONTINUE WHEN NOT FOUND;

    v_left := GREATEST(v_in_stock - v_item.quantity, 0);

    UPDATE public.products
    SET stock = v_left
    WHERE id = v_item.product_id;

    IF v_in_stock < v_item.quantity THEN
      v_shortfalls := v_shortfalls || jsonb_build_object(
        'product_id', v_item.product_id,
        'name', v_name,
        'ordered', v_item.quantity,
        'in_stock', v_in_stock
      );
    END IF;

    IF v_in_stock > v_threshold AND v_left <= v_threshold THEN
      v_low_stock := v_low_stock || jsonb_build_object(
        'product_id', v_item.product_id,
        'name', v_name,
        'stock', v_left,
        'threshold', v_threshold
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_shortfalls) > 0 THEN
    UPDATE public.orders
    SET metadata = COALESCE(metadata, '{}'::jsonb)
      || jsonb_build_object('stock_shortfall', v_shortfalls)
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object('shortfalls', v_shortfalls, 'low_stock', v_low_stock);
END;
$$;

REVOKE ALL ON FUNCTION public.save_order_items(UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_order_items(UUID, JSONB) TO service_role;

-- =====================================================
-- STEP 4: admin_update_product()
-- =====================================================
-- Runs as the signed-in admin, so the row level security above applies.
-- Stock is changed by p_stock_change, not set, so a sale between opening
-- the form and saving it is kept. Stock can't go below 0 (the CHECK).
-- Returns the updated row, or nothing if the product no longer exists.
CREATE OR REPLACE FUNCTION public.admin_update_product(
  p_product_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_low_stock_threshold INTEGER,
  p_stock_change INTEGER DEFAULT 0
)
RETURNS SETOF public.products
LANGUAGE sql
SET search_path = ''
AS $$
  UPDATE public.products
  SET name = p_name,
      description = p_description,
      price = p_price,
      low_stock_threshold = p_low_stock_threshold,
      stock = stock + p_stock_change
  WHERE id = p_product_id
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.admin_update_product(UUID, TEXT, TEXT, NUMERIC, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_product(UUID, TEXT, TEXT, NUMERIC, INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- STEP 5: Calls cancelled by a refund
-- =====================================================
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_cancelled_by_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_cancelled_by_check CHECK (cancelled_by IN ('invitee', 'host', 'refund'));

-- =====================================================
-- STEP 6: mark_order_refunded()
-- =====================================================
-- Called by the Stripe webhook on charge.refunded with the charge's total
-- refunded so far (in euros). Stripe retries webhooks and sends one event per
-- refund, so this is safe to call any number of times, in any order:
--   - a full refund sets status 'refunded' and puts every product of the
--     order back into stock, once (metadata.restocked_at marks it done). An
--     oversold product only gets back what the sale actually took
--     (metadata.stock_shortfall), so restocking never invents stock
--   - a partial refund sets 'partially_refunded' and leaves stock alone,
--     because Stripe doesn't say which items were refunded; it never
--     downgrades an order that is already 'refunded'
--   - with p_cancel_bookings, a full refund also switches off the order's
--     booking links and cancels its upcoming calls (cancelled_by 'refund'),
--     once
-- Returns what changed, so the webhook only emails about new changes:
--   { found, status, amount_refunded, changed,
--     restocked: [{product_id, name, quantity, stock}],
--     cancelled_bookings: [bookings row, ...], links_revoked }
CREATE OR REPLACE FUNCTION public.mark_order_refunded(
  p_order_id UUID,
  p_amount_refunded NUMERIC,
  p_full BOOLEAN,
  p_refund_ref TEXT DEFAULT NULL,
  p_cancel_bookings BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_order public.orders;
  v_status TEXT;
  v_amount NUMERIC;
  v_item RECORD;
  v_restocked JSONB := '[]'::jsonb;
  v_cancelled JSONB := '[]'::jsonb;
  v_links INTEGER := 0;
  v_row JSONB;
  v_metadata JSONB;
BEGIN
  IF p_amount_refunded IS NULL OR p_amount_refunded < 0 THEN
    RAISE EXCEPTION 'Invalid refund amount %', p_amount_refunded USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  v_metadata := COALESCE(v_order.metadata, '{}'::jsonb);
  v_amount := GREATEST(p_amount_refunded, COALESCE((v_metadata->>'amount_refunded')::numeric, 0));
  v_status := CASE
    WHEN p_full OR v_order.status = 'refunded' THEN 'refunded'
    ELSE 'partially_refunded'
  END;

  IF p_full AND NOT (v_metadata ? 'restocked_at') THEN
    -- Same lock order as save_order_items(), so the two can't deadlock
    FOR v_item IN
      SELECT oi.product_id, oi.quantity - COALESCE(s.ordered - s.in_stock, 0) AS quantity
      FROM (
        SELECT product_id, SUM(quantity)::integer AS quantity
        FROM public.order_items
        WHERE order_id = p_order_id AND product_id IS NOT NULL
        GROUP BY product_id
      ) oi
      LEFT JOIN jsonb_to_recordset(COALESCE(v_order.metadata->'stock_shortfall', '[]'::jsonb))
        AS s(product_id UUID, ordered INTEGER, in_stock INTEGER)
        ON s.product_id = oi.product_id
      ORDER BY oi.product_id
    LOOP
      CONTINUE WHEN v_item.quantity <= 0;
      UPDATE public.products
      SET stock = stock + v_item.quantity
      WHERE id = v_item.product_id
      RETURNING jsonb_build_object(
        'product_id', id, 'name', name, 'quantity', v_item.quantity, 'stock', stock
      ) INTO v_row;
      IF FOUND THEN
        v_restocked := v_restocked || v_row;
      END IF;
    END LOOP;
    v_metadata := v_metadata || jsonb_build_object('restocked_at', now(), 'restocked', v_restocked);
  END IF;

  IF p_full AND p_cancel_bookings AND NOT (v_metadata ? 'bookings_cancelled_at') THEN
    UPDATE public.booking_entitlements
    SET revoked_at = now()
    WHERE order_id = p_order_id AND revoked_at IS NULL;
    GET DIAGNOSTICS v_links = ROW_COUNT;

    WITH cancelled AS (
      UPDATE public.bookings
      SET status = 'cancelled',
          cancelled_by = 'refund',
          cancel_reason = 'Order refunded',
          cancelled_at = now()
      WHERE order_id = p_order_id AND status = 'confirmed' AND starts_at > now()
      RETURNING *
    )
    SELECT COALESCE(jsonb_agg(to_jsonb(cancelled) ORDER BY starts_at), '[]'::jsonb)
    INTO v_cancelled
    FROM cancelled;

    IF v_links > 0 OR jsonb_array_length(v_cancelled) > 0 THEN
      v_metadata := v_metadata || jsonb_build_object('bookings_cancelled_at', now());
    END IF;
  END IF;

  v_metadata := v_metadata || jsonb_build_object(
    'amount_refunded', v_amount,
    'refunded_at', now()
  ) || CASE WHEN p_refund_ref IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('refund_ref', p_refund_ref) END;

  UPDATE public.orders
  SET status = v_status, metadata = v_metadata
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'found', true,
    'status', v_status,
    'amount_refunded', v_amount,
    'changed', v_status IS DISTINCT FROM v_order.status
      OR v_amount IS DISTINCT FROM COALESCE((v_order.metadata->>'amount_refunded')::numeric, 0)
      OR jsonb_array_length(v_restocked) > 0
      OR jsonb_array_length(v_cancelled) > 0
      OR v_links > 0,
    'restocked', v_restocked,
    'cancelled_bookings', v_cancelled,
    'links_revoked', v_links
  );
END;
$$;

-- Only the server (service role) may mark orders refunded
REVOKE ALL ON FUNCTION public.mark_order_refunded(UUID, NUMERIC, BOOLEAN, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_refunded(UUID, NUMERIC, BOOLEAN, TEXT, BOOLEAN) TO service_role;
