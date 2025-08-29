# Database Setup Instructions for Events & RSVP System

## Overview
This document provides step-by-step instructions to set up the complete database schema for the events and RSVP system, including proper Row Level Security (RLS) policies.

## Security Issues Identified

The Supabase security advisor has identified the following critical issues:

1. **RLS Disabled on Events Table** (ERROR)
   - Table `public.events` is public but RLS is not enabled
   - This is a **critical security vulnerability**

2. **RLS Disabled on Addresses Table** (ERROR)  
   - Table `public.addresses` is public but RLS is not enabled

3. **Function Search Path Issues** (WARN)
   - Functions have mutable search paths

## Required Actions

### 🚨 CRITICAL: Fix Events Table RLS (HIGH PRIORITY)

**File:** `/database-setup/fix-events-rls.sql`

Run this SQL script in Supabase SQL Editor to:
- Enable RLS on the events table
- Create proper security policies
- Allow public read access (needed for invite pages)
- Restrict write access to authenticated organizers
- Add performance indexes
- Set up proper foreign key constraints

### 📋 Required: Create RSVP Table

**File:** `/database-setup/rsvp-table.sql`

Run this SQL script to:
- Create the RSVP table with proper structure
- Enable RLS with appropriate policies
- Set up triggers for updated_at timestamps
- Create performance indexes
- Grant necessary permissions

## Step-by-Step Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Create a new query

### Step 2: Fix Events Table Security (CRITICAL)
1. Copy the contents of `/database-setup/fix-events-rls.sql`
2. Paste into SQL Editor
3. Run the query
4. Verify success by checking that RLS is enabled

### Step 3: Create RSVP Table
1. Copy the contents of `/database-setup/rsvp-table.sql`
2. Paste into SQL Editor  
3. Run the query
4. Verify the table was created successfully

### Step 4: Verify Setup
Run these verification queries:

```sql
-- Check if RLS is enabled on events
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('events', 'rsvps');

-- Check policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('events', 'rsvps');

-- Test table structure
\d events
\d rsvps
```

## Security Policy Summary

### Events Table Policies
- **SELECT**: Allow everyone (including anonymous users)
- **INSERT**: Authenticated users only, must set organizer_id to own user ID
- **UPDATE**: Organizers can only update their own events
- **DELETE**: Organizers can only delete their own events

### RSVP Table Policies  
- **SELECT**: Allow everyone (for viewing responses)
- **INSERT**: Allow everyone (for public RSVP submissions)
- **UPDATE**: Allow all (for editing responses)
- **DELETE**: Could be restricted in future iterations

## Database Schema

### Events Table
```sql
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RSVP Table
```sql
CREATE TABLE public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    family_name TEXT NOT NULL,
    kids JSONB DEFAULT '[]'::jsonb,
    message TEXT,
    is_attending BOOLEAN DEFAULT false,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Performance Considerations

### Indexes Created
- `idx_events_organizer_id` - For organizer queries
- `idx_events_date` - For date-based filtering
- `idx_events_created_at` - For chronological ordering
- `idx_events_date_time` - For date/time combinations
- `idx_rsvps_event_id` - For event-specific RSVPs
- `idx_rsvps_family_name` - For family name searches
- `idx_rsvps_created_at` - For chronological ordering

## API Integration

The RSVP API endpoint at `/api/rsvp` expects this data structure:

```typescript
interface RSVPData {
  eventId: string;
  familyName: string;
  kids: Array<{ name: string; age: string }>;
  message: string;
  isAttending: boolean;
  email?: string;
  phone?: string;
}
```

## Testing the Setup

### Test 1: Anonymous Access to Events
```sql
SET ROLE anon;
SELECT COUNT(*) FROM public.events;
RESET ROLE;
```

### Test 2: RSVP Creation
```sql
INSERT INTO public.rsvps (
    event_id, 
    family_name, 
    kids, 
    message, 
    is_attending, 
    email
) VALUES (
    'your-event-id',
    'Test Family',
    '[{"name": "Child1", "age": "8"}]'::jsonb,
    'Test message',
    true,
    'test@example.com'
);
```

## Common Issues & Solutions

### Issue 1: Foreign Key Constraint Errors
- **Problem**: organizer_id references don't work
- **Solution**: Ensure profiles table exists and has proper IDs
- **Fix**: Update existing events with valid organizer_ids

### Issue 2: Permission Denied Errors
- **Problem**: API calls fail with permission errors
- **Solution**: Verify RLS policies are applied correctly
- **Check**: Run policy verification queries

### Issue 3: Anonymous Access Blocked
- **Problem**: Invite page doesn't load for non-authenticated users
- **Solution**: Ensure anon role has SELECT permission on events
- **Verify**: Test with `SET ROLE anon` queries

## Monitoring & Maintenance

### Regular Security Checks
1. Run security advisor monthly: `mcp_supabase_get_advisors`
2. Monitor failed queries in Supabase logs
3. Review and update policies as needed

### Performance Monitoring
1. Check query performance in Supabase dashboard
2. Monitor index usage
3. Optimize queries based on usage patterns

## Next Steps

After completing the database setup:

1. ✅ Test the invite page functionality
2. ✅ Test RSVP form submissions  
3. ✅ Verify security policies work correctly
4. 🔄 Consider adding admin management features
5. 🔄 Implement email notifications for RSVPs
6. 🔄 Add calendar integration features

## Support

If you encounter issues during setup:
1. Check Supabase logs for error details
2. Verify each step was completed successfully
3. Test with the provided verification queries
4. Review the security advisor recommendations

---

**⚠️ IMPORTANT**: The events table RLS fix is critical for security. Complete this immediately to prevent unauthorized access to your database.
