-- RSVP Table Creation SQL
-- This needs to be run in the Supabase SQL Editor to create the RSVP functionality

-- Create RSVP table for event management
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    family_name TEXT NOT NULL,
    kids JSONB DEFAULT '[]'::jsonb,
    message TEXT,
    is_attending BOOLEAN DEFAULT false,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger for rsvps table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON public.rsvps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for RSVPs
CREATE POLICY "Enable read access for all users" ON public.rsvps
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.rsvps
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own RSVPs" ON public.rsvps
    FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_family_name ON public.rsvps(family_name);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps(created_at);

-- Grant necessary permissions
GRANT ALL ON public.rsvps TO anon;
GRANT ALL ON public.rsvps TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.rsvps IS 'Table to store RSVP responses for events';
COMMENT ON COLUMN public.rsvps.event_id IS 'Foreign key to events table';
COMMENT ON COLUMN public.rsvps.family_name IS 'Name of the family/person RSVPing';
COMMENT ON COLUMN public.rsvps.kids IS 'JSON array of children attending with their names and ages';
COMMENT ON COLUMN public.rsvps.message IS 'Optional message from the RSVP respondent';
COMMENT ON COLUMN public.rsvps.is_attending IS 'Whether the family/person will attend the event';
COMMENT ON COLUMN public.rsvps.email IS 'Optional email for contact';
COMMENT ON COLUMN public.rsvps.phone IS 'Optional phone number for contact';
