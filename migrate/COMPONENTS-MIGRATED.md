# Migrated Components Manifest

This file tracks components that have already been migrated as part of a page migration.

Completed (migrated and verified):

- apps/web/components/PostFeed.tsx
- apps/web/components/Loader.tsx
- apps/web/components/PostList.tsx (updated to enforce `card--white`)
- apps/web/components/HorizontalScrollTech.tsx (applies `text-blog-black` token)
- apps/web/components/Metatags.tsx
- apps/web/components/JsonFormsClient.tsx (client-only wrapper for JsonForms)

Policy:
- Migrate a component on the first page that requires it.
- Add its path below so subsequent page migrations skip re-migrating it.

Notes:
- If a migrated component receives follow-up fixes (contrast, tokens, or SSR guards), append a short note next to the component as shown above.

Example:
- apps/web/components/AwesomeNavBar.tsx
