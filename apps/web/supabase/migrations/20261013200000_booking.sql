-- Self-serve booking (a Calendly-style scheduler).
--
-- Hosts (Swapnil now, doctors later) have weekly hours, date overrides and
-- blocked time. Buyers book from the link in their order confirmation email;
-- that link is an entitlement ("this order may book N calls"). Every booking
-- is stored in UTC; weekly hours are local times in the host's time zone, so
-- they don't move when the clocks change.
--
-- Only admins (is_admin()) read or write these tables. The buyer's booking
-- page goes through API routes that use the service role key.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code.
-- It only adds new tables, so it is safe to run with the old code live.

-- Needed for the "no two bookings overlap" constraint on (host, time range)
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- =====================================================
-- STEP 1: Hosts and booking types
-- =====================================================
CREATE TABLE IF NOT EXISTS public.booking_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- A doctor need not have a login, so this is optional
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title TEXT,
  photo_url TEXT,
  -- IANA zone name; weekly hours and overrides are in this zone
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  is_default BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.booking_hosts IS 'People whose calendar can be booked (Swapnil, later doctors)';

-- At most one default host
CREATE UNIQUE INDEX IF NOT EXISTS booking_hosts_one_default
  ON public.booking_hosts (is_default) WHERE is_default;

-- Rejects zone names Postgres doesn't know (a CHECK can't do this lookup)
CREATE OR REPLACE FUNCTION public.booking_check_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name = NEW.timezone) THEN
    RAISE EXCEPTION 'Unknown time zone: %', NEW.timezone USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_hosts_timezone ON public.booking_hosts;
CREATE TRIGGER booking_hosts_timezone
  BEFORE INSERT OR UPDATE OF timezone ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.booking_check_timezone();

CREATE TABLE IF NOT EXISTS public.booking_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  -- Which service package (lib/server/pricing.ts package_id) books this type
  package_id TEXT UNIQUE,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 480),
  -- Start times are offered every this many minutes, on the clock (:00, :30)
  slot_step_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_step_minutes IN (5, 10, 15, 20, 30, 60)),
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_before_minutes BETWEEN 0 AND 240),
  buffer_after_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_after_minutes BETWEEN 0 AND 240),
  min_notice_minutes INTEGER NOT NULL DEFAULT 720 CHECK (min_notice_minutes BETWEEN 0 AND 43200),
  max_days_ahead INTEGER NOT NULL DEFAULT 60 CHECK (max_days_ahead BETWEEN 1 AND 365),
  daily_limit INTEGER CHECK (daily_limit IS NULL OR daily_limit > 0),
  cancel_cutoff_minutes INTEGER NOT NULL DEFAULT 1440 CHECK (cancel_cutoff_minutes BETWEEN 0 AND 43200),
  location_kind TEXT NOT NULL DEFAULT 'video' CHECK (location_kind IN ('video', 'phone', 'in_person')),
  -- Meeting link or address; empty until meeting links are set up
  location_value TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.booking_types IS 'What can be booked, e.g. the 30-minute 1:1 call';

-- Which hosts offer which type; the default one is preselected for buyers
CREATE TABLE IF NOT EXISTS public.booking_type_hosts (
  booking_type_id UUID NOT NULL REFERENCES public.booking_types (id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (booking_type_id, host_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS booking_type_hosts_one_default
  ON public.booking_type_hosts (booking_type_id) WHERE is_default;

-- =====================================================
-- STEP 2: Availability
-- =====================================================
-- Weekly hours, local to the host. Several ranges per day are allowed.
CREATE TABLE IF NOT EXISTS public.booking_weekly_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id) ON DELETE CASCADE,
  -- ISO weekday: 1 = Monday ... 7 = Sunday
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  -- 24:00 means midnight at the end of the day
  end_time TIME NOT NULL,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS booking_weekly_hours_host ON public.booking_weekly_hours (host_id, weekday);

-- A date with different hours. If a date has any rows here they replace the
-- weekly hours for that date; a row with no times means closed all day.
CREATE TABLE IF NOT EXISTS public.booking_date_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

CREATE INDEX IF NOT EXISTS booking_date_overrides_host ON public.booking_date_overrides (host_id, date);

-- Time blocked by hand, to the minute
CREATE TABLE IF NOT EXISTS public.booking_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS booking_blocks_host_time
  ON public.booking_blocks USING gist (host_id, tstzrange(starts_at, ends_at, '[)'));

-- =====================================================
-- STEP 3: Entitlements and bookings
-- =====================================================
-- "This order may book N calls". Created by the payment webhook; the email
-- link carries a random token and only its SHA-256 hash is stored here.
CREATE TABLE IF NOT EXISTS public.booking_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders (id) ON DELETE SET NULL,
  booking_type_id UUID NOT NULL REFERENCES public.booking_types (id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  used INTEGER NOT NULL DEFAULT 0,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (used BETWEEN 0 AND quantity)
);

CREATE INDEX IF NOT EXISTS booking_entitlements_order ON public.booking_entitlements (order_id);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id UUID REFERENCES public.booking_entitlements (id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders (id) ON DELETE SET NULL,
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id),
  booking_type_id UUID NOT NULL REFERENCES public.booking_types (id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  -- The call plus its buffers; this is what may not overlap another booking
  busy_from TIMESTAMPTZ NOT NULL,
  busy_until TIMESTAMPTZ NOT NULL,
  invitee_name TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  -- The buyer's IANA zone, for showing their local time in emails and admin
  invitee_timezone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  cancelled_by TEXT CHECK (cancelled_by IN ('invitee', 'host')),
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  rescheduled_from UUID REFERENCES public.bookings (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (busy_from <= starts_at AND busy_until >= ends_at),
  -- Two live bookings for one host can never overlap, even if two people
  -- confirm the same slot at the same moment
  CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
    host_id WITH =,
    tstzrange(busy_from, busy_until, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

COMMENT ON TABLE public.bookings IS 'Every booked call, in UTC. Cancelled ones are kept for the record.';

CREATE INDEX IF NOT EXISTS bookings_host_starts ON public.bookings (host_id, starts_at);
CREATE INDEX IF NOT EXISTS bookings_entitlement ON public.bookings (entitlement_id);

-- Keeps updated_at current on edits
CREATE OR REPLACE FUNCTION public.booking_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

DROP TRIGGER IF EXISTS booking_types_updated_at ON public.booking_types;
CREATE TRIGGER booking_types_updated_at
  BEFORE UPDATE ON public.booking_types
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

-- =====================================================
-- STEP 4: Cancelling gives the call back
-- =====================================================
-- Runs as the caller, so row level security still applies: admins (and the
-- service role used by the booking API) can cancel, nobody else can.
CREATE OR REPLACE FUNCTION public.booking_cancel(
  p_booking_id UUID,
  p_cancelled_by TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_booking public.bookings;
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled',
      cancelled_by = p_cancelled_by,
      cancel_reason = NULLIF(trim(p_reason), ''),
      cancelled_at = now()
  WHERE id = p_booking_id AND status = 'confirmed'
  RETURNING * INTO v_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % is not an active booking', p_booking_id USING ERRCODE = 'P0002';
  END IF;

  IF v_booking.entitlement_id IS NOT NULL THEN
    UPDATE public.booking_entitlements
    SET used = GREATEST(used - 1, 0)
    WHERE id = v_booking.entitlement_id;
  END IF;

  RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.booking_cancel(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.booking_cancel(UUID, TEXT, TEXT) TO authenticated, service_role;

-- =====================================================
-- STEP 5: Row level security (admins only)
-- =====================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'booking_hosts', 'booking_types', 'booking_type_hosts', 'booking_weekly_hours',
    'booking_date_overrides', 'booking_blocks', 'booking_entitlements', 'bookings'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %s" ON public.%I FOR ALL TO authenticated '
      'USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))',
      t, t
    );
  END LOOP;
END;
$$;

-- =====================================================
-- STEP 6: Starting data (Swapnil, the 1:1 call, Mon-Fri 09:00-17:00)
-- =====================================================
INSERT INTO public.booking_hosts (user_id, name, slug, title, timezone, is_default)
SELECT 'c8ae336b-5fc3-43e7-8c33-d253b8361d79', 'Swapnil Srivastava', 'swapnil',
       'Architect & Full Stack Engineer', 'Europe/Berlin', true
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = 'c8ae336b-5fc3-43e7-8c33-d253b8361d79')
ON CONFLICT (slug) DO NOTHING;

-- Without that user (e.g. a fresh local database) the host has no login
INSERT INTO public.booking_hosts (name, slug, title, timezone, is_default)
SELECT 'Swapnil Srivastava', 'swapnil', 'Architect & Full Stack Engineer', 'Europe/Berlin', true
WHERE NOT EXISTS (SELECT 1 FROM public.booking_hosts WHERE slug = 'swapnil');

INSERT INTO public.booking_types (slug, name, description, package_id, duration_minutes)
VALUES (
  'consultation', '1:1 Consultation Call',
  '30-minute consultation session for web development needs',
  'consultation_basic', 30
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.booking_type_hosts (booking_type_id, host_id, is_default)
SELECT t.id, h.id, true
FROM public.booking_types t, public.booking_hosts h
WHERE t.slug = 'consultation' AND h.slug = 'swapnil'
ON CONFLICT DO NOTHING;

INSERT INTO public.booking_weekly_hours (host_id, weekday, start_time, end_time)
SELECT h.id, d, '09:00', '17:00'
FROM public.booking_hosts h, generate_series(1, 5) AS d
WHERE h.slug = 'swapnil'
  AND NOT EXISTS (SELECT 1 FROM public.booking_weekly_hours w WHERE w.host_id = h.id);
