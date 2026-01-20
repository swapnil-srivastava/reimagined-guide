# Migrated Components Manifest

This file tracks components that have already been migrated as part of a page migration.

Completed (migrated and verified):

- apps/web/components/PostFeed.tsx
- apps/web/components/Loader.tsx
- apps/web/components/PostList.tsx (updated to enforce `card--white`)
- apps/web/components/HorizontalScrollTech.tsx (applies `text-blog-black` token)
- apps/web/components/Metatags.tsx
- apps/web/components/JsonFormsClient.tsx (client-only wrapper for JsonForms)

- Inspected for this migration: `apps/web/components/ProductCardWithFavorites.tsx`, `apps/web/components/ProductSkeletonGrid.tsx` — no component-level changes required.

- Inspected for this migration: `apps/web/components/RSVPForm.tsx`, `apps/web/components/RSVPList.tsx`, `apps/web/components/CalendarButton.tsx` — no component-level changes required.
 
- Inspected for this migration: image usage in `apps/web/pages/pics/index.tsx` (Next.js `Image` component with local asset) — no component changes required.

- Inspected for this migration: `apps/web/components/SpotifyPlayer.tsx` — no component-level changes required.

- Inspected for this migration: `apps/web/components/CheckoutButton.tsx`, `apps/web/components/Metatags.tsx` — no component-level changes required.

- Inspected for this migration: `apps/web/components/CheckoutButton.tsx` and `apps/web/components/Metatags.tsx` — no component-level changes required.

- Inspected for this migration: `apps/web/pages/pics/index.tsx` — simple image page, no component changes required.
 - Inspected for this migration: `apps/web/components/CheckoutButton.tsx` — no component-level changes required.

Inspected / Notes:
- apps/web/components/AuthCheck.tsx — updated to add `card--white` on fallback button; conservative sweep completed for approve-related use.
- apps/web/components/PostFeed.tsx — updated to enforce `card--white` on post cards and switched content text to `text-black` for stronger contrast.

Recent edits were pushed on branches: `migrate/pages-approve-components`, `migrate/pages-approve-slug`.
 - `pages/index.tsx` migrated (branch: `migrate/pages-index`) — inspected `PostList` and `HorizontalScrollTech` (no component-level changes required).

- Inspected for this migration: `apps/web/pages/products/index.tsx` — no component changes required.

Policy:
- Migrate a component on the first page that requires it.
- Add its path below so subsequent page migrations skip re-migrating it.

Notes:
- If a migrated component receives follow-up fixes (contrast, tokens, or SSR guards), append a short note next to the component as shown above.

Example:
- apps/web/components/AwesomeNavBar.tsx
