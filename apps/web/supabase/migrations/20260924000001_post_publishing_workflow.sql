-- Migration: Post publishing workflow
-- Description: Editorial workflow for blog posts.
--   * `posts` becomes the live table. Clients can no longer insert or update it;
--     it is only written by `create_post`, `approve_post` and `unpublish_post`.
--   * `post_drafts` holds the author's working copy and its workflow status:
--       draft -> copy_ready -> web_ready -> (approved | changes_requested)
--     Any content edit sends the draft back to `draft`, while the approved
--     version stays live in `posts` until the next approval.
--   * `app_admins` / `is_admin()` replace the client-only NEXT_PUBLIC_SWAPNIL_ID check.
--   * Reaction counts on `posts` are maintained by a trigger on `emotions`.

-- =====================================================
-- STEP 1: Admins
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS on and no policies: only SECURITY DEFINER functions can read it.
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Swapnil Srivastava
INSERT INTO public.app_admins (user_id)
VALUES ('c8ae336b-5fc3-43e7-8c33-d253b8361d79')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid());
$$;

COMMENT ON FUNCTION public.is_admin() IS 'True when the current user may approve posts';

-- =====================================================
-- STEP 2: Live post columns and constraints
-- =====================================================
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.posts
SET published_at = COALESCE(updated_at, created_at)
WHERE published AND approved AND published_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_username_slug_key') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_username_slug_key UNIQUE (username, slug);
  END IF;
END $$;

-- =====================================================
-- STEP 3: Drafts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_drafts (
  post_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  uid UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  audio TEXT,
  "videoLink" TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'copy_ready', 'web_ready', 'approved', 'changes_requested')),
  review_note TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_drafts_uid_idx ON public.post_drafts (uid);
CREATE INDEX IF NOT EXISTS post_drafts_status_idx ON public.post_drafts (status);

ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authors and admins can view drafts" ON public.post_drafts;
CREATE POLICY "Authors and admins can view drafts"
ON public.post_drafts FOR SELECT
TO authenticated
USING (uid = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Authors can update their own drafts" ON public.post_drafts;
CREATE POLICY "Authors can update their own drafts"
ON public.post_drafts FOR UPDATE
TO authenticated
USING (uid = (SELECT auth.uid()))
WITH CHECK (uid = (SELECT auth.uid()));

-- Enforces the workflow for authors. Privileged roles (the SECURITY DEFINER
-- functions below run as the table owner, and the service role) skip the checks.
CREATE OR REPLACE FUNCTION public.post_drafts_enforce_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();

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
     OR NEW."videoLink" IS DISTINCT FROM OLD."videoLink" THEN
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

DROP TRIGGER IF EXISTS post_drafts_enforce_workflow ON public.post_drafts;
CREATE TRIGGER post_drafts_enforce_workflow
BEFORE UPDATE ON public.post_drafts
FOR EACH ROW EXECUTE FUNCTION public.post_drafts_enforce_workflow();

-- Backfill a draft for every existing post.
INSERT INTO public.post_drafts (post_id, uid, title, content, audio, "videoLink", status, created_at, updated_at)
SELECT
  p.id,
  p.uid,
  COALESCE(p.title, ''),
  COALESCE(p.content, ''),
  p.audio,
  p."videoLink",
  CASE WHEN p.published AND p.approved THEN 'approved' ELSE 'draft' END,
  COALESCE(p.created_at, now()),
  COALESCE(p.updated_at, p.created_at, now())
FROM public.posts p
WHERE p.uid IS NOT NULL
ON CONFLICT (post_id) DO NOTHING;

-- =====================================================
-- STEP 4: Posts policies
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.posts;
-- From 20260108000001_enable_anonymous_signin_support.sql, if it was applied
DROP POLICY IF EXISTS "Only permanent users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;

CREATE POLICY "Live posts are public; authors and admins see their own"
ON public.posts FOR SELECT
TO public
USING (
  (published AND approved)
  OR uid = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

CREATE POLICY "Authors and admins can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (uid = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- No INSERT / UPDATE policies: writes go through the functions below.

-- =====================================================
-- STEP 5: Workflow functions
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_post(p_title TEXT)
RETURNS public.posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile public.profiles;
  v_title TEXT := btrim(COALESCE(p_title, ''));
  v_base TEXT;
  v_slug TEXT;
  v_n INT := 1;
  v_post public.posts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to create a post' USING ERRCODE = '42501';
  END IF;
  IF COALESCE((auth.jwt()->>'is_anonymous')::BOOLEAN, false) THEN
    RAISE EXCEPTION 'Guest accounts cannot create posts' USING ERRCODE = '42501';
  END IF;
  IF length(v_title) < 3 OR length(v_title) > 100 THEN
    RAISE EXCEPTION 'Title must be between 3 and 100 characters' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF v_profile.username IS NULL THEN
    RAISE EXCEPTION 'Choose a username before creating posts' USING ERRCODE = '22023';
  END IF;

  v_base := btrim(regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'), '-');
  IF v_base = '' THEN
    v_base := 'post';
  END IF;
  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE username = v_profile.username AND slug = v_slug) LOOP
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  END LOOP;

  INSERT INTO public.posts (uid, username, photo_url, title, slug, content, published, approved)
  VALUES (v_uid, v_profile.username, v_profile.avatar_url, v_title, v_slug, '', false, false)
  RETURNING * INTO v_post;

  INSERT INTO public.post_drafts (post_id, uid, title, content)
  VALUES (v_post.id, v_uid, v_title, '<p>hello world!</p>');

  RETURN v_post;
END;
$$;

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

  UPDATE public.post_drafts
  SET status = 'approved',
      review_note = NULL,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE post_id = p_post_id;

  RETURN v_post;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_post_changes(p_post_id UUID, p_note TEXT)
RETURNS public.post_drafts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.post_drafts;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only the site admin can review posts' USING ERRCODE = '42501';
  END IF;
  IF length(btrim(COALESCE(p_note, ''))) = 0 THEN
    RAISE EXCEPTION 'Please explain what needs to change' USING ERRCODE = '22023';
  END IF;

  UPDATE public.post_drafts
  SET status = 'changes_requested',
      review_note = btrim(p_note),
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE post_id = p_post_id AND status = 'web_ready'
  RETURNING * INTO v_draft;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only Web Ready posts can be sent back' USING ERRCODE = '22023';
  END IF;

  RETURN v_draft;
END;
$$;

-- Takes a post off the website. It needs a fresh approval to go live again.
CREATE OR REPLACE FUNCTION public.unpublish_post(p_post_id UUID)
RETURNS public.posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post public.posts;
BEGIN
  UPDATE public.posts
  SET published = false,
      approved = false,
      updated_at = now()
  WHERE id = p_post_id
    AND (uid = auth.uid() OR public.is_admin())
  RETURNING * INTO v_post;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found' USING ERRCODE = '42501';
  END IF;

  UPDATE public.post_drafts
  SET status = 'draft', submitted_at = NULL
  WHERE post_id = p_post_id AND status = 'approved';

  RETURN v_post;
END;
$$;

REVOKE ALL ON FUNCTION public.create_post(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_post(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.request_post_changes(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unpublish_post(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_post(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_post(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_post_changes(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_post(UUID) TO authenticated;

-- =====================================================
-- STEP 6: Reactions
-- =====================================================
-- Remove duplicate reactions before adding the unique constraint.
DELETE FROM public.emotions e
USING public.emotions d
WHERE e.post_id = d.post_id
  AND e.user_id = d.user_id
  AND e.emotion_type = d.emotion_type
  AND e.id > d.id;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'emotions_post_user_type_key') THEN
    ALTER TABLE public.emotions
      ADD CONSTRAINT emotions_post_user_type_key UNIQUE (post_id, user_id, emotion_type);
  END IF;
END $$;

-- Deleting a post removes its reactions.
ALTER TABLE public.emotions DROP CONSTRAINT IF EXISTS emotions_post_id_fkey;
ALTER TABLE public.emotions
  ADD CONSTRAINT emotions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Only signed-in (non-guest) readers can react, as themselves, to live posts.
DROP POLICY IF EXISTS "Enable insert for authenticated users only and where posts are " ON public.emotions;
DROP POLICY IF EXISTS "Signed-in readers can react to live posts" ON public.emotions;
CREATE POLICY "Signed-in readers can react to live posts"
ON public.emotions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND NOT COALESCE(((SELECT auth.jwt())->>'is_anonymous')::BOOLEAN, false)
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = emotions.post_id AND p.published AND p.approved
  )
);

CREATE OR REPLACE FUNCTION public.sync_post_emotion_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post_id UUID := COALESCE(NEW.post_id, OLD.post_id);
BEGIN
  UPDATE public.posts p
  SET like_count    = (SELECT count(*) FROM public.emotions e WHERE e.post_id = v_post_id AND e.emotion_type = 'like'),
      dislike_count = (SELECT count(*) FROM public.emotions e WHERE e.post_id = v_post_id AND e.emotion_type = 'dislike'),
      heart_count   = (SELECT count(*) FROM public.emotions e WHERE e.post_id = v_post_id AND e.emotion_type = 'heart'),
      clap_count    = (SELECT count(*) FROM public.emotions e WHERE e.post_id = v_post_id AND e.emotion_type = 'clap')
  WHERE p.id = v_post_id;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_post_emotion_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.post_drafts_enforce_workflow() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS emotions_sync_post_counts ON public.emotions;
CREATE TRIGGER emotions_sync_post_counts
AFTER INSERT OR DELETE ON public.emotions
FOR EACH ROW EXECUTE FUNCTION public.sync_post_emotion_counts();

-- Bring the stored counts in line with the reactions table.
UPDATE public.posts p
SET like_count    = (SELECT count(*) FROM public.emotions e WHERE e.post_id = p.id AND e.emotion_type = 'like'),
    dislike_count = (SELECT count(*) FROM public.emotions e WHERE e.post_id = p.id AND e.emotion_type = 'dislike'),
    heart_count   = (SELECT count(*) FROM public.emotions e WHERE e.post_id = p.id AND e.emotion_type = 'heart'),
    clap_count    = (SELECT count(*) FROM public.emotions e WHERE e.post_id = p.id AND e.emotion_type = 'clap');
