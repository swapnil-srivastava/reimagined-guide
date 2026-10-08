-- Migration: Newsletter subscribers, page views and link clicks
-- Description:
--   * newsletter_subscribers: double opt-in signups from /links. A row is
--     'pending' until the confirmation link is used. Only the server (service
--     role) reads or writes it.
--   * page_views / link_clicks: one row per anonymous visitor, page (and link)
--     and day, the same way post_views counts blog readers (see
--     20260929202551_post_views.sql). No raw IP or cookie is stored.
--   * page_stats keeps all-time totals; the per-day rows are kept 90 days.
--   * get_page_stats() returns the numbers for the admin dashboard.

-- =====================================================
-- STEP 1: Newsletter subscribers
-- =====================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE
    CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 254),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  -- Secret used in the confirm and unsubscribe links
  token TEXT NOT NULL UNIQUE CHECK (token ~ '^[0-9a-f]{64}$'),
  source TEXT CHECK (source ~ '^[a-z0-9-]{1,40}$'),
  locale TEXT CHECK (locale ~ '^[a-zA-Z-]{2,10}$'),
  -- Daily-salted hash of the signup IP, only used to rate limit signups
  signup_ip_hash TEXT CHECK (signup_ip_hash ~ '^[0-9a-f]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_ip_idx
  ON public.newsletter_subscribers (signup_ip_hash, confirmation_sent_at);

-- RLS on and no policies: only the service role can read or write it
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.newsletter_subscribers IS
  'Newsletter signups (double opt-in). Written only by the /api/newsletter routes.';

-- =====================================================
-- STEP 2: Page views and link clicks
-- =====================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  page TEXT NOT NULL CHECK (page ~ '^[a-z0-9-]{1,40}$'),
  visitor_hash TEXT NOT NULL CHECK (visitor_hash ~ '^[0-9a-f]{64}$'),
  day DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (page, day, visitor_hash)
);

CREATE TABLE IF NOT EXISTS public.link_clicks (
  page TEXT NOT NULL CHECK (page ~ '^[a-z0-9-]{1,40}$'),
  link_id TEXT NOT NULL CHECK (link_id ~ '^[a-z0-9_-]{1,60}$'),
  visitor_hash TEXT NOT NULL CHECK (visitor_hash ~ '^[0-9a-f]{64}$'),
  day DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (page, link_id, day, visitor_hash)
);

-- All-time totals. link_id '' is the page's own views.
CREATE TABLE IF NOT EXISTS public.page_stats (
  page TEXT NOT NULL,
  link_id TEXT NOT NULL DEFAULT '',
  total BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (page, link_id)
);

CREATE INDEX IF NOT EXISTS page_views_day_idx ON public.page_views (day);
CREATE INDEX IF NOT EXISTS link_clicks_day_idx ON public.link_clicks (day);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Recording a view or a click
-- =====================================================
-- p_link_id NULL = a page view, otherwise a click on that link.
-- Returns true when it was counted (a new visitor for that page/link today).
-- Admins' own visits are not counted.
CREATE OR REPLACE FUNCTION public.record_page_event(
  p_page TEXT,
  p_link_id TEXT,
  p_visitor_hash TEXT,
  p_viewer UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_viewer IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = p_viewer) THEN
    RETURN false;
  END IF;

  IF p_link_id IS NULL THEN
    INSERT INTO public.page_views (page, visitor_hash, day)
    VALUES (p_page, p_visitor_hash, current_date)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.link_clicks (page, link_id, visitor_hash, day)
    VALUES (p_page, p_link_id, p_visitor_hash, current_date)
    ON CONFLICT DO NOTHING;
  END IF;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.page_stats (page, link_id, total)
  VALUES (p_page, COALESCE(p_link_id, ''), 1)
  ON CONFLICT (page, link_id) DO UPDATE SET total = public.page_stats.total + 1;

  -- Keep 90 days of rows; the totals stay in page_stats
  DELETE FROM public.page_views WHERE day < current_date - 90;
  DELETE FROM public.link_clicks WHERE day < current_date - 90;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.record_page_event(TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_page_event(TEXT, TEXT, TEXT, UUID) TO service_role;

-- =====================================================
-- STEP 4: Stats for the admin dashboard
-- =====================================================
-- Admins only; returns NULL for everyone else.
CREATE OR REPLACE FUNCTION public.get_page_stats(p_page TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'views_today', (SELECT count(*) FROM public.page_views
                    WHERE page = p_page AND day = current_date),
    'views_7d', (SELECT count(*) FROM public.page_views
                 WHERE page = p_page AND day > current_date - 7),
    'views_30d', (SELECT count(*) FROM public.page_views
                  WHERE page = p_page AND day > current_date - 30),
    'views_total', COALESCE((SELECT total FROM public.page_stats
                             WHERE page = p_page AND link_id = ''), 0),
    'links', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'link_id', s.link_id,
               'clicks_30d', COALESCE(r.clicks, 0),
               'clicks_total', s.total)
             ORDER BY COALESCE(r.clicks, 0) DESC, s.total DESC)
      FROM public.page_stats s
      LEFT JOIN (
        SELECT link_id, count(*) AS clicks
        FROM public.link_clicks
        WHERE page = p_page AND day > current_date - 30
        GROUP BY link_id
      ) r ON r.link_id = s.link_id
      WHERE s.page = p_page AND s.link_id <> ''
    ), '[]'::jsonb),
    'subscribers', CASE WHEN p_page = 'links' THEN jsonb_build_object(
      'confirmed', (SELECT count(*) FROM public.newsletter_subscribers WHERE status = 'confirmed'),
      'pending', (SELECT count(*) FROM public.newsletter_subscribers WHERE status = 'pending')
    ) END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_page_stats(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_page_stats(TEXT) TO authenticated;
