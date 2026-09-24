-- Rollback for migrations/20260924000001_post_publishing_workflow.sql
--
-- Run in the Supabase SQL editor only if the previous frontend has to keep
-- working (e.g. the PR is abandoned). It restores the policies that were live
-- before the migration (recorded on 2026-09-24) and removes the workflow
-- objects. Added columns (posts.published_at, posts.approved_by), the unique
-- constraints and the ON DELETE CASCADE on emotions are kept; they are harmless.
--
-- Drafts that were never approved are lost when post_drafts is dropped.

BEGIN;

-- posts: original policies
DROP POLICY IF EXISTS "Live posts are public; authors and admins see their own" ON public.posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON public.posts;

CREATE POLICY "Enable read access for all users"
ON public.posts FOR SELECT TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on email"
ON public.posts FOR UPDATE TO public
USING ((SELECT auth.uid()) = uid)
WITH CHECK ((SELECT auth.uid()) = uid);

CREATE POLICY "Enable delete for users based on user_id"
ON public.posts FOR DELETE TO public
USING ((SELECT auth.uid()) = uid);

-- emotions: original insert policy (name is truncated to 63 characters by Postgres)
DROP POLICY IF EXISTS "Signed-in readers can react to live posts" ON public.emotions;
CREATE POLICY "Enable insert for authenticated users only and where posts are "
ON public.emotions FOR INSERT TO authenticated
WITH CHECK (
  true AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = emotions.post_id
      AND (posts.published = true OR posts.uid = auth.uid())
  )
);

-- Workflow objects
DROP TRIGGER IF EXISTS emotions_sync_post_counts ON public.emotions;
DROP FUNCTION IF EXISTS public.sync_post_emotion_counts();
DROP FUNCTION IF EXISTS public.create_post(TEXT);
DROP FUNCTION IF EXISTS public.approve_post(UUID);
DROP FUNCTION IF EXISTS public.request_post_changes(UUID, TEXT);
DROP FUNCTION IF EXISTS public.unpublish_post(UUID);
DROP TABLE IF EXISTS public.post_drafts;
DROP FUNCTION IF EXISTS public.post_drafts_enforce_workflow();
DROP FUNCTION IF EXISTS public.is_admin();
DROP TABLE IF EXISTS public.app_admins;

COMMIT;
