---
name: site-ui
description: Use when building or changing any page, component, admin screen or email in apps/web of swapnilsrivastava.eu. Covers theme colour variables (not Tailwind dark:), font-poppins, i18n, login links and screenshot checks.
---

# Site UI conventions (apps/web)

Follow these before generic design advice (`frontend-design`, `design-system`).
The site has five colour themes (blue, green, purple, orange, teal), each light and
dark. A change is done only when it looks right in a light and a dark theme, on a
phone and a desktop.

## Colours: theme variables, never `dark:`

`next-themes` puts `theme-blue-dark` (etc.) on `<html>`. There is no `.dark` class,
so `dark:` variants silently do nothing, and enabling them app-wide broke pages
(attempted in PR #87, reverted). Do not add `dark:` classes; remove them when you
touch a component that relies on them.

Use the variables from `apps/web/styles/globals.css` through Tailwind arbitrary values:

| Need | Class |
|---|---|
| Page background / text | `bg-[var(--bg-primary)]` / `text-[var(--text-primary)]` (also `bg-blog-white`, `text-blog-black`) |
| Card / raised panel | `bg-[var(--surface-raised)]` |
| Inset area, input well | `bg-[var(--surface-inset)]` |
| Subtle border / control border | `border-[var(--border-subtle)]` / `border-[var(--border-control)]` |
| Muted text | `text-[var(--text-muted)]` |
| Brand colour | `var(--color-primary)`, `--color-primary-deep`, `--color-primary-deeper`, `--color-primary-light` |
| Text on brand colour | `text-[var(--text-on-primary)]` |
| Status | `--status-success`, `--status-danger`, `--status-warning`, `--status-info`, `--status-accent` (`-solid` variants for filled badges) |
| Accent | `--accent-tint`, `--accent-tint-hover`, `--accent-ink` |

The surface/border/muted tokens are `color-mix()` of the theme's own colours, so one
class is right in every theme. Good reference components: `components/PostList.tsx`,
`components/RSVPList.tsx`, `components/AdminOrdersCard.tsx`. Fixed colours like
`bg-white` or `text-gray-600` are wrong in dark themes; use them only where a white
surface is intended.

Exception: the login card on `/enter` stays white in dark mode (Swapnil's choice).

MUI components pick up the same variables; do not hard-code MUI palette colours.

## Fonts

Poppins is loaded once in `pages/_app.tsx` as the `--font-poppins` variable on
`<main>`, weight 400 only. Put `font-poppins` on each page's root element (pages
without it fall back to the system font). Don't rely on `font-semibold`/`font-bold`
looking different in Poppins; only 400 is loaded. Swapnil asks for font fixes page
by page, so don't sweep the whole site unasked.

## Text and i18n

- User-facing strings use `FormattedMessage` / `intl.formatMessage` with an explicit
  kebab-case `id` and a `description`. Then run `pnpm i18n` in `apps/web`.
- Locales: en-US, de-DE, fr-FR, hi-IN in `content/locales`. A translation file can
  override copy; if a text change doesn't show, check there.
- aria-labels and alt text are translated too.

## Links, auth, admin

- Every link to login: `loginHref(router.asPath)` from `lib/login-redirect.ts`.
- Admin-only UI: `components/admin/AdminGate.tsx` or `supaClient.rpc("is_admin")`.
  The real protection is RLS / server checks; the UI check is only for display.
- API calls that need the user send `Authorization: Bearer <access token>`;
  server side uses `getAuthedRequest(req)` from `lib/server/supabase-user.ts`.

## Layout

- Mobile first. Test at 390px wide and at desktop width; no horizontal scroll.
- Use `next/image` for images.
- Respect `motion-reduce:` on animations, keep visible focus rings, touch targets ≥ 40px.

## Emails

Build HTML emails with `emailLayout()` / `paragraph()` from `lib/server/emailLayout.ts`
(responsive, tested in Gmail on phone) and send with `sendMail()` from
`lib/server/mailer.ts`, which returns false instead of throwing. Escape user data
with `escapeHtml`.

## Checking your work

Run the dev server and take screenshots with the pre-installed Playwright
(`require('playwright')`, no install). Set the theme before load:
`localStorage.setItem('theme', 'blue-dark')` (keys: `<colour>-<light|dark>`).
Shoot at least blue-light on a phone and blue-dark on desktop; add one other colour
for theme-sensitive work. Save screenshots that Swapnil should see under
`/mnt/project-files/<feature>/` and attach them to the reply.
