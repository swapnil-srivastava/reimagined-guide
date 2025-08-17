# GitHub Copilot Instructions for `reimagined-guide`

## Project Overview

- **Project Type:** Next.js application integrated with Supabase for authentication and database.
- **Architecture:** Uses Next.js pages router with TypeScript and React components.
- **Removed:** Firebase Auth and Firestore (migrated to Supabase).
- **UI Theme:** Analogous and Monochromatic colors with dark/light mode support.

## General Guidance
  - Whenever you add a `FormattedMessage` component to a page, run the i18n extraction/generation process to update translation files.

- **Code using Next.js v13+ features**: Prefer functional components, React hooks (`useState`, `useEffect`), and the latest Next.js routing/structure.
- **Authentication**: Use Supabase Auth via the `supa_client.ts` for all user sign-in, sign-up, and session management. Do *not* use or reference Firebase in any new code.
- **Database**: Use Supabase DB via its JavaScript client for all data operations. Avoid Firestore patterns.
- **API Routes**: Next.js API routes are stored under `pages/api/`. Maintain RESTful conventions; export handler functions as default. Refer to `pages/api/hello.js` as a sample.

## Application Structure

- **Authentication Flow**: Authentication state is managed through `supa_client.ts` which creates a context for session management.
- **Theme Handling**: Theme (dark/light mode) is managed via `lib/theme.ts` with localStorage persistence.

## Development Workflow

- **Package Manager**: Use `yarn` for all package management and script commands (not npm).
- **Start Development**: `yarn dev` - Runs the app in development mode on port 3000.
- **Build for Production**: `yarn build` - Creates optimized production build.
- **Internationalization**: `yarn extract-messages` - Extracts messages from components for translation (run this whenever adding new `FormattedMessage` components).
- **Linting**: `yarn lint` - Runs ESLint to check code quality.
- **Type Checking**: `yarn type-check` - Runs TypeScript type checking.

## Code Style and Patterns

- **File Conventions**:  
  - Place page components in `pages/`.
  - API handlers go in `pages/api/`.
  - Custom hooks and shared logic go in `lib/` or `hooks/`.
  - Shared components in `components/` with related components grouped by folder.
- **Naming**: Use descriptive, camelCase for variables and functions.  
- **TypeScript**: The project uses TypeScript throughout. Define interfaces for props and state.
- **Environment Variables**: Access Supabase keys and secrets only through Next.js environment variables (e.g., `process.env.NEXT_PUBLIC_SUPABASE_URL`).

- **Color Palette**:  
  - Analogous: `#1249de`, `#5d12de`, `#12dea8`  
  - Monochromatic: `#1249de`, `#385dc5`
  - Background: `#fbfbfb` (light mode), `#004b8c` (dark mode)
- **Dark Mode**:  
  - Ensure all theme and dark mode classnames are safelisted in `tailwindcss.config.js` as needed (e.g., `safelist: ['dark']`).
  - Use `text-black` for main text in light mode and `text-white` for main content text in dark mode, including privacy policy and user preference pages.
- **Format**: Use Tailwind utility classes for all layout, spacing, color, and responsive rules. Avoid inline styles when possible.

## Internationalization

- **Format**: The app uses `react-intl` for internationalization.
- **Message Definition**: Define messages with `<FormattedMessage id="namespace.message_id" defaultMessage="Default text" />`.
- **Extraction**: Run `npm run extract-messages` after adding new messages to update locale files in `content/locales/`.
- **Locale Files**: Locale files are stored in `content/locales/` and imported in `pages/_app.tsx`.

## User Experience

- **Live Reloading**: Remind developers that changes in `pages/index.js` reflect live in dev mode.
- **Accessible Design**: Enforce ARIA attributes and semantic HTML where possible.
- **Responsive Design**: All pages should be fully responsive with mobile-first approach.

## Common Design Patterns

- **Error Handling**: Catch and display errors from Supabase operations.

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
