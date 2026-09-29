-- Migration: Post tags
-- Description: Topic tags such as "Java" or "Frontend" for blog posts.
--   * `tags` holds one row per topic, keyed by a URL slug ("java", "spring-boot").
--   * `post_tags` links live posts to their tags.
--   * Authors type tags on their draft (`post_drafts.tags`). Tags follow the
--     editorial workflow: changing them sends the draft back to Draft, and
--     `approve_post` copies them to the live post, creating new tags as needed.
--     Readers never see a tag that has not been approved.
--   * `get_posts_by_tags` returns live posts that carry ALL of the given tags.

-- =====================================================
-- STEP 1: Helpers
-- =====================================================

-- URL slug for a tag name: "C++" -> "cplusplus", "C#" -> "csharp",
-- "Spring Boot" -> "spring-boot", "Node.js" -> "node-js".
-- Keep in sync with `tagSlug` in lib/tags.ts.
CREATE OR REPLACE FUNCTION public.tag_slug(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT btrim(
    regexp_replace(
      replace(replace(lower(COALESCE(p_name, '')), '+', 'plus'), '#', 'sharp'),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-'
  );
$$;

-- Tidies the tags an author typed: trims and collapses spaces, drops empty
-- entries and duplicates (by slug), and enforces the limits.
-- Keep the limits in sync with lib/tags.ts.
CREATE OR REPLACE FUNCTION public.normalize_post_tags(p_tags TEXT[])
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
  v_slug TEXT;
  v_seen TEXT[] := '{}';
  v_out TEXT[] := '{}';
BEGIN
  FOREACH v_name IN ARRAY COALESCE(p_tags, '{}') LOOP
    v_name := btrim(regexp_replace(v_name, '\s+', ' ', 'g'));
    CONTINUE WHEN v_name IS NULL OR v_name = '';

    IF length(v_name) > 32 THEN
      RAISE EXCEPTION 'Tags can be at most 32 characters long: %', v_name USING ERRCODE = '22023';
    END IF;

    v_slug := public.tag_slug(v_name);
    IF v_slug = '' THEN
      RAISE EXCEPTION 'Tags need at least one letter or number: %', v_name USING ERRCODE = '22023';
    END IF;

    CONTINUE WHEN v_slug = ANY (v_seen);
    v_seen := v_seen || v_slug;
    v_out := v_out || v_name;
  END LOOP;

  IF cardinality(v_out) > 5 THEN
    RAISE EXCEPTION 'A post can have at most 5 tags' USING ERRCODE = '22023';
  END IF;

  RETURN v_out;
END;
$$;

-- =====================================================
-- STEP 2: Tables
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Topics for posts. Created when a post using them is approved.';

CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- The primary key covers lookups by post; this one covers "posts for a tag".
CREATE INDEX IF NOT EXISTS post_tags_tag_id_idx ON public.post_tags (tag_id);

COMMENT ON TABLE public.post_tags IS 'Approved tags of each post. Written only by approve_post.';

-- The author's proposed tags, stored as the names they typed.
ALTER TABLE public.post_drafts
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_drafts_tags_max') THEN
    ALTER TABLE public.post_drafts
      ADD CONSTRAINT post_drafts_tags_max CHECK (cardinality(tags) <= 5);
  END IF;
END $$;

-- =====================================================
-- STEP 3: Row level security
-- =====================================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Tags only exist once a post using them was approved, so they are public.
DROP POLICY IF EXISTS "Tags are public" ON public.tags;
CREATE POLICY "Tags are public"
ON public.tags FOR SELECT
TO public
USING (true);

-- The admin can rename, merge (by deleting) or add tags.
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
CREATE POLICY "Admins can insert tags"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
CREATE POLICY "Admins can update tags"
ON public.tags FOR UPDATE
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;
CREATE POLICY "Admins can delete tags"
ON public.tags FOR DELETE
TO authenticated
USING ((SELECT public.is_admin()));

-- Same visibility as the post itself.
DROP POLICY IF EXISTS "Tags of visible posts are visible" ON public.post_tags;
CREATE POLICY "Tags of visible posts are visible"
ON public.post_tags FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_tags.post_id
      AND (
        (p.published AND p.approved)
        OR p.uid = (SELECT auth.uid())
        OR (SELECT public.is_admin())
      )
  )
);

-- No INSERT / UPDATE / DELETE policies on post_tags: approve_post writes it.

-- =====================================================
-- STEP 4: Workflow
-- =====================================================

-- Same as in 20260924011041_post_publishing_workflow.sql, plus tags:
-- they are normalized for everyone, and changing them restarts the workflow.
CREATE OR REPLACE FUNCTION public.post_drafts_enforce_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.tags := public.normalize_post_tags(NEW.tags);

  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF NEW.post_id <> OLD.post_id OR NEW.uid <> OLD.uid THEN
    RAISE EXCEPTION 'post_id and uid cannot be changed' USING ERRCODE = '42501';
  END IF;

  -- Review fields belong to the admin.
  NEW.review_note := OLD.review_note;
  NEW.reviewed_at := OLD.reviewed_at;
  NEW.reviewed_by := OLD.reviewed_by;
  NEW.submitted_at := OLD.submitted_at;
  NEW.created_at := OLD.created_at;

  -- Any content change restarts the workflow.
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.audio IS DISTINCT FROM OLD.audio
     OR NEW."videoLink" IS DISTINCT FROM OLD."videoLink"
     OR NEW.tags IS DISTINCT FROM OLD.tags THEN
    NEW.status := 'draft';
    NEW.submitted_at := NULL;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'draft' THEN
      NEW.submitted_at := NULL;
    ELSIF NEW.status = 'copy_ready' AND OLD.status IN ('draft', 'changes_requested') THEN
      NULL;
    ELSIF NEW.status = 'web_ready' AND OLD.status = 'copy_ready' THEN
      NEW.submitted_at := now();
    ELSE
      RAISE EXCEPTION 'Cannot move a post from % to %', OLD.status, NEW.status
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.post_drafts_enforce_workflow() FROM PUBLIC, anon, authenticated;

-- Same as before, plus copying the draft's tags to the live post.
CREATE OR REPLACE FUNCTION public.approve_post(p_post_id UUID)
RETURNS public.posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.post_drafts;
  v_post public.posts;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only the site admin can approve posts' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_draft FROM public.post_drafts WHERE post_id = p_post_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_draft.status <> 'web_ready' THEN
    RAISE EXCEPTION 'Only Web Ready posts can be approved (current status: %)', v_draft.status
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.posts
  SET title = v_draft.title,
      content = v_draft.content,
      audio = v_draft.audio,
      "videoLink" = v_draft."videoLink",
      published = true,
      approved = true,
      approved_by = auth.uid(),
      published_at = COALESCE(published_at, now()),
      updated_at = now()
  WHERE id = p_post_id
  RETURNING * INTO v_post;

  -- New tags keep the spelling of the first approved post that used them.
  INSERT INTO public.tags (slug, name)
  SELECT public.tag_slug(t.name), t.name
  FROM unnest(v_draft.tags) AS t(name)
  ON CONFLICT (slug) DO NOTHING;

  DELETE FROM public.post_tags WHERE post_id = p_post_id;
  INSERT INTO public.post_tags (post_id, tag_id)
  SELECT p_post_id, tg.id
  FROM public.tags tg
  WHERE tg.slug IN (SELECT public.tag_slug(t.name) FROM unnest(v_draft.tags) AS t(name))
  ON CONFLICT DO NOTHING;

  UPDATE public.post_drafts
  SET status = 'approved',
      review_note = NULL,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE post_id = p_post_id;

  RETURN v_post;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_post(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_post(UUID) TO authenticated;

-- =====================================================
-- STEP 5: Reading posts by tag
-- =====================================================
-- These run as the caller, so row level security still applies.

-- Live posts, newest first, that carry ALL of p_tags (slugs). No tags means
-- every live post. p_before is the created_at of the last post already shown.
CREATE OR REPLACE FUNCTION public.get_posts_by_tags(
  p_tags TEXT[] DEFAULT '{}',
  p_username TEXT DEFAULT NULL,
  p_before TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS SETOF public.posts
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT p.*
  FROM public.posts p
  WHERE p.published
    AND p.approved
    AND (p_username IS NULL OR p.username = p_username)
    AND (p_before IS NULL OR p.created_at < p_before)
    AND (
      SELECT count(DISTINCT tg.slug)
      FROM public.post_tags pt
      JOIN public.tags tg ON tg.id = pt.tag_id
      WHERE pt.post_id = p.id AND tg.slug = ANY (p_tags)
    ) = cardinality(ARRAY(SELECT DISTINCT unnest(p_tags)))
  ORDER BY p.created_at DESC
  LIMIT least(greatest(COALESCE(p_limit, 20), 1), 100);
$$;

-- Tags in use on live posts (optionally one author's), with post counts.
CREATE OR REPLACE FUNCTION public.get_tag_counts(p_username TEXT DEFAULT NULL)
RETURNS TABLE (slug TEXT, name TEXT, post_count BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tg.slug, tg.name, count(*) AS post_count
  FROM public.tags tg
  JOIN public.post_tags pt ON pt.tag_id = tg.id
  JOIN public.posts p ON p.id = pt.post_id
  WHERE p.published
    AND p.approved
    AND (p_username IS NULL OR p.username = p_username)
  GROUP BY tg.slug, tg.name
  ORDER BY count(*) DESC, tg.name;
$$;

-- Live posts sharing the most tags with the given post.
CREATE OR REPLACE FUNCTION public.get_related_posts(p_post_id UUID, p_limit INT DEFAULT 3)
RETURNS SETOF public.posts
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT p.*
  FROM public.posts p
  JOIN public.post_tags pt ON pt.post_id = p.id
  WHERE pt.tag_id IN (SELECT tag_id FROM public.post_tags WHERE post_id = p_post_id)
    AND p.id <> p_post_id
    AND p.published
    AND p.approved
  GROUP BY p.id
  ORDER BY count(*) DESC, p.created_at DESC
  LIMIT least(greatest(COALESCE(p_limit, 3), 1), 12);
$$;

GRANT EXECUTE ON FUNCTION public.get_posts_by_tags(TEXT[], TEXT, TIMESTAMPTZ, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tag_counts(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_related_posts(UUID, INT) TO anon, authenticated;
