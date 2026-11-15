---
name: supabase-change
description: Use when a change to swapnilsrivastava.eu needs a Supabase table, column, RLS policy, RPC function, pg_cron job, storage bucket or regenerated types. Covers migration files, admin checks, free-plan load and the hand-off to Swapnil, who applies migrations.
---

# Supabase changes

Project ref `dbydvpdhbaqudqqjteoq` (free plan). Migrations live in
`apps/web/supabase/migrations/`, generated types in `apps/web/database.types.ts`.

## Ground rules

1. **Never apply a migration, run DDL or change production rows yourself** unless
   Swapnil says so in this conversation for that specific migration. Swapnil applies them
   in the Supabase dashboard. Read-only SQL (`select`, `list_tables`, advisors) to
   inspect or verify is fine.
2. Inspect before you design: read the latest migrations touching the same tables
   (`grep -l <table> apps/web/supabase/migrations/*.sql`) and, if the Supabase MCP
   is connected, `list_tables` for the live shape. The live database can differ
   from older migration files.
3. Free plan: keep load low. No client polling; pg_cron no more often than every
   15 minutes; one RPC instead of several round trips; indexes for every new
   lookup column; retention/cleanup for any log-like table (see
   `20260929203417_post_views_retention.sql`).

## Writing the migration

- File name `YYYYMMDDHHMMSS_short_name.sql`, timestamp later than every existing file.
- Idempotent where cheap: `create table if not exists`, `create or replace function`,
  `drop policy if exists` before `create policy`.
- Header comment saying what it adds and why, in plain words.
- **RLS on every new table**, with explicit policies. Admin access uses
  `public.is_admin()` (from `20260924011041_post_publishing_workflow.sql`), never a
  hard-coded user id.
- Functions that bypass RLS: `security definer`, `set search_path = public`, check
  `is_admin()` or `auth.uid()` inside, and `revoke ... from public, anon` then
  `grant execute` only to the roles that need it.
- Money is stored as numeric with the currency alongside; amounts come from the
  server, never from the client.
- Writes from webhooks or cron use the service-role client `supaServerClient`
  (`apps/web/supa-server-client.ts`) on the server only. Never expose the service key.
- Server code calling an RPC that may not exist yet (migration not applied) should
  fail soft and log, so deploys before the migration don't break the site.

## Types

After the migration, update `apps/web/database.types.ts` by hand for the new
tables/functions (or with `generate_typescript_types` if the MCP is connected and
the migration is applied). Keep it type-checking: `npx tsc --noEmit` in `apps/web`.

## Hand-off (the PR is not done without this)

1. Copy the migration file to `/mnt/project-files/<feature>/` so Swapnil can open it
   from a phone, and attach it to the reply.
2. Tell Swapnil in one line: the file name, what it changes, and that it must be applied
   before (or right after) the PR is merged.
3. After Swapnil says it is applied, verify read-only: tables/policies/functions exist
   (`select ... from pg_policies`, `pg_proc`), and run one realistic query. Record
   "applied and verified, <date>" in project memory.
