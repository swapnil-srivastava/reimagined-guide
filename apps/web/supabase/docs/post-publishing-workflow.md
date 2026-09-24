# Post publishing workflow

Posts go through an editorial workflow before they appear on the website.

```
create ─► Draft ─► Copy Ready ─► Web Ready ──(email to Swapnil)──► Approved = live
            ▲                        │
            └── any saved edit ◄─────┴── Changes requested (email to author)
```

- `posts` is the **live** table. Visitors only see rows where `published AND approved`.
  Clients cannot insert or update it; it is written by the database functions below.
- `post_drafts` is the author's working copy plus its `status`. Only the author
  and the admin can read it; only the author can update it.
- Saving any change to a draft moves it back to `draft`. The approved version
  stays live until the new version is approved.
- The admin is whoever is listed in `app_admins` (checked by `is_admin()`).

| Function | Who | What |
|---|---|---|
| `create_post(p_title)` | signed-in, non-guest user | Creates the post and its draft with a unique slug |
| `approve_post(p_post_id)` | admin | Copies a `web_ready` draft to `posts`, sets `published` and `approved` |
| `request_post_changes(p_post_id, p_note)` | admin | Sends a `web_ready` draft back to the author with a note |
| `unpublish_post(p_post_id)` | author or admin | Takes the post off the website |

Reaction counts on `posts` are kept up to date by a trigger on `emotions`, which
allows one reaction of each type per reader.

## API routes

- `POST /api/posts/submit { postId }` emails the admin when a draft is Web Ready.
- `POST /api/posts/review { postId, action, note? }` approves, requests changes or
  unpublishes, emails the author and revalidates the post page.

Both need the caller's Supabase access token in `Authorization: Bearer <token>`.

## Environment variables

| Variable | Needed for |
|---|---|
| `EMAIL_KEY`, `EMAIL` | Postmark (already used) |
| `SUPABASE_SERVICE_ROLE_KEY` | Looking up the author's email in `auth.users` (falls back to `profiles.email`) |
| `ADMIN_EMAIL` (optional) | Approval inbox, defaults to `contact@swapnilsrivastava.eu` |
| `NEXT_PUBLIC_SITE_URL` (optional) | Links in emails, canonical URLs, sitemap and RSS; defaults to `https://www.swapnilsrivastava.eu` |

## Deploying

Apply `migrations/20260924000001_post_publishing_workflow.sql` and deploy the
web app **together**: after the migration, the previous frontend can no longer
write to `posts`, and the new frontend needs the `post_drafts` table.
