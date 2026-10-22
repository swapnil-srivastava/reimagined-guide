-- =====================================================
-- Doctors, part 1: the data model.
--
-- Builds the doctor module on top of the booking tables:
--   - clinics, and clinic staff (reception) who may see a clinic's day
--   - doctor fields on booking_hosts (qualification, registration, clinic,
--     the modes they offer)
--   - patients (mobile number required, email optional, ABHA optional)
--   - consent texts with versions, and every consent a patient gave
--   - cases: one problem with one doctor, with its free follow-up end date
--   - bookings and booking links get mode (video, audio, in person), kind
--     (first, follow-up, clinic visit), patient, case, phone, and the
--     clinic's arrival and no-show times
--
-- Patients and doctors never write these tables directly: the API routes
-- (service role) and admins do. Row level security only adds read access:
-- a doctor sees their own bookings, cases and patients; reception sees
-- their clinic's; a signed-in patient sees their own.
--
-- Run this whole file in the Supabase SQL editor BEFORE deploying the code.
-- It only adds tables and columns (and makes bookings.invitee_email
-- optional), so it is safe to run with the old code live. Safe to run twice.
-- =====================================================

-- =====================================================
-- STEP 1: Clinics and clinic staff
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  -- Indian PIN code
  postcode TEXT CHECK (postcode IS NULL OR postcode ~ '^[1-9][0-9]{5}$'),
  country TEXT NOT NULL DEFAULT 'IN',
  phone TEXT CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{7,14}$'),
  email TEXT,
  map_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clinics IS 'Places where in-person visits happen';

DROP TRIGGER IF EXISTS clinics_timezone ON public.clinics;
CREATE TRIGGER clinics_timezone
  BEFORE INSERT OR UPDATE OF timezone ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.booking_check_timezone();

DROP TRIGGER IF EXISTS clinics_updated_at ON public.clinics;
CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

-- Reception and other clinic staff. Doctors are booking_hosts, not members.
CREATE TABLE IF NOT EXISTS public.clinic_members (
  clinic_id UUID NOT NULL REFERENCES public.clinics (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'reception' CHECK (role IN ('reception')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, user_id)
);

CREATE INDEX IF NOT EXISTS clinic_members_user ON public.clinic_members (user_id);

-- =====================================================
-- STEP 2: Doctor fields on booking_hosts
-- =====================================================
-- kind 'consultant' is Swapnil's own 1:1 call; 'doctor' is a doctor.
-- Registration number and council are shown to patients (TPG 2020).
ALTER TABLE public.booking_hosts
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'consultant',
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS registration_council TEXT,
  ADD COLUMN IF NOT EXISTS registration_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_verified_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics (id) ON DELETE SET NULL,
  -- Which visit modes this host offers
  ADD COLUMN IF NOT EXISTS modes TEXT[] NOT NULL DEFAULT '{video}';

ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_kind_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_kind_check CHECK (kind IN ('consultant', 'doctor'));

ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_modes_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_modes_check
  CHECK (cardinality(modes) > 0 AND modes <@ ARRAY['video', 'audio', 'in_person']::TEXT[]);

-- A doctor who sees patients in person needs a clinic
ALTER TABLE public.booking_hosts DROP CONSTRAINT IF EXISTS booking_hosts_in_person_clinic_check;
ALTER TABLE public.booking_hosts
  ADD CONSTRAINT booking_hosts_in_person_clinic_check
  CHECK (NOT ('in_person' = ANY (modes)) OR clinic_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS booking_hosts_user ON public.booking_hosts (user_id);
CREATE INDEX IF NOT EXISTS booking_hosts_clinic ON public.booking_hosts (clinic_id);

-- =====================================================
-- STEP 3: Patients
-- =====================================================
-- One row per person seen. A family can share one mobile number, so the
-- number is not unique. user_id links a website login when there is one.
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  -- E.164, e.g. +919876543210; checked with an SMS code
  phone TEXT NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  phone_verified_at TIMESTAMPTZ,
  email TEXT CHECK (email IS NULL OR email = lower(trim(email))),
  date_of_birth DATE CHECK (date_of_birth IS NULL OR date_of_birth > DATE '1900-01-01'),
  sex TEXT CHECK (sex IN ('female', 'male', 'other')),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  -- ABHA number as 14 digits (shown as 91-1234-5678-9012), optional
  abha_number TEXT CHECK (abha_number IS NULL OR abha_number ~ '^[0-9]{14}$'),
  abha_address TEXT,
  abha_linked_at TIMESTAMPTZ,
  -- Set when someone else (parent, carer) books for the patient
  guardian_name TEXT,
  guardian_relation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.patients IS 'People seen by the doctors. Medical records: never delete rows by hand';

CREATE INDEX IF NOT EXISTS patients_phone ON public.patients (phone);
CREATE INDEX IF NOT EXISTS patients_user ON public.patients (user_id);

DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;
CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

-- =====================================================
-- STEP 4: Consents, with versions
-- =====================================================
-- The wording a patient agreed to. A new wording is a new version; old
-- versions stay so every consent can be shown as it was given.
--   teleconsult: teleconsultation consent (TPG 2020)
--   data:        DPDP data processing consent with the privacy notice
--   parent_data: a parent's consent for a child's data (DPDP)
CREATE TABLE IF NOT EXISTS public.consent_versions (
  kind TEXT NOT NULL CHECK (kind IN ('teleconsult', 'data', 'parent_data')),
  version TEXT NOT NULL CHECK (length(trim(version)) > 0),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, version)
);

CREATE TABLE IF NOT EXISTS public.patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients (id),
  kind TEXT NOT NULL,
  version TEXT NOT NULL,
  -- Who ticked the box: the patient, or a parent or carer for them
  given_by TEXT NOT NULL DEFAULT 'patient' CHECK (given_by IN ('patient', 'guardian')),
  given_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ,
  -- Where it was given (a booking link), for the record
  entitlement_id UUID REFERENCES public.booking_entitlements (id) ON DELETE SET NULL,
  -- SHA-256 of the IP address, never the address itself
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (kind, version) REFERENCES public.consent_versions (kind, version),
  CHECK (withdrawn_at IS NULL OR withdrawn_at >= given_at)
);

COMMENT ON TABLE public.patient_consents IS 'Every consent given, with its version. Withdrawing sets withdrawn_at; rows are never deleted';

CREATE INDEX IF NOT EXISTS patient_consents_patient ON public.patient_consents (patient_id, kind);
CREATE INDEX IF NOT EXISTS patient_consents_entitlement ON public.patient_consents (entitlement_id);

-- =====================================================
-- STEP 5: Cases
-- =====================================================
-- One health problem with one doctor: the first consult, any clinic visit
-- the doctor asks for, and the follow-ups. follow_up_until is when the
-- free follow-up window ends (set when the consult is done); after that
-- the case closes and a new follow-up is paid.
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients (id),
  host_id UUID NOT NULL REFERENCES public.booking_hosts (id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'follow_up', 'closed')),
  chief_complaint TEXT,
  follow_up_until TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  close_reason TEXT CHECK (close_reason IN ('follow_up_ended', 'referred', 'cancelled', 'admin')),
  -- A paid follow-up after the window opens a new case linked to the old one
  previous_case_id UUID REFERENCES public.cases (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((status = 'closed') = (closed_at IS NOT NULL)),
  CHECK (status <> 'follow_up' OR follow_up_until IS NOT NULL)
);

COMMENT ON TABLE public.cases IS 'One problem with one doctor, from the first consult to the end of its follow-ups';

CREATE INDEX IF NOT EXISTS cases_patient ON public.cases (patient_id);
CREATE INDEX IF NOT EXISTS cases_host_status ON public.cases (host_id, status);
-- For the cron job that closes cases when the free follow-up ends
CREATE INDEX IF NOT EXISTS cases_follow_up_due ON public.cases (follow_up_until) WHERE status = 'follow_up';

DROP TRIGGER IF EXISTS cases_updated_at ON public.cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.booking_touch_updated_at();

-- =====================================================
-- STEP 6: Booking links and bookings
-- =====================================================
-- mode: video, audio or in_person. On a booking link it may be empty when
--       the patient picks the mode with the time.
-- kind: first (a new consult), follow_up (free or paid, inside a case),
--       clinic_visit (the doctor asked an online patient to come in; free)
ALTER TABLE public.booking_entitlements
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients (id),
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases (id),
  ADD COLUMN IF NOT EXISTS mode TEXT,
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'first';

ALTER TABLE public.booking_entitlements DROP CONSTRAINT IF EXISTS booking_entitlements_phone_check;
ALTER TABLE public.booking_entitlements
  ADD CONSTRAINT booking_entitlements_phone_check CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{7,14}$');
ALTER TABLE public.booking_entitlements DROP CONSTRAINT IF EXISTS booking_entitlements_mode_check;
ALTER TABLE public.booking_entitlements
  ADD CONSTRAINT booking_entitlements_mode_check CHECK (mode IN ('video', 'audio', 'in_person'));
ALTER TABLE public.booking_entitlements DROP CONSTRAINT IF EXISTS booking_entitlements_kind_check;
ALTER TABLE public.booking_entitlements
  ADD CONSTRAINT booking_entitlements_kind_check CHECK (kind IN ('first', 'follow_up', 'clinic_visit'));

CREATE INDEX IF NOT EXISTS booking_entitlements_patient ON public.booking_entitlements (patient_id);
CREATE INDEX IF NOT EXISTS booking_entitlements_case ON public.booking_entitlements (case_id);

-- Phone is required for patients and email optional, so a booking needs
-- one of the two. Existing bookings all have an email.
ALTER TABLE public.bookings ALTER COLUMN invitee_email DROP NOT NULL;

-- Arrival at the clinic: the patient's "I've arrived" only notifies
-- (patient_arrived_at); reception or the doctor confirms it (checked_in_*)
-- or marks a no-show (status 'no_show', no_show_marked_*).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS invitee_phone TEXT,
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients (id),
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases (id),
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'first',
  ADD COLUMN IF NOT EXISTS patient_arrived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS no_show_marked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_marked_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_contact_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_contact_check CHECK (invitee_email IS NOT NULL OR invitee_phone IS NOT NULL);
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_phone_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_phone_check CHECK (invitee_phone IS NULL OR invitee_phone ~ '^\+[1-9][0-9]{7,14}$');
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_mode_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_mode_check CHECK (mode IN ('video', 'audio', 'in_person'));
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_kind_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_kind_check CHECK (kind IN ('first', 'follow_up', 'clinic_visit'));
-- Arrival times only make sense for clinic visits, and a no-show is never checked in
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_arrival_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_arrival_check CHECK (
    (mode = 'in_person' OR (patient_arrived_at IS NULL AND checked_in_at IS NULL))
    AND (checked_in_at IS NULL OR no_show_marked_at IS NULL)
    AND (no_show_marked_at IS NULL OR status = 'no_show')
  );

CREATE INDEX IF NOT EXISTS bookings_patient ON public.bookings (patient_id);
CREATE INDEX IF NOT EXISTS bookings_case ON public.bookings (case_id);

-- =====================================================
-- STEP 7: Booking and rescheduling carry the new fields
-- =====================================================
-- Same signatures as before. A booking takes phone, patient, case, mode and
-- kind from its link; a link without a mode books the host's first mode.
-- A reschedule keeps all of them.
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
  v_mode TEXT;
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

  SELECT COALESCE(v_ent.mode, h.modes[1]) INTO v_mode FROM public.booking_hosts h WHERE h.id = p_host_id;
  IF NOT EXISTS (SELECT 1 FROM public.booking_hosts WHERE id = p_host_id AND v_mode = ANY (modes)) THEN
    RAISE EXCEPTION 'This host does not offer this kind of visit' USING ERRCODE = '22023';
  END IF;

  PERFORM public.booking_assert_not_blocked(p_host_id, p_busy_from, p_busy_until);

  INSERT INTO public.bookings (
    entitlement_id, order_id, host_id, booking_type_id, starts_at, ends_at, busy_from, busy_until,
    invitee_name, invitee_email, invitee_phone, invitee_timezone, notes,
    patient_id, case_id, mode, kind
  ) VALUES (
    v_ent.id, v_ent.order_id, p_host_id, v_ent.booking_type_id, p_starts_at, p_ends_at, p_busy_from, p_busy_until,
    trim(p_name), NULLIF(lower(trim(p_email)), ''), v_ent.phone, p_timezone, NULLIF(trim(p_notes), ''),
    v_ent.patient_id, v_ent.case_id, v_mode, v_ent.kind
  )
  RETURNING * INTO v_booking;

  UPDATE public.booking_entitlements SET used = used + 1 WHERE id = v_ent.id;

  RETURN v_booking;
END;
$$;

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
  IF NOT EXISTS (SELECT 1 FROM public.booking_hosts WHERE id = p_host_id AND v_old.mode = ANY (modes)) THEN
    RAISE EXCEPTION 'This host does not offer this kind of visit' USING ERRCODE = '22023';
  END IF;

  PERFORM public.booking_assert_not_blocked(p_host_id, p_busy_from, p_busy_until);

  INSERT INTO public.bookings (
    entitlement_id, order_id, host_id, booking_type_id, starts_at, ends_at, busy_from, busy_until,
    invitee_name, invitee_email, invitee_phone, invitee_timezone, notes, rescheduled_from,
    patient_id, case_id, mode, kind
  ) VALUES (
    v_old.entitlement_id, v_old.order_id, p_host_id, v_old.booking_type_id, p_starts_at, p_ends_at, p_busy_from, p_busy_until,
    v_old.invitee_name, v_old.invitee_email, v_old.invitee_phone, COALESCE(p_timezone, v_old.invitee_timezone), v_old.notes, v_old.id,
    v_old.patient_id, v_old.case_id, v_old.mode, v_old.kind
  )
  RETURNING * INTO v_new;

  RETURN v_new;
END;
$$;

-- CREATE OR REPLACE keeps the grants from 20261014090000; repeated here so
-- this file is complete on its own
REVOKE ALL ON FUNCTION public.booking_book(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.booking_reschedule(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.booking_book(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.booking_reschedule(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO service_role;

-- =====================================================
-- STEP 8: Who am I? (helpers for row level security)
-- =====================================================
-- SECURITY DEFINER so the policies below don't recurse through each
-- other's RLS. Each returns an array, used as
-- "x = ANY ((SELECT public.fn())::UUID[])" so Postgres runs it once per query,
-- not once per row (keeps load low on the free plan).

-- Hosts (doctors) the current user signs in as
CREATE OR REPLACE FUNCTION public.my_host_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(array_agg(id), '{}') FROM public.booking_hosts WHERE user_id = auth.uid();
$$;

-- Hosts at the clinics where the current user works reception
CREATE OR REPLACE FUNCTION public.my_clinic_host_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(array_agg(h.id), '{}')
  FROM public.booking_hosts h
  JOIN public.clinic_members m ON m.clinic_id = h.clinic_id
  WHERE m.user_id = auth.uid();
$$;

-- Patient records linked to the current user's login
CREATE OR REPLACE FUNCTION public.my_patient_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(array_agg(id), '{}') FROM public.patients WHERE user_id = auth.uid();
$$;

-- Patients the current user may see as their doctor or clinic reception:
-- anyone with a booking or a case with one of those hosts
CREATE OR REPLACE FUNCTION public.my_care_patient_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH hosts AS (
    SELECT unnest(public.my_host_ids() || public.my_clinic_host_ids()) AS id
  )
  SELECT COALESCE(array_agg(DISTINCT p), '{}') FROM (
    SELECT b.patient_id AS p FROM public.bookings b JOIN hosts ON hosts.id = b.host_id WHERE b.patient_id IS NOT NULL
    UNION
    SELECT c.patient_id FROM public.cases c JOIN hosts ON hosts.id = c.host_id
  ) x;
$$;

REVOKE ALL ON FUNCTION public.my_host_ids() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_clinic_host_ids() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_patient_ids() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_care_patient_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_host_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_clinic_host_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_patient_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_care_patient_ids() TO authenticated, service_role;

-- =====================================================
-- STEP 9: Row level security
-- =====================================================
-- Admins manage everything new, like the booking tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clinics', 'clinic_members', 'patients', 'consent_versions', 'patient_consents', 'cases'
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

-- Public: clinic addresses and consent wording
DROP POLICY IF EXISTS "Anyone reads active clinics" ON public.clinics;
CREATE POLICY "Anyone reads active clinics" ON public.clinics
  FOR SELECT TO anon, authenticated USING (active);

DROP POLICY IF EXISTS "Anyone reads consent wording" ON public.consent_versions;
CREATE POLICY "Anyone reads consent wording" ON public.consent_versions
  FOR SELECT TO anon, authenticated USING (true);

-- Clinic staff see their own membership
DROP POLICY IF EXISTS "Staff read own membership" ON public.clinic_members;
CREATE POLICY "Staff read own membership" ON public.clinic_members
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- Doctors see their own host row
DROP POLICY IF EXISTS "Doctors read own host" ON public.booking_hosts;
CREATE POLICY "Doctors read own host" ON public.booking_hosts
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- Bookings: the doctor, the clinic's reception, the patient
DROP POLICY IF EXISTS "Care team reads bookings" ON public.bookings;
CREATE POLICY "Care team reads bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (host_id = ANY ((SELECT public.my_host_ids() || public.my_clinic_host_ids())::UUID[]));

DROP POLICY IF EXISTS "Patients read own bookings" ON public.bookings;
CREATE POLICY "Patients read own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (patient_id = ANY ((SELECT public.my_patient_ids())::UUID[]));

-- Cases: the doctor, the clinic's reception, the patient
DROP POLICY IF EXISTS "Care team reads cases" ON public.cases;
CREATE POLICY "Care team reads cases" ON public.cases
  FOR SELECT TO authenticated
  USING (host_id = ANY ((SELECT public.my_host_ids() || public.my_clinic_host_ids())::UUID[]));

DROP POLICY IF EXISTS "Patients read own cases" ON public.cases;
CREATE POLICY "Patients read own cases" ON public.cases
  FOR SELECT TO authenticated
  USING (patient_id = ANY ((SELECT public.my_patient_ids())::UUID[]));

-- Patients: themselves, and their doctors and clinic reception
DROP POLICY IF EXISTS "Patients read themselves" ON public.patients;
CREATE POLICY "Patients read themselves" ON public.patients
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Care team reads patients" ON public.patients;
CREATE POLICY "Care team reads patients" ON public.patients
  FOR SELECT TO authenticated
  USING (id = ANY ((SELECT public.my_care_patient_ids())::UUID[]));

-- Consents: the patient and their doctors and clinic reception
DROP POLICY IF EXISTS "Patients read own consents" ON public.patient_consents;
CREATE POLICY "Patients read own consents" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (patient_id = ANY ((SELECT public.my_patient_ids())::UUID[]));

DROP POLICY IF EXISTS "Care team reads consents" ON public.patient_consents;
CREATE POLICY "Care team reads consents" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (patient_id = ANY ((SELECT public.my_care_patient_ids())::UUID[]));

-- =====================================================
-- STEP 10: Starting data (the clinic and both doctors)
-- =====================================================
-- The doctors start inactive: nobody can book them until PR 2 shows them
-- and an admin switches them on. Registration numbers, council and
-- Dr. Neel Kamal's qualification and specialty are filled in by an admin.
INSERT INTO public.clinics (name, slug, address_line1, city, state, country, timezone)
VALUES ('Srivastava Family Clinic', 'srivastava-family-clinic', 'FC Road', 'Pune', 'Maharashtra', 'IN', 'Asia/Kolkata')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.booking_hosts (name, slug, title, timezone, active, kind, qualification, specialty, languages, clinic_id, modes)
SELECT v.name, v.slug, v.title, 'Asia/Kolkata', false, 'doctor', v.qualification, v.specialty,
       '{}', c.id, '{in_person,video,audio}'
FROM public.clinics c,
  (VALUES
    ('Dr. Garima Srivastava', 'garima-srivastava', 'General Physician', 'MBBS (KGMC Lucknow)', 'General Physician'),
    ('Dr. Neel Kamal Srivastava', 'neel-kamal-srivastava', NULL, NULL, NULL)
  ) AS v (name, slug, title, qualification, specialty)
WHERE c.slug = 'srivastava-family-clinic'
ON CONFLICT (slug) DO NOTHING;
