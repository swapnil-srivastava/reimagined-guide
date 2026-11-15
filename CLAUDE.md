# swapnilsrivastava.eu (reimagined-guide)

Personal site, blog, shop, booking and (in progress) doctors' practice, owned by
Swapnil (`swapnil-srivastava`). Next.js 14 pages router in `apps/web`, pnpm +
Turborepo monorepo, Supabase (Postgres, auth, RLS), Stripe and PayPal, Postmark
email, deployed on Vercel. Production site: https://swapnilsrivastava.eu

This file is the current source of truth. `.github/copilot-instructions.md` is
older; where it disagrees (yarn, Tailwind `dark:` classes), follow this file.

## Commands (run from `apps/web` unless noted)

- Install: `pnpm install` at the repo root. Never yarn or npm.
- Type check: `npx tsc --noEmit`. Lint: `pnpm lint`. Build: `pnpm build`.
- Unit tests (Node test runner, no Jest): `pnpm test:booking`, `pnpm test:products`.
  New tests are `*.test.ts` next to the code, added to one of those scripts.
- Translations: `pnpm i18n` after adding or changing `FormattedMessage` text.

## Rules that are easy to get wrong

- **Dark mode**: Tailwind `dark:` classes never apply. Themes set
  `theme-<colour>-<light|dark>` on `<html>`, not `.dark`, and turning `dark:` on
  app-wide broke pages. Use the theme CSS variables instead. See the `site-ui` skill.
- **Fonts**: Poppins is only loaded as a variable on `<main>` in `_app.tsx`, weight
  400 only. Put `font-poppins` on each page's root element.
- **Login links**: always `loginHref(router.asPath)` from `lib/login-redirect.ts`.
- **Login card** (`/enter`) stays white in dark mode on purpose. Don't theme it.
- **Admin checks**: `is_admin()` in Postgres (RLS policies, `supaClient.rpc("is_admin")`
  in the UI). `NEXT_PUBLIC_SWAPNIL_ID` is legacy and client-side only.
- **Prices** are computed on the server (`lib/server/pricing.ts`), never trusted from the client.
- **Third-party services** (video, phone, SMS, WhatsApp, payments, email) go behind
  our own adapter interface so the provider can be swapped. See `third-party-adapter`.
- **Database changes** are new files in `apps/web/supabase/migrations/`. Swapnil
  applies them; never apply a migration or write to production data without
  Swapnil's explicit go-ahead. See `supabase-change`.
- **Supabase is on the free plan**: avoid polling, per-request heavy queries and
  frequent cron jobs. Prefer one RPC over many round trips.
- **UI copy** can be overridden by `content/locales/*.json`; check there when a text
  change does not show.

## Project skills (`.claude/skills/`)

Project-specific (read the matching one before starting):

| Skill | Use when |
|---|---|
| `site-ui` | Any page, component or email layout change |
| `supabase-change` | Tables, RLS, RPCs, cron, storage, generated types |
| `payments-orders` | Checkout, Stripe/PayPal webhooks, orders, refunds, disputes, promo codes, stock |
| `third-party-adapter` | Adding or calling any outside provider |
| `ship-website-change` | Finishing work: checks, screenshots, PR, migration hand-off |

The other skills in that folder are generic upstream copies (design plugin, Vercel,
frontend-design, caveman). Where they conflict with this file, this file wins:
for example `frontend-design` suggests picking new fonts and colours, but this
site keeps Poppins and the theme variables.

## Ongoing work

- Doctors' practice: plan and decisions in the doctors plan artifact and
  `apps/web/supabase/migrations/20261022170000_doctors_data_model.sql`. India
  (₹), phone + SMS OTP mandatory, email optional. Providers chosen: 100ms video/audio
  (backup Daily), Plivo phone (backup Exotel), MSG91 SMS (backup Exotel), Gupshup
  WhatsApp (backup MSG91), Razorpay payments.
- Go-live for the shop still uses Stripe test mode and PayPal sandbox. Switching to
  live keys is deferred by Swapnil; don't do it unasked.
