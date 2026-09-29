-- Migration: Post views
-- Description: View counts and "popular this month" for blog posts.
--   * A view counts once per reader, per post, per day. The API route
--     (/api/posts/view) sends an anonymous visitor hash (IP + a daily
--     salt, hashed server side); no raw IP or cookie is stored.
--   * `posts.view_count` is the all-time total, raised only when a new
--     (post, visitor, day) row is recorded.
--   * `post_views` keeps 90 days of rows for "popular this month".
--   * Only the service role can record views, so the count can't be
--     inflated by calling the database from the browser.

-- =====================================================
-- STEP 1: Tables
-- =====================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS view_count BIGINT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.post_views (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL CHECK (visitor_hash ~ '^[0-9a-f]{64}$'),
  day DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (post_id, day, visitor_hash)
);

-- "Views in the last N days" across all posts
CREATE INDEX IF NOT EXISTS post_views_day_idx ON public.post_views (day);

COMMENT ON TABLE public.post_views IS
  'One row per anonymous visitor, post and day. Written only by record_post_view; kept 90 days.';

-- RLS on and no policies: only SECURITY DEFINER functions and the service
-- role can read or write it.
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Recording a view
-- =====================================================
-- Returns the post's view count, or NULL when the view was not counted
-- (post not live, or the viewer is its author or an admin).
CREATE OR REPLACE FUNCTION public.record_post_view(
  p_post_id UUID,
  p_visitor_hash TEXT,
  p_viewer UUID DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post public.posts;
  v_count BIGINT;
BEGIN
  SELECT * INTO v_post FROM public.posts WHERE id = p_post_id;
  IF NOT FOUND OR NOT (v_post.published AND v_post.approved) THEN
    RETURN NULL;
  END IF;

  -- The author's and admins' own visits don't count
  IF p_viewer IS NOT NULL AND (
    p_viewer = v_post.uid
    OR EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = p_viewer)
  ) THEN
    RETURN v_post.view_count;
  END IF;

  INSERT INTO public.post_views (post_id, visitor_hash, day)
  VALUES (p_post_id, p_visitor_hash, current_date)
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    UPDATE public.posts
    SET view_count = view_count + 1
    WHERE id = p_post_id
    RETURNING view_count INTO v_count;

    -- Keep 90 days of rows for this post; the total stays in view_count
    DELETE FROM public.post_views
    WHERE post_id = p_post_id AND day < current_date - 90;

    RETURN v_count;
  END IF;

  RETURN v_post.view_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_post_view(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_post_view(UUID, TEXT, UUID) TO service_role;

-- =====================================================
-- STEP 3: Popular posts
-- =====================================================
-- Live posts with the most views in the last p_days, most viewed first.
-- SECURITY DEFINER to read post_views; it returns only live posts.
CREATE OR REPLACE FUNCTION public.get_popular_posts(p_days INT DEFAULT 30, p_limit INT DEFAULT 3)
RETURNS SETOF public.posts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.*
  FROM public.posts p
  JOIN (
    SELECT v.post_id, count(*) AS recent_views
    FROM public.post_views v
    WHERE v.day > current_date - least(greatest(COALESCE(p_days, 30), 1), 90)
    GROUP BY v.post_id
  ) r ON r.post_id = p.id
  WHERE p.published AND p.approved
  ORDER BY r.recent_views DESC, p.created_at DESC
  LIMIT least(greatest(COALESCE(p_limit, 3), 1), 12);
$$;

REVOKE ALL ON FUNCTION public.get_popular_posts(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_popular_posts(INT, INT) TO anon, authenticated;
