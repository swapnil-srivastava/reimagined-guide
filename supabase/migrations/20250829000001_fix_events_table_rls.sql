-- Fix Row Level Security for Events Table
-- Run this in Supabase SQL Editor to resolve security issues

-- =======================================
-- EVENTS TABLE RLS SECURITY FIX
-- =======================================

-- Step 1: Enable Row Level Security on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Events can be created by authenticated users" ON public.events;
DROP POLICY IF EXISTS "Events can be updated by organizers" ON public.events;
DROP POLICY IF EXISTS "Events can be deleted by organizers" ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.events;
DROP POLICY IF EXISTS "Enable update for organizers" ON public.events;
DROP POLICY IF EXISTS "Enable delete for organizers" ON public.events;

-- Step 3: Create comprehensive RLS policies

-- Policy 1: Allow everyone (including anonymous users) to view all events
-- This is needed for the invite page to work for non-authenticated users
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT 
    USING (true);

-- Policy 2: Allow authenticated users to create events
-- When creating, the organizer_id should be set to the current user
-- Using (select auth.uid()) for better performance
CREATE POLICY "Events can be created by authenticated users" ON public.events
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND organizer_id = (select auth.uid())
    );

-- Policy 3: Allow organizers to update their own events
-- Also allow admin users (if you have admin functionality)
-- Using (select auth.uid()) for better performance
CREATE POLICY "Events can be updated by organizers" ON public.events
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND organizer_id = (select auth.uid())
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND organizer_id = (select auth.uid())
    );

-- Policy 4: Allow organizers to delete their own events
-- Using (select auth.uid()) for better performance
CREATE POLICY "Events can be deleted by organizers" ON public.events
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND organizer_id = (select auth.uid())
    );

-- Step 4: Grant necessary permissions
-- Allow anonymous users to read events (for public invite pages)
GRANT SELECT ON public.events TO anon;

-- Allow authenticated users full access (controlled by RLS policies)
GRANT ALL ON public.events TO authenticated;

-- Step 5: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_date_time ON public.events(date, time);

-- Step 6: Add foreign key constraint if it doesn't exist
-- This ensures organizer_id references a valid user
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'events_organizer_id_fkey'
        AND table_name = 'events'
    ) THEN
        -- Check if profiles table exists, if not try users table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
            ALTER TABLE public.events 
            ADD CONSTRAINT events_organizer_id_fkey 
            FOREIGN KEY (organizer_id) 
            REFERENCES public.profiles(id) 
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Step 7: Update existing events to have proper organizer_id if they're null
-- You may want to set a default organizer for existing events
-- UPDATE public.events 
-- SET organizer_id = 'your-admin-user-id' 
-- WHERE organizer_id IS NULL;

-- Step 8: Add table and column comments for documentation
COMMENT ON TABLE public.events IS 'Events table with proper RLS policies - allows public reading and organizer management';
COMMENT ON COLUMN public.events.organizer_id IS 'UUID of the user who created/organized the event (references profiles.id)';
COMMENT ON COLUMN public.events.title IS 'Event title/name';
COMMENT ON COLUMN public.events.description IS 'Event description (optional)';
COMMENT ON COLUMN public.events.date IS 'Event date';
COMMENT ON COLUMN public.events.time IS 'Event time';
COMMENT ON COLUMN public.events.location IS 'Event location/venue';
COMMENT ON COLUMN public.events.image_url IS 'URL to event cover image (optional)';

-- =======================================
-- VERIFICATION QUERIES
-- =======================================

-- Run these to verify the RLS policies are working:

-- 1. Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'events';

-- 2. List all policies on events table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'events';

-- 3. Test anonymous access (should work for SELECT)
-- This simulates what happens when non-authenticated users visit the invite page
SET ROLE anon;
SELECT COUNT(*) FROM public.events;
RESET ROLE;

-- 4. Check current events
SELECT id, title, organizer_id, date, time, location 
FROM public.events 
ORDER BY date;

-- =======================================
-- NOTES
-- =======================================

/*
IMPORTANT SECURITY CONSIDERATIONS:

1. PUBLIC READ ACCESS: The events table allows anonymous (public) read access
   This is intentional for the invite page functionality where non-authenticated 
   users need to see event details and submit RSVPs.

2. AUTHENTICATED WRITE ACCESS: Only authenticated users can create, update, or 
   delete events, and only their own events.

3. ORGANIZER OWNERSHIP: The organizer_id field enforces ownership - users can 
   only modify events they created.

4. FOREIGN KEY INTEGRITY: The organizer_id must reference a valid user in the 
   profiles table.

5. ADMIN ACCESS: If you need admin users to manage all events, you'll need to 
   modify the policies to check for admin roles.

If you need to add admin functionality later, modify the UPDATE and DELETE 
policies to include admin checks like:
   AND (organizer_id = auth.uid() OR auth.jwt() ->> 'user_role' = 'admin')
*/
