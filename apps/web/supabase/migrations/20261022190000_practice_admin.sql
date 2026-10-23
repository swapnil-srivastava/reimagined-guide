-- =====================================================
-- Doctors, part 10: practice admin.
--
--   - practice settings: one row with the follow-up window, fees, the
--     referral and no-show charge, paying at the clinic and booking rules
--   - each doctor can override the fees and both charges, and has a
--     registration "valid until" date
--   - a change history: every change to practice settings (with the
--     admin's reason, required) and to a doctor's details is logged.
--     Rows can't be edited or deleted.
--   - a doctor can only be active once their registration is checked;
--     changing the registration number or council clears the check
--
-- Money is stored in paise (₹1 = 100 paise), like Razorpay.
-- Charges: full, three_quarters, half or free (Swapnil, 2026-10-20).
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code.
-- It only adds a table, columns and functions, so it is safe to run with the
-- old code live. Safe to run twice.
-- =====================================================

-- =====================================================
-- STEP 1: Practice settings (a single row)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.practice_settings (
  -- Always true: there is exactly one row
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  -- Days after a consult when follow-ups are free
  follow_up_days INTEGER NOT NULL DEFAULT 5 CHECK (follow_up_days BETWEEN 0 AND 30),
  first_consult_fee_paise INTEGER NOT NULL DEFAULT 60000 CHECK (first_consult_fee_paise BETWEEN 0 AND 10000000),
  follow_up_fee_paise INTEGER NOT NULL DEFAULT 40000 CHECK (follow_up_fee_paise BETWEEN 0 AND 10000000),
  -- What the patient pays when the doctor refers them on
  referral_charge TEXT NOT NULL DEFAULT 'full'
    CHECK (referral_charge IN ('full', 'three_quarters', 'half', 'free')),
  -- What the patient pays when marked as not come
  no_show_charge TEXT NOT NULL DEFAULT 'full'
    CHECK (no_show_charge IN ('full', 'three_quarters', 'half', 'free')),
  pay_at_clinic BOOLEAN NOT NULL DEFAULT true,
  pay_at_clinic_who TEXT NOT NULL DEFAULT 'everyone' CHECK (pay_at_clinic_who IN ('everyone', 'returning')),
  -- Booking rules for doctor consults (IST)
  min_notice_minutes INTEGER NOT NULL DEFAULT 720 CHECK (min_notice_minutes BETWEEN 0 AND 43200),
  cancel_cutoff_minutes INTEGER NOT NULL DEFAULT 1440 CHECK (cancel_cutoff_minutes BETWEEN 0 AND 43200),
  buffer_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_minutes BETWEEN 0 AND 240),
  max_days_ahead INTEGER NOT NULL DEFAULT 60 CHECK (max_days_ahead BETWEEN 1 AND 365),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.practice_settings IS 'One row: fees, charges and booking rules for the doctors. Change it with admin_update_practice_settings()';

INSERT INTO public.practice_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS practice_settings_updated_at ON public.practice_settings;
CREATE TRIGGER practice_settings_updated_at
  BEFORE UPDATE ON public.practice_settings
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

-- =====================================================
-- STEP 2: A doctor's own rules
-- =====================================================
-- Empty means "use the practice setting"
ALTER TABLE public.booking_hosts
  ADD COLUMN IF NOT EXISTS registration_valid_until DATE,
  ADD COLUMN IF NOT EXISTS first_consult_fee_paise INTEGER,
  ADD COLUMN IF NOT EXISTS follow_up_fee_paise INTEGER,
  ADD COLUMN IF NOT EXISTS referral_charge TEXT,
  ADD COLUMN IF NOT EXISTS no_show_charge TEXT;

ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_fees_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_fees_check CHECK (
    (first_consult_fee_paise IS NULL OR first_consult_fee_paise BETWEEN 0 AND 10000000)
    AND (follow_up_fee_paise IS NULL OR follow_up_fee_paise BETWEEN 0 AND 10000000)
  );
ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_charges_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_charges_check CHECK (
    (referral_charge IS NULL OR referral_charge IN ('full', 'three_quarters', 'half', 'free'))
    AND (no_show_charge IS NULL OR no_show_charge IN ('full', 'three_quarters', 'half', 'free'))
  );

-- Patients can only book a doctor whose registration was checked (TPG 2020).
-- Both seeded doctors are inactive (checked live 2026-10-22); any doctor
-- switched on since without a checked registration is switched off here.
UPDATE public.booking_hosts
SET active = false
WHERE kind = 'doctor' AND active
  AND (registration_verified_at IS NULL OR registration_number IS NULL OR registration_council IS NULL);

ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_doctor_verified_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_doctor_verified_check CHECK (
    kind <> 'doctor' OR NOT active
    OR (registration_verified_at IS NOT NULL AND registration_number IS NOT NULL AND registration_council IS NOT NULL)
  );

-- The check belongs to one registration: a new number or council clears it,
-- and whoever ticks it is recorded as the checker.
CREATE OR REPLACE FUNCTION public.booking_hosts_registration_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (NEW.registration_number IS DISTINCT FROM OLD.registration_number
          OR NEW.registration_council IS DISTINCT FROM OLD.registration_council)
     AND NEW.registration_verified_at IS NOT DISTINCT FROM OLD.registration_verified_at THEN
    NEW.registration_verified_at := NULL;
  END IF;
  IF NEW.registration_verified_at IS NULL THEN
    NEW.registration_verified_by := NULL;
  ELSIF TG_OP = 'INSERT' OR NEW.registration_verified_at IS DISTINCT FROM OLD.registration_verified_at THEN
    -- Never in the future, and always the person signed in (NULL for the service role)
    NEW.registration_verified_at := LEAST(NEW.registration_verified_at, now());
    NEW.registration_verified_by := auth.uid();
  ELSE
    NEW.registration_verified_by := OLD.registration_verified_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_hosts_registration ON public.booking_hosts;
CREATE TRIGGER booking_hosts_registration
  BEFORE INSERT OR UPDATE ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.booking_hosts_registration_check();

-- =====================================================
-- STEP 3: Change history
-- =====================================================
-- One row per changed field. subject 'practice' is practice_settings (a
-- reason is required); 'doctor' is a doctor's row in booking_hosts.
CREATE TABLE IF NOT EXISTS public.practice_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL CHECK (subject IN ('practice', 'doctor')),
  host_id UUID REFERENCES public.booking_hosts (id) ON DELETE SET NULL,
  field TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT CHECK (reason IS NULL OR length(trim(reason)) BETWEEN 3 AND 500),
  changed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  -- Kept as written at the time, so the history reads the same later
  changed_by_name TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (subject <> 'practice' OR reason IS NOT NULL)
);

COMMENT ON TABLE public.practice_changes IS 'Every change to practice settings and doctors. Insert-only: written by triggers, never edited or deleted';

CREATE INDEX IF NOT EXISTS practice_changes_subject ON public.practice_changes (subject, changed_at DESC);
CREATE INDEX IF NOT EXISTS practice_changes_host ON public.practice_changes (host_id, changed_at DESC);

-- Writes one history row per changed column. TG_ARGV[0] is the subject,
-- the rest are the columns to watch. The reason comes from
-- app.change_reason, which admin_update_practice_settings() sets.
CREATE OR REPLACE FUNCTION public.practice_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old JSONB := to_jsonb(OLD);
  v_new JSONB := to_jsonb(NEW);
  v_subject TEXT := TG_ARGV[0];
  v_reason TEXT := NULLIF(trim(current_setting('app.change_reason', true)), '');
  v_name TEXT;
  v_field TEXT;
BEGIN
  -- Swapnil's own calendar (kind consultant) isn't part of the practice
  IF v_subject = 'doctor' AND v_old ->> 'kind' <> 'doctor' AND v_new ->> 'kind' <> 'doctor' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(trim(p.full_name), ''), p.username, p.email)
  INTO v_name FROM public.profiles p WHERE p.id = auth.uid();

  FOREACH v_field IN ARRAY TG_ARGV[1:] LOOP
    IF v_old -> v_field IS DISTINCT FROM v_new -> v_field THEN
      INSERT INTO public.practice_changes (subject, host_id, field, old_value, new_value, reason, changed_by, changed_by_name)
      VALUES (
        v_subject,
        CASE WHEN v_subject = 'doctor' THEN (v_new ->> 'id')::UUID END,
        v_field, v_old -> v_field, v_new -> v_field, v_reason, auth.uid(), v_name
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.practice_log_changes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS practice_settings_log ON public.practice_settings;
CREATE TRIGGER practice_settings_log
  AFTER UPDATE ON public.practice_settings
  FOR EACH ROW EXECUTE FUNCTION public.practice_log_changes(
    'practice', 'follow_up_days', 'first_consult_fee_paise', 'follow_up_fee_paise',
    'referral_charge', 'no_show_charge', 'pay_at_clinic', 'pay_at_clinic_who',
    'min_notice_minutes', 'cancel_cutoff_minutes', 'buffer_minutes', 'max_days_ahead'
  );

DROP TRIGGER IF EXISTS booking_hosts_log ON public.booking_hosts;
CREATE TRIGGER booking_hosts_log
  AFTER UPDATE ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.practice_log_changes(
    'doctor', 'name', 'qualification', 'specialty', 'registration_number', 'registration_council',
    'registration_valid_until', 'registration_verified_at', 'clinic_id', 'modes',
    'first_consult_fee_paise', 'follow_up_fee_paise', 'referral_charge', 'no_show_charge', 'active'
  );

-- =====================================================
-- STEP 4: Saving practice settings (admins only, with a reason)
-- =====================================================
-- p_changes is a JSON object of the columns to change, e.g.
-- {"follow_up_days": 7}. Unknown keys are refused. Nothing changed is an
-- error, so an empty save never writes a history row.
CREATE OR REPLACE FUNCTION public.admin_update_practice_settings(p_changes JSONB, p_reason TEXT)
RETURNS public.practice_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_allowed TEXT[] := ARRAY[
    'follow_up_days', 'first_consult_fee_paise', 'follow_up_fee_paise', 'referral_charge',
    'no_show_charge', 'pay_at_clinic', 'pay_at_clinic_who', 'min_notice_minutes',
    'cancel_cutoff_minutes', 'buffer_minutes', 'max_days_ahead'
  ];
  v_old public.practice_settings;
  v_new public.practice_settings;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change practice settings' USING ERRCODE = '42501';
  END IF;
  IF p_changes IS NULL OR jsonb_typeof(p_changes) <> 'object' THEN
    RAISE EXCEPTION 'Changes must be a JSON object' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_changes) k WHERE k <> ALL (v_allowed)) THEN
    RAISE EXCEPTION 'Unknown setting in %', p_changes USING ERRCODE = '22023';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_old FROM public.practice_settings WHERE id FOR UPDATE;
  v_new := jsonb_populate_record(v_old, p_changes);
  IF to_jsonb(v_new) = to_jsonb(v_old) THEN
    RAISE EXCEPTION 'Nothing changed' USING ERRCODE = '22023';
  END IF;

  -- Read by the history trigger; local to this transaction
  PERFORM set_config('app.change_reason', trim(p_reason), true);

  UPDATE public.practice_settings SET
    follow_up_days = v_new.follow_up_days,
    first_consult_fee_paise = v_new.first_consult_fee_paise,
    follow_up_fee_paise = v_new.follow_up_fee_paise,
    referral_charge = v_new.referral_charge,
    no_show_charge = v_new.no_show_charge,
    pay_at_clinic = v_new.pay_at_clinic,
    pay_at_clinic_who = v_new.pay_at_clinic_who,
    min_notice_minutes = v_new.min_notice_minutes,
    cancel_cutoff_minutes = v_new.cancel_cutoff_minutes,
    buffer_minutes = v_new.buffer_minutes,
    max_days_ahead = v_new.max_days_ahead
  WHERE id
  RETURNING * INTO v_new;

  PERFORM set_config('app.change_reason', '', true);
  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_practice_settings(JSONB, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_practice_settings(JSONB, TEXT) TO authenticated;

-- =====================================================
-- STEP 5: Row level security
-- =====================================================
-- Fees and booking rules are shown on the public booking pages
ALTER TABLE public.practice_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads practice settings" ON public.practice_settings;
CREATE POLICY "Anyone reads practice settings" ON public.practice_settings
  FOR SELECT TO anon, authenticated USING (true);
-- No write policy: only admin_update_practice_settings() changes the row
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.practice_settings FROM anon, authenticated;

-- History: admins read; nobody edits or deletes
ALTER TABLE public.practice_changes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read practice changes" ON public.practice_changes;
CREATE POLICY "Admins read practice changes" ON public.practice_changes
  FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.practice_changes FROM anon, authenticated;
