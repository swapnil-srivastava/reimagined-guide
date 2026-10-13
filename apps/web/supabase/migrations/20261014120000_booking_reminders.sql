-- =====================================================
-- Booking, part 3: reminders, the "not booked yet" nudge, a private
-- calendar feed and rate limits for the booking link.
-- Run after 20261014090000_booking_functions.sql. Safe to run twice.
-- =====================================================

-- =====================================================
-- STEP 1: New columns
-- =====================================================
-- When each reminder went out; NULL means not yet
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at TIMESTAMPTZ;

-- When the buyer was reminded to pick a time, and the hash of the second
-- link that reminder carries (the order email's link keeps working too)
ALTER TABLE public.booking_entitlements
  ADD COLUMN IF NOT EXISTS nudged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nudge_token_hash TEXT UNIQUE;

-- Hash of the host's private calendar feed token (the feed URL is the only copy)
ALTER TABLE public.booking_hosts
  ADD COLUMN IF NOT EXISTS feed_token_hash TEXT UNIQUE;

-- =====================================================
-- STEP 2: Picking which reminders are due
-- =====================================================
-- Each function marks the rows it returns as sent in the same statement, so
-- two runs at once can never email the same person twice. Batches of 50.

-- p_kind '24h': calls starting in 2 to 24 hours, booked at least 30 hours ahead
--               (anyone booking later just got their confirmation)
-- p_kind '1h':  calls starting within the hour, booked at least 3 hours ahead
CREATE OR REPLACE FUNCTION public.booking_claim_reminders(p_kind TEXT)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF p_kind = '24h' THEN
    RETURN QUERY
    UPDATE public.bookings b
    SET reminder_24h_sent_at = now()
    WHERE b.id IN (
      SELECT id FROM public.bookings
      WHERE status = 'confirmed'
        AND reminder_24h_sent_at IS NULL
        AND starts_at > now() + interval '2 hours'
        AND starts_at <= now() + interval '24 hours'
        AND created_at <= starts_at - interval '30 hours'
      ORDER BY starts_at
      LIMIT 50
      FOR UPDATE SKIP LOCKED
    )
    RETURNING b.*;
  ELSIF p_kind = '1h' THEN
    RETURN QUERY
    UPDATE public.bookings b
    SET reminder_1h_sent_at = now()
    WHERE b.id IN (
      SELECT id FROM public.bookings
      WHERE status = 'confirmed'
        AND reminder_1h_sent_at IS NULL
        AND starts_at > now()
        AND starts_at <= now() + interval '1 hour'
        AND created_at <= starts_at - interval '3 hours'
      ORDER BY starts_at
      LIMIT 50
      FOR UPDATE SKIP LOCKED
    )
    RETURNING b.*;
  ELSE
    RAISE EXCEPTION 'Unknown reminder kind: %', p_kind USING ERRCODE = '22023';
  END IF;
END;
$$;

-- Links paid for 3+ days ago that were never used, still valid for a day more
CREATE OR REPLACE FUNCTION public.booking_claim_nudges()
RETURNS SETOF public.booking_entitlements
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.booking_entitlements e
  SET nudged_at = now()
  WHERE e.id IN (
    SELECT x.id FROM public.booking_entitlements x
    WHERE x.nudged_at IS NULL
      AND x.revoked_at IS NULL
      AND x.used = 0
      AND x.email IS NOT NULL
      AND x.created_at <= now() - interval '3 days'
      AND (x.expires_at IS NULL OR x.expires_at > now() + interval '1 day')
      AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.entitlement_id = x.id)
    ORDER BY x.created_at
    LIMIT 50
    FOR UPDATE SKIP LOCKED
  )
  RETURNING e.*;
END;
$$;

-- =====================================================
-- STEP 3: Rate limits for the booking link API
-- =====================================================
-- One row per key and time window. Keys hold a hash of the visitor's IP,
-- never the IP itself. No policies: only the service role reaches it.
CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Counts one hit; true while the key is within p_limit for this window
CREATE OR REPLACE FUNCTION public.booking_rate_hit(p_key TEXT, p_limit INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_start TIMESTAMPTZ := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_hits INTEGER;
BEGIN
  INSERT INTO public.booking_rate_limits AS r (key, window_start, hits)
  VALUES (p_key, v_start, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING r.hits INTO v_hits;
  RETURN v_hits <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.booking_claim_reminders(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.booking_claim_nudges() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.booking_rate_hit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.booking_claim_reminders(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_claim_nudges() TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_rate_hit(TEXT, INTEGER, INTEGER) TO service_role;

-- =====================================================
-- STEP 4: Run the reminder job every 15 minutes
-- =====================================================
-- Supabase's pg_cron calls the website, which sends whatever is due. The
-- job is safe to call any number of times: each email goes out once.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule('booking-reminders')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'booking-reminders');

SELECT cron.schedule(
  'booking-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://www.swapnilsrivastava.eu/api/cron/booking',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
