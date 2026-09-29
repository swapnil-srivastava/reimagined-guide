-- Migration: Post views retention
-- Description: Delete view rows older than 90 days for every post, not only
-- the post being viewed, so rows of posts nobody reads anymore are removed
-- too. Uses post_views_day_idx. Otherwise the same as in
-- 20260929202551_post_views.sql.

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

    -- Keep 90 days of rows across all posts; totals stay in view_count
    DELETE FROM public.post_views WHERE day < current_date - 90;

    RETURN v_count;
  END IF;

  RETURN v_post.view_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_post_view(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_post_view(UUID, TEXT, UUID) TO service_role;
