-- Payment disputes (Stripe and PayPal chargebacks) and PayPal refunds.
--
--   1. Calls can be cancelled by a lost dispute (cancelled_by = 'dispute')
--   2. mark_order_disputed(): the Stripe and PayPal webhooks record a
--      dispute being opened, won or lost on its order
--
-- PayPal refunds use mark_order_refunded() from 20261015170000 unchanged.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code
-- that uses it. It is safe to run with the old code live.

-- =====================================================
-- STEP 1: Calls cancelled by a lost dispute
-- =====================================================
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_cancelled_by_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_cancelled_by_check CHECK (cancelled_by IN ('invitee', 'host', 'refund', 'dispute'));

-- =====================================================
-- STEP 2: mark_order_disputed()
-- =====================================================
-- p_stage is 'open', 'won' or 'lost'. Webhooks are retried and can arrive
-- out of order, so this is safe to call any number of times:
--   - 'open' saves the dispute in metadata.dispute and sets status
--     'disputed', remembering the status before (metadata.status_before_dispute)
--   - 'won' puts that status back, if the order is still 'disputed'
--   - 'lost' sets 'dispute_lost' (unless the order was refunded meanwhile),
--     keeps the stock as it is (the goods are gone), and with
--     p_cancel_bookings switches off the booking link and cancels upcoming
--     calls (cancelled_by 'dispute'), once
--   - a stage the dispute already reached, or 'open' after it closed,
--     changes nothing
-- p_details (reason, evidence_due_by, ...) is merged into metadata.dispute.
-- Returns { found, changed, status, stage, cancelled_bookings, links_revoked }
CREATE OR REPLACE FUNCTION public.mark_order_disputed(
  p_order_id UUID,
  p_dispute_id TEXT,
  p_stage TEXT,
  p_amount NUMERIC,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_cancel_bookings BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_order public.orders;
  v_metadata JSONB;
  v_dispute JSONB;
  v_old_stage TEXT;
  v_status TEXT;
  v_before TEXT;
  v_cancelled JSONB := '[]'::jsonb;
  v_links INTEGER := 0;
BEGIN
  IF p_stage NOT IN ('open', 'won', 'lost') THEN
    RAISE EXCEPTION 'Invalid dispute stage %', p_stage USING ERRCODE = '22023';
  END IF;
  IF p_dispute_id IS NULL OR p_amount IS NULL OR p_amount < 0 THEN
    RAISE EXCEPTION 'Invalid dispute % for %', p_dispute_id, p_amount USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  v_metadata := COALESCE(v_order.metadata, '{}'::jsonb);
  v_dispute := CASE
    WHEN v_metadata->'dispute'->>'id' = p_dispute_id THEN v_metadata->'dispute'
    ELSE '{}'::jsonb
  END;
  v_old_stage := v_dispute->>'stage';

  IF v_old_stage = p_stage OR (p_stage = 'open' AND v_old_stage IN ('won', 'lost')) THEN
    RETURN jsonb_build_object('found', true, 'changed', false, 'status', v_order.status, 'stage', v_old_stage);
  END IF;

  -- The status to go back to when the dispute is won
  v_before := CASE
    WHEN v_order.status IN ('disputed', 'dispute_lost') THEN COALESCE(v_metadata->>'status_before_dispute', 'completed')
    ELSE v_order.status
  END;

  v_status := CASE
    WHEN p_stage = 'open' AND v_order.status NOT IN ('refunded') THEN 'disputed'
    WHEN p_stage = 'won' AND v_order.status = 'disputed' THEN v_before
    WHEN p_stage = 'lost' AND v_order.status NOT IN ('refunded') THEN 'dispute_lost'
    ELSE v_order.status
  END;

  v_dispute := v_dispute || COALESCE(p_details, '{}'::jsonb) || jsonb_build_object(
    'id', p_dispute_id,
    'stage', p_stage,
    'amount', p_amount
  ) || CASE
    WHEN p_stage = 'open' THEN jsonb_build_object('opened_at', COALESCE(v_dispute->'opened_at', to_jsonb(now())))
    ELSE jsonb_build_object('closed_at', now())
  END;

  IF p_stage = 'lost' AND p_cancel_bookings AND NOT (v_metadata ? 'bookings_cancelled_at') THEN
    UPDATE public.booking_entitlements
    SET revoked_at = now()
    WHERE order_id = p_order_id AND revoked_at IS NULL;
    GET DIAGNOSTICS v_links = ROW_COUNT;

    WITH cancelled AS (
      UPDATE public.bookings
      SET status = 'cancelled',
          cancelled_by = 'dispute',
          cancel_reason = 'Payment disputed',
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

  v_metadata := v_metadata || jsonb_build_object('dispute', v_dispute, 'status_before_dispute', v_before);

  UPDATE public.orders
  SET status = v_status, metadata = v_metadata
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'found', true,
    'changed', true,
    'status', v_status,
    'stage', p_stage,
    'cancelled_bookings', v_cancelled,
    'links_revoked', v_links
  );
END;
$$;

-- Only the server (service role) may record disputes
REVOKE ALL ON FUNCTION public.mark_order_disputed(UUID, TEXT, TEXT, NUMERIC, JSONB, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_disputed(UUID, TEXT, TEXT, NUMERIC, JSONB, BOOLEAN) TO service_role;
