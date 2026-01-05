# Supabase Database Configuration

This directory contains all Supabase-related database configurations, migrations, and documentation for the reimagined-guide project.

## 📁 Directory Structure

```
supabase/
├── .gitignore                              # Git ignore for Supabase files
├── config.toml                             # Supabase CLI configuration
├── seed.sql                                # Database seed data
├── migrations/                             # Database migration files
│   ├── 20230117215816_starting-ddl.sql    # Initial database schema
│   ├── 20231025000000_create_favorites_table.sql
│   ├── 20250823123456_create_favorites_table.sql
│   ├── 20250823_create_favorites_table.sql
│   ├── 20250829000001_fix_events_table_rls.sql    # 🚨 CRITICAL: Events RLS fix
│   └── 20250829000002_create_rsvps_table.sql      # RSVP table creation
└── docs/                                   # Database documentation
    ├── database-setup-guide.md            # Complete setup instructions
    └── security-analysis.md               # Security issues and fixes
```

## 🚨 Critical Security Fixes

### Events Table RLS (URGENT)
**File:** `migrations/20250829000001_fix_events_table_rls.sql`

This migration addresses a **critical security vulnerability** where the events table had Row Level Security (RLS) disabled. This fix:

- ✅ Enables RLS on the events table
- ✅ Creates proper security policies
- ✅ Allows public read access (needed for invite pages)
- ✅ Restricts write access to authenticated organizers
- ✅ Adds performance indexes
- ✅ Sets up foreign key constraints

### RSVP Table Creation
**File:** `migrations/20250829000002_create_rsvps_table.sql`

Creates the RSVP functionality with:

- ✅ Proper table structure for event RSVPs
- ✅ RLS policies for security
- ✅ Performance indexes
- ✅ Foreign key relationships

## 🚀 Quick Setup

### Method 1: Using Supabase CLI (Recommended)
```bash
# Apply migrations using Supabase CLI
npx supabase db push

# Or apply specific migrations
npx supabase migration up --target 20250829000001
npx supabase migration up --target 20250829000002
```

### Method 2: Manual SQL Execution
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/20250829000001_fix_events_table_rls.sql`
3. Execute the SQL
4. Copy contents of `migrations/20250829000002_create_rsvps_table.sql`
5. Execute the SQL

## 📖 Documentation

### Setup Guides
- **`docs/database-setup-guide.md`** - Complete step-by-step setup instructions
- **`docs/security-analysis.md`** - Detailed security analysis and fixes

### Migration Files
- **`20250829000001_fix_events_table_rls.sql`** - Events table security fix
- **`20250829000002_create_rsvps_table.sql`** - RSVP table creation

## ⚡ Performance Optimizations

The migrations include several performance optimizations:

### Indexes Created
```sql
-- Events table indexes
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_created_at ON public.events(created_at);
CREATE INDEX idx_events_date_time ON public.events(date, time);

-- RSVP table indexes
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_rsvps_family_name ON public.rsvps(family_name);
CREATE INDEX idx_rsvps_created_at ON public.rsvps(created_at);
```

### RLS Policy Optimizations
- Uses `(select auth.uid())` instead of `auth.uid()` for better query performance
- Optimized policy conditions for minimal overhead

## 🔒 Security Policies

### Events Table
- **SELECT**: Public access (anonymous + authenticated)
- **INSERT**: Authenticated users only (must set organizer_id to own user)
- **UPDATE**: Organizers only (can only update own events)
- **DELETE**: Organizers only (can only delete own events)

### RSVP Table
- **SELECT**: Public access (for viewing responses)
- **INSERT**: Public access (for anonymous RSVP submissions)
- **UPDATE**: General access (for editing responses)

## 🧪 Testing & Verification

### Verify RLS is Working
```sql
-- Check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('events', 'rsvps');

-- Check policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('events', 'rsvps');
```

### Test Anonymous Access
```sql
-- Test anonymous event access (should work)
SET ROLE anon;
SELECT COUNT(*) FROM public.events;
RESET ROLE;
```

## 📋 Schema Overview

### Events Table
```sql
public.events (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    organizer_id UUID REFERENCES profiles(id),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)
```

### RSVP Table
```sql
public.rsvps (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    family_name TEXT NOT NULL,
    kids JSONB DEFAULT '[]'::jsonb,
    message TEXT,
    is_attending BOOLEAN DEFAULT false,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)
```

## 🔧 Development Workflow

### Adding New Migrations
```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset
```

### Local Development
```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop
```

## 🚨 Important Notes

1. **Run migrations in order** - The events RLS fix must be applied before the RSVP table creation
2. **Test thoroughly** - Verify the invite page works for both authenticated and anonymous users
3. **Monitor performance** - Check query performance after applying indexes
4. **Security first** - The events RLS fix resolves a critical security vulnerability

## 📞 Support

If you encounter issues:
1. Check the detailed documentation in `docs/`
2. Verify migrations were applied successfully
3. Test with the provided verification queries
4. Review Supabase logs for error details

---

**🔥 Priority**: Apply the events RLS fix immediately - it resolves a critical security vulnerability!
