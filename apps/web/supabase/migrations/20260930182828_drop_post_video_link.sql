-- Migration: Drop posts."videoLink" and post_drafts."videoLink"
-- Description: Videos are now embedded inline in the post content (see
-- apps/web/lib/tiptap/VideoEmbed.ts), so the separate video link column is no
-- longer read or written. It was empty in every row when this was applied.
-- The draft workflow trigger and approve_post are the same as in
-- 20260929174116_post_tags.sql without the column; they are replaced first so
-- nothing references it when it is dropped.

-- =====================================================
-- STEP 1: Stop referencing the column
-- =====================================================

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
-- STEP 2: Drop the column
-- =====================================================

ALTER TABLE public.post_drafts DROP COLUMN IF EXISTS "videoLink";
ALTER TABLE public.posts DROP COLUMN IF EXISTS "videoLink";
