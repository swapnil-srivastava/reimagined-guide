---
name: ship-website-change
description: Use when finishing a change to swapnilsrivastava.eu (reimagined-guide) and getting it to Swapnil, before claiming it works. Covers the checks to run, screenshots, the pull request, migrations to hand over and what to record afterwards.
---

# Shipping a change to swapnilsrivastava.eu

## 1. Checks (in apps/web)

Run what applies and report the real output; don't claim green without running it.

- `npx tsc --noEmit`
- `pnpm lint`
- `pnpm test:booking` / `pnpm test:products` if those areas were touched; add a
  `*.test.ts` for new logic in `lib/`.
- `pnpm i18n` if any `FormattedMessage` changed, and commit the locale files.
- `pnpm build` for changes to pages, config or dependencies. A full build needs env
  vars; if it fails only for missing secrets, say so plainly.

## 2. Look at it

For any visible change, follow "Checking your work" in the `site-ui` skill: light and
dark theme, phone and desktop. Look at the screenshots yourself before sending them.

## 3. Pull request

- Branch: the one the session names (`claude/...`). Small focused PRs; large features
  are split into numbered PRs that each work on their own (as booking and doctors were).
- Follow the repo PR conventions and the attribution lines the session requires.
  Body: what changes for visitors/admins, migrations to apply, env vars to set,
  how it was tested.
- Creating the PR through the GitHub tools sometimes fails in thread sessions while
  push works. Then give Swapnil the compare link:
  `https://github.com/swapnil-srivastava/reimagined-guide/compare/main...<branch>?expand=1`.
- If Vercel posts a preview deployment on the PR, check it loads before handing over.

## 4. Hand over what only Swapnil can do

List each in one line: migrations to apply (see `supabase-change`), Vercel env vars,
Stripe/PayPal dashboard settings (webhook events), Figma or DNS changes. Don't do
those yourself unless Swapnil says so.

## 5. Record it

After merge (or when something is applied/decided), save one line to project memory:
PR number, date, what it did, anything applied or still open. Decisions Swapnil makes
("don't re-offer X") go there too, so the next session doesn't ask again.
