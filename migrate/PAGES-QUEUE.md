# Pages Migration Queue

Order: root index (`/`) first, then remaining pages alphabetically.

1. pages/index.tsx  # root — migrate first

Completed:

- pages/404.tsx (branch: migrate/pages-404)
 - pages/profile.tsx (branch: migrate/pages-profile)
 - pages/index.tsx (branch: migrate/pages-home)

Other pages (alphabetical):

- pages/404.tsx
- pages/appointment-confirmed/index.tsx
- pages/appointment-page/index.tsx
- pages/approve/[slug].tsx
- pages/approve/index.tsx
- pages/admin/[slug].tsx
- pages/admin/events.tsx
- pages/admin/index.tsx
- pages/book-appointment/index.tsx
- pages/cancel.tsx
- pages/cart/index.tsx
- pages/choose-your-doctor/index.tsx
- pages/checkout/index.tsx
- pages/coverimage/index.tsx
- pages/doctor-page/index.tsx
- pages/enter.tsx
- pages/favorites/index.tsx
- pages/invite/index.tsx
- pages/links.tsx
- pages/play.tsx
- pages/pics/index.tsx
- pages/privacy-policy/index.tsx
- pages/pricing/index.tsx
- pages/product-detail/[id].tsx
- pages/product-detail/index.tsx
- pages/products/index.tsx
- pages/profile.tsx
- pages/rsvp/index.tsx
- pages/success.tsx
- pages/user-preferences.tsx
- pages/[username]/[slug].tsx
- pages/[username]/index.tsx

Notes:
- `_app.tsx` and `_document.tsx` are app-level files and are not part of per-page migrations.
- API routes under `pages/api` are not migrated as pages.

Instructions:
- Create a branch `migrate/pages/<slug>` for each page when migrating.
- After successful smoke test + lint + build, mark page as migrated and move to next.

Recent updates:
- `pages/profile.tsx` migrated and small-form containers converted to `bg-blog-white card--white`.
- `pages/index.tsx` migrated; `PostList` and `HorizontalScrollTech` updated for theme tokens.
