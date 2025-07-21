# GitHub Copilot Instructions for `reimagined-guide`

## Project Overview

- **Project Type:** Next.js application integrated with Supabase for authentication and database.
- **Removed:** Firebase Auth and Firestore.
- **UI Theme:** Analogous and Monochromatic colors (reference below).

## General Guidance

- **Code using Next.js v13+ features**: Prefer functional components, React hooks (`useState`, `useEffect`), and the latest Next.js routing/structure (app directory if applicable).
- **Authentication**: Use Supabase Auth for all user sign-in, sign-up, and session management. Do *not* use or reference Firebase in any new code.
- **Database**: Use Supabase DB via its JavaScript client for all data operations. Avoid Firestore patterns.
- **API Routes**: Next.js API routes are stored under `pages/api/`. Maintain RESTful conventions; export handler functions as default. Refer to `pages/api/hello.js` as a sample.

## Code Style and Patterns

- **File Conventions**:  
  - Place page components in `pages/`.
  - API handlers go in `pages/api/`.
  - Custom hooks and shared logic go in `lib/` or `hooks/`.
- **Naming**: Use descriptive, camelCase for variables and functions.  
- **TypeScript**: If adding type safety, prefer TypeScript language features.
- **Environment Variables**: Access Supabase keys and secrets only through Next.js environment variables (e.g., `process.env.NEXT_PUBLIC_SUPABASE_URL`).

## Tailwind CSS Usage

- **Color Palette**:  
  - Analogous: `#1249de`, `#5d12de`, `#12dea8`  
  - Monochromatic: `#1249de`, `#385dc5`
  - Accents: Royal Blue `#00539c`, Peach `#eea47f`, Black `#FBFBFB`, White `#0A0A0A`
- **Dark Mode**:  
  - Ensure all theme and dark mode classnames are safelisted in `tailwindcss.config.js` as needed (e.g., `safelist: ['dark']`).
- **Format**: Use Tailwind utility classes for all layout, spacing, color, and responsive rules. Avoid inline styles when possible.

## User Experience

- **Live Reloading**: Remind developers that changes in `pages/index.js` reflect live in dev mode.
- **Accessible Design**: Enforce ARIA attributes and semantic HTML where possible.

## Test, Lint, and Deployment

- **Testing**: Ensure API and auth flows are tested. Provide a mock mode/sample flow in new endpoints if applicable.
- **Linting**: Use ESLint and Prettier for all code. Fix warnings and errors.
- **Deploy**: For production, follow Vercel deployment practices. Update documentation if any deployment step deviates from the Next.js or Supabase standard.

## Example Instructions

> *To add a new authentication feature:*
> - Use `@supabase/supabase-js` for all interactions.
> - Check user sessions using Supabase's auth methods.
> - Store user profile data in Supabase DB only.

> *To create a new API route:*
> - Place the file in `pages/api/`.
> - Export a function as default; accept Next.js `req, res`.
> - Use Supabase client for DB calls within the handler.

## References

- See [Next.js documentation](https://nextjs.org/docs) for framework APIs.
- See [Supabase documentation](https://supabase.com/docs) for auth and database usage.
- Reference project colors and Tailwind configuration as listed above.
