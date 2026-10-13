-- Booking and rescheduling from the buyer's booking page (/book/<token>).
--
-- The page's API routes check the slot against the host's hours first
-- (lib/booking/slots.ts); these functions then do the parts that must be
-- atomic: one call per entitlement credit, no overlap with another booking
-- or a block, and a reschedule that never loses the original booking if the
-- new time is taken.
--
-- Only the service role (the API routes) may call them.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code.
-- It only adds functions, so it is safe to run with the old code live.

-- Raises when [p_busy_from, p_busy_until) touches a block of the host
CREATE OR REPLACE FUNCTION public.booking_assert_not_blocked(
  p_host_id UUID,
  p_busy_from TIMESTAMPTZ,
  p_busy_until TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.booking_blocks
    WHERE host_id = p_host_id
      AND tstzrange(starts_at, ends_at, '[)') && tstzrange(p_busy_from, p_busy_until, '[)')
  ) THEN
    RAISE EXCEPTION 'That time is no longer available' USING ERRCODE = '23P01';
  END IF;
END;
$$;

-- Books one call on an entitlement. Overlap with another booking raises
-- 23P01 (exclusion_violation) from the bookings_no_overlap constraint.
CREATE OR REPLACE FUNCTION public.booking_book(
  p_entitlement_id UUID,
  p_host_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_busy_from TIMESTAMPTZ,
  p_busy_until TIMESTAMPTZ,
  p_name TEXT,
  p_email TEXT,
  p_timezone TEXT,
  p_notes TEXT
)
RETURNS public.bookings
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_ent public.booking_entitlements;
  v_booking public.bookings;
BEGIN
  -- Locking the entitlement makes two tabs booking at once run one at a time
  SELECT * INTO v_ent FROM public.booking_entitlements WHERE id = p_entitlement_id FOR UPDATE;
  IF NOT FOUND OR v_ent.revoked_at IS NOT NULL OR (v_ent.expires_at IS NOT NULL AND v_ent.expires_at < now()) THEN
    RAISE EXCEPTION 'This booking link is no longer valid' USING ERRCODE = 'P0002';
  END IF;
  IF v_ent.used >= v_ent.quantity THEN
    RAISE EXCEPTION 'Every call on this link is already booked' USING ERRCODE = 'P0003';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.booking_type_hosts
    WHERE booking_type_id = v_ent.booking_type_id AND host_id = p_host_id
  ) THEN
    RAISE EXCEPTION 'This host does not offer this call' USING ERRCODE = '22023';
  END IF;

  PERFORM public.booking_assert_not_blocked(p_host_id, p_busy_from, p_busy_until);

  INSERT INTO public.bookings (
    entitlement_id, order_id, host_id, booking_type_id, starts_at, ends_at, busy_from, busy_until,
    invitee_name, invitee_email, invitee_timezone, notes
  ) VALUES (
    v_ent.id, v_ent.order_id, p_host_id, v_ent.booking_type_id, p_starts_at, p_ends_at, p_busy_from, p_busy_until,
    trim(p_name), lower(trim(p_email)), p_timezone, NULLIF(trim(p_notes), '')
  )
  RETURNING * INTO v_booking;

  UPDATE public.booking_entitlements SET used = used + 1 WHERE id = v_ent.id;

  RETURN v_booking;
END;
$$;

-- Moves a booking: the old one is cancelled and the new one inserted in one
-- transaction, so if the new time is taken nothing changes. The new booking
-- may overlap the old one (moving 10:00 to 10:30), because the old one is
-- cancelled first.
CREATE OR REPLACE FUNCTION public.booking_reschedule(
  p_booking_id UUID,
  p_host_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_busy_from TIMESTAMPTZ,
  p_busy_until TIMESTAMPTZ,
  p_timezone TEXT
)
RETURNS public.bookings
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_old public.bookings;
  v_new public.bookings;
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled', cancelled_by = 'invitee', cancel_reason = 'Rescheduled', cancelled_at = now()
  WHERE id = p_booking_id AND status = 'confirmed'
  RETURNING * INTO v_old;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % is not an active booking', p_booking_id USING ERRCODE = 'P0002';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.booking_type_hosts
    WHERE booking_type_id = v_old.booking_type_id AND host_id = p_host_id
  ) THEN
    RAISE EXCEPTION 'This host does not offer this call' USING ERRCODE = '22023';
  END IF;

  PERFORM public.booking_assert_not_blocked(p_host_id, p_busy_from, p_busy_until);

  INSERT INTO public.bookings (
    entitlement_id, order_id, host_id, booking_type_id, starts_at, ends_at, busy_from, busy_until,
    invitee_name, invitee_email, invitee_timezone, notes, rescheduled_from
  ) VALUES (
    v_old.entitlement_id, v_old.order_id, p_host_id, v_old.booking_type_id, p_starts_at, p_ends_at, p_busy_from, p_busy_until,
    v_old.invitee_name, v_old.invitee_email, COALESCE(p_timezone, v_old.invitee_timezone), v_old.notes, v_old.id
  )
  RETURNING * INTO v_new;

  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.booking_assert_not_blocked(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.booking_book(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.booking_reschedule(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.booking_assert_not_blocked(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_book(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_reschedule(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO service_role;
