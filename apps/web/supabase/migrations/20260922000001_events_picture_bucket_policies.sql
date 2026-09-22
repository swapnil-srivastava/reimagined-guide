-- Enable admin uploads/deletes for the existing public "events-picture" bucket.
-- Mirrors the existing convention used by the "product-images" and "audio"
-- buckets: RLS checks only bucket_id for the authenticated role, since
-- admin-only enforcement already happens at the app/API layer
-- (NEXT_PUBLIC_SWAPNIL_ID check in pages/api/events.ts).

update storage.buckets
set file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
where id = 'events-picture';

drop policy if exists "Authenticated users can upload event images" on storage.objects;
create policy "Authenticated users can upload event images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'events-picture');

drop policy if exists "Authenticated users can delete event images" on storage.objects;
create policy "Authenticated users can delete event images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'events-picture');
