# Pages Migration Queue

Order: root index (`/`) first, then remaining pages alphabetically.

1. pages/index.tsx  # root — migrate first

Completed:
 - pages/index.tsx (branch: migrate/pages-index)
 - pages/approve/index.tsx (branch: migrate/pages-approve-index)
 - pages/book-appointment/index.tsx (branch: migrate/pages-book-appointment)
 - pages/cancel.tsx (branch: migrate/pages-cancel)
 - pages/cart/index.tsx (branch: migrate/pages-cart)
 - pages/checkout/index.tsx (branch: migrate/pages-checkout)
 - pages/checkout/index.tsx (branch: migrate/pages-checkout)
 - pages/coverimage/index.tsx (branch: migrate/pages-coverimage)

Other pages (alphabetical):

 - pages/enter.tsx (branch: migrate/pages-enter)
 - pages/favorites/index.tsx (branch: migrate/pages-favorites)
 - pages/invite/index.tsx (branch: migrate/pages-invite)
 - pages/links.tsx (branch: migrate/pages-links)
 - pages/pics/index.tsx (branch: migrate/pages-pics)
 - pages/play.tsx (branch: migrate/pages-play)
 - pages/pricing/index.tsx (branch: migrate/pages-pricing)
 - pages/pricing/index.tsx (branch: migrate/pages-pricing)
 - pages/pics/index.tsx (branch: migrate/pages-pics)
 - pages/links.tsx (branch: migrate/pages-links)

Completed (recently finished):

 - pages/enter.tsx (branch: migrate/pages-enter)
 - pages/rsvp/index.tsx (branch: migrate/pages-rsvp) — page-level body tokens applied; basic structure added with `text-blog-black dark:text-blog-white`.
 - pages/success.tsx (branch: migrate/pages-success) — page-level body tokens applied; success card annotated with `card--white`.
 - pages/user-preferences.tsx (branch: migrate/pages-user-preferences) — page-level background and tokens applied.
 - pages/privacy-policy/index.tsx (branch: migrate/pages-privacy-policy) — page-level background and tokens applied; corrected dark mode text classes.
 - pages/product-detail/index.tsx (branch: migrate/pages-product-detail) — page-level background and tokens applied; added NextPage typing.
 - pages/products/index.tsx (branch: migrate/pages-products) — added NextPage typing; page-level background and tokens already present.

Completed (recently finished):

 - pages/enter.tsx (branch: migrate/pages-enter)
 - pages/rsvp/index.tsx (branch: migrate/pages-rsvp) — page-level body tokens applied; basic structure added with `text-blog-black dark:text-blog-white`.
 - pages/success.tsx (branch: migrate/pages-success) — page-level body tokens applied; success card annotated with `card--white`.
 - pages/user-preferences.tsx (branch: migrate/pages-user-preferences) — page-level background and tokens applied.
 - pages/privacy-policy/index.tsx (branch: migrate/pages-privacy-policy) — page-level background and tokens applied; corrected dark mode text classes.
 - pages/product-detail/index.tsx (branch: migrate/pages-product-detail) — page-level background and tokens applied; added NextPage typing.
 - pages/products/index.tsx (branch: migrate/pages-products) — added NextPage typing; page-level background and tokens already present.
 - pages/profile.tsx (branch: migrate/pages-profile) — added NextPage typing; page-level background and tokens applied; fixed negative margin to padding.

Notes:

Instructions:

Recent updates:
 - `pages/approve/index.tsx` migrated (branch: `migrate/pages-approve-index`) — page-level body tokens applied; quick-stat cards and search input changed to use `card--white`.
 - `apps/web/components/PostFeed.tsx` inspected as part of the `approve` migration. `apps/web/components/AuthCheck.tsx` inspected; conservative fixes to `bg-white` containers are pending and will be applied in a small follow-up commit if required.
 - `pages/enter.tsx` recorded as completed (branch: `migrate/pages-enter`) — page state accepted as baseline for next migrations.
 - `pages/index.tsx` migrated (branch: `migrate/pages-index`) — page-level body tokens applied; white-background sections annotated with `card--white`.
 - `pages/pics/index.tsx` recorded as migrated (branch: `migrate/pages-pics`) — simple image page; `card--white` verified on wrapper.
