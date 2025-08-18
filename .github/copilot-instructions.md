# GitHub Copilot Instructions for `reimagined-guide`

## Project Overview

- **Project Name:** Swapnil's Odyssey - Reimagined Guide
- **Project Type:** Full-stack modern blog platform with e-commerce capabilities
- **Architecture:** Next.js 14 with TypeScript, Supabase backend, comprehensive internationalization
- **Version:** 0.1.0
- **Primary Features:** Authentication, content management, e-commerce, internationalization, theming

### Tech Stack

- **Frontend:** Next.js 14.0.4, TypeScript 4.7.4, React 18.2.0
- **Backend:** Next.js API Routes, Supabase 2.2.1 (PostgreSQL)
- **Authentication:** Supabase Auth with session management
- **Styling:** Tailwind CSS 3.1.4, Material-UI 5.9.0
- **State Management:** Redux 4.2.0 with Redux Thunk
- **Internationalization:** react-intl 6.2.5 with FormatJS CLI
- **Payments:** Stripe 16.2.0 integration
- **Email/SMS:** Postmark 3.0.15, Twilio 3.79.0
- **File Storage:** Supabase Storage
- **Rich Text:** TipTap 2.0.2 editor

### Key Dependencies

```json
{
  "@supabase/supabase-js": "^2.2.1",
  "@stripe/stripe-js": "^4.1.0",
  "react-intl": "^6.2.5",
  "next-themes": "^0.2.0",
  "@tiptap/react": "^2.0.2",
  "react-redux": "^8.0.2"
}
```

## General Guidance

### Internationalization (CRITICAL)
- **ALWAYS** use `FormattedMessage` components for ALL user-facing strings - no exceptions
- **NEVER** use hardcoded strings in user interfaces
- **Format Pattern:**
  ```tsx
  <FormattedMessage
    id="unique-component-message-id"
    description="Context description for translators"
    defaultMessage="Default English text"
  />
  ```
- **Dynamic Content:** Use `useIntl` hook with `formatMessage`:
  ```tsx
  const intl = useIntl();
  const message = intl.formatMessage({
    id: "dynamic-message-id",
    description: "Dynamic message context",
    defaultMessage: "Hello {name}!"
  }, { name: userName });
  ```
- **After adding FormattedMessage:** Always run `yarn i18n` to extract and compile messages
- **Toast Messages:** Use `intl.formatMessage` for toast.success/error messages
- **Accessibility:** Internationalize all aria-labels, alt text, and sr-only content

### Project Structure & File Organization

```
📁 reimagined-guide/
├── 📁 components/           # Reusable React components
│   ├── AddressForm.tsx      # Address management with validation
│   ├── AudioPlayer.tsx      # Media player with controls
│   ├── AwesomeNavBar.tsx    # Main navigation with auth states
│   ├── PostContent.tsx      # Blog post rendering with social features
│   ├── ProductCard.tsx      # E-commerce product display
│   ├── UserProfile.tsx      # User profile management
│   └── personalization/     # AI personalization features
├── 📁 content/             # Internationalization
│   ├── locales/            # Source translation files (en-US.json)
│   └── compiled-locales/   # Compiled FormatJS translations
├── 📁 lib/                 # Core utilities and business logic
│   ├── hooks.ts            # Custom React hooks
│   ├── use-session.ts      # Supabase session management
│   ├── interfaces/         # TypeScript definitions
│   └── [feature]/          # Feature-specific utilities
├── 📁 pages/               # Next.js pages and API routes
│   ├── api/                # Backend endpoints
│   ├── admin/              # Content management system
│   ├── pricing/            # Subscription and pricing
│   ├── products/           # E-commerce catalog
│   ├── [username]/         # Dynamic user profiles
│   └── [feature]/          # Feature-specific pages
├── 📁 redux/               # State management
│   ├── store.ts            # Redux store configuration
│   ├── actions/            # Redux actions
│   └── reducer/            # Redux reducers
├── 📁 services/            # External service integrations
├── 📁 supabase/            # Database and backend configuration
├── database.types.ts       # Generated Supabase TypeScript types
└── supa-client.ts          # Supabase client instance
```

### Development Workflow

- **Package Manager:** Use `yarn` exclusively (never npm)
- **Available Scripts:**
  ```bash
  yarn dev              # Development server (localhost:3000)
  yarn build            # Production build
  yarn start            # Production server
  yarn lint             # ESLint code quality
  yarn i18n             # Extract + compile translations
  yarn extract:i18n     # Extract FormattedMessage components
  yarn compile:i18n     # Compile translation files
  ```

## Code Style and Patterns

### File Conventions
- **Pages:** `pages/` directory with Next.js routing
- **Components:** `components/` with feature grouping
- **API Routes:** `pages/api/` with RESTful conventions
- **Types:** Use TypeScript interfaces in `lib/interfaces/`
- **Hooks:** Custom hooks in `lib/hooks.ts`
- **Services:** External integrations in `services/`

### Naming Conventions
- **Files:** PascalCase for components, camelCase for utilities
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Variables/Functions:** camelCase with descriptive names
- **Constants:** UPPER_SNAKE_CASE
- **Message IDs:** kebab-case with component prefix (e.g., `navbar-login-button`)

### TypeScript Patterns
- **Strict Mode:** Always use TypeScript with strict checking
- **Interfaces:** Define props and state interfaces
- **Database Types:** Import from `database.types.ts` for Supabase
- **Generic Types:** Use for reusable components
- **Example:**
  ```tsx
  interface UserProfileProps {
    user: Database['public']['Tables']['users']['Row'];
    onUpdate: (user: UserUpdate) => void;
  }
  ```

## Authentication & Session Management

### Supabase Auth Integration
- **Client:** Use `supa_client.ts` for all auth operations
- **Session Hook:** Use `useSession()` from `lib/use-session.ts`
- **Protected Routes:** Implement `<AuthCheck />` component
- **Example:**
  ```tsx
  import { useSession } from '../lib/use-session';
  
  function ProtectedPage() {
    const { user, loading } = useSession();
    
    if (loading) return <Loader />;
    if (!user) return <AuthCheck />;
    
    return <div>Protected content</div>;
  }
  ```

### User Management
- **Profile Data:** Store in Supabase `users` table
- **Extended Data:** Additional tables (experiences, skills, addresses)
- **State Management:** Redux for global user state
- **Admin Checks:** Use environment variable `NEXT_PUBLIC_SWAPNIL_ID`

## Design System & Styling

### Color Palette (STRICTLY ENFORCE)
```css
/* Primary Colors */
--primary-blue: #1249de      /* Main brand color */
--blue-secondary: #385dc5    /* Secondary brand */
--fun-blue-500: #00539c      /* Dark mode background */

/* Analogous Palette */
--purple-accent: #5d12de     /* Purple accent */
--teal-accent: #12dea8       /* Teal accent */

/* Theme Colors */
--blog-white: #fbfbfb        /* Light mode background */
--text-dark: #0a0a0a         /* Dark text */
--peach-accent: #eea47f      /* Warm accent */

/* Usage Patterns */
bg-blog-white dark:bg-fun-blue-500    /* Standard background */
text-black dark:text-white            /* Standard text */
hover:text-fun-blue-500               /* Hover states */
```

### Component Styling Standards
- **Background Pattern:** `bg-blog-white dark:bg-fun-blue-500` for all main sections
- **Text Pattern:** `text-black dark:text-white` for primary content
- **Hover Effects:** Use `hover:brightness-125` or `hover:text-fun-blue-500`
- **Responsive:** Mobile-first approach with Tailwind breakpoints
- **Dark Mode:** Always include dark mode variants
- **Spacing:** Use Tailwind's 8px-based spacing system

### Layout Standards (CRITICAL)
- **ALWAYS** use Flexbox (`flex`, `flex-col`, `items-center`, `justify-between`) or CSS Grid (`grid`, `grid-cols-*`) for layouts
- **NEVER** use `absolute` or `relative` positioning unless absolutely necessary for overlays or animations
- **Preferred Layout Patterns:**
  ```css
  /* Flexbox for most layouts */
  flex flex-col items-center justify-center
  flex items-center justify-between
  flex flex-wrap gap-4
  
  /* Grid for complex layouts */
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
  grid grid-cols-auto-fit minmax(300px, 1fr) gap-4
  ```
- **Exception Cases:** Only use positioning for:
  - Dropdown menus and tooltips
  - Modal overlays and backdrops
  - Floating action buttons
  - Animation effects that require precise positioning

### Component Architecture
- **Functional Components:** Always use function components with hooks
- **Props Interface:** Define TypeScript interfaces for all props
- **State Management:** Use `useState` for local state, Redux for global
- **Side Effects:** Use `useEffect` with proper dependencies
- **Error Boundaries:** Implement error handling patterns

## Database & API Patterns

### Supabase Integration
- **Client Import:** `import { supaClient } from '../supa-client'`
- **Row Level Security:** Always implement RLS policies
- **Real-time:** Use subscriptions for live data when needed
- **File Storage:** Use Supabase storage for images/audio
- **Types:** Import from `database.types.ts`

### API Route Patterns
```typescript
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supaClient } from '../../supa-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data, error } = await supaClient
      .from('table_name')
      .insert(req.body);

    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Database Schema Overview
- **users:** User profiles and authentication data
- **posts:** Blog posts with rich content
- **products:** E-commerce product catalog
- **cart_items:** Shopping cart functionality
- **addresses:** User address management
- **experiences:** Portfolio/work experience
- **skills:** User skills and expertise
- **techstack:** Technology stack information

## E-commerce Features

### Product Management
- **Images:** Supabase storage with public URLs
- **Pricing:** Support for multiple currencies
- **Inventory:** Stock tracking and management
- **Categories:** Flexible categorization system

### Shopping Cart
- **State:** Redux for cart persistence
- **Items:** Quantity and variant management
- **Checkout:** Stripe integration for payments
- **Address:** Integrated address management

### Payment Processing
- **Stripe:** Use environment variables for keys
- **Webhooks:** Handle in `pages/api/webhook.ts`
- **Security:** Validate webhook signatures
- **Error Handling:** Comprehensive error states

## Content Management

### Rich Text Editor
- **TipTap:** Use for blog post editing
- **YouTube:** Embedded video support
- **Formatting:** Bold, italic, headings, lists
- **Code Blocks:** Syntax highlighting support

### Media Management
- **Images:** Supabase storage with optimization
- **Audio:** Audio player component with controls
- **Upload:** Drag and drop file uploads
- **Compression:** Client-side image optimization

## State Management

### Redux Patterns
- **Store:** Configure in `redux/store.ts`
- **Actions:** Async actions with Redux Thunk
- **Reducers:** Immutable state updates
- **Selectors:** Use for derived state
- **Persistence:** Local storage for cart/preferences

### Local State Guidelines
- **Component State:** Use `useState` for UI state
- **Form State:** React Hook Form for complex forms
- **Cache State:** For API response caching
- **Temporary State:** For modal/drawer states

## Testing & Quality Assurance

### Code Quality
- **ESLint:** Configured with Next.js rules
- **TypeScript:** Strict type checking enabled
- **Build:** Must pass `yarn build` without errors
- **Linting:** Must pass `yarn lint` without warnings

### Testing Strategy
- **Unit Tests:** Component testing (setup as needed)
- **Integration:** API route testing
- **E2E:** User flow testing (setup as needed)
- **Manual:** Test all FormattedMessage changes

## Security & Performance

### Security Best Practices
- **Environment Variables:** Never expose secrets
- **RLS Policies:** Implement on all Supabase tables
- **Input Validation:** Validate all user inputs
- **Authentication:** Check user permissions
- **CSRF Protection:** Built into Next.js

### Performance Optimization
- **Image Optimization:** Use Next.js Image component - ALWAYS prefer `import Image from 'next/image'` over `<img>` tags
- **Code Splitting:** Dynamic imports for large components
- **Caching:** Implement proper cache headers
- **Bundle Analysis:** Monitor bundle size
- **Lazy Loading:** For non-critical components

## Deployment & Environment

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Communication
POSTMARK_API_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Application
NEXT_PUBLIC_SWAPNIL_ID=
NEXTAUTH_SECRET=
```

### Deployment Checklist
- ✅ All environment variables configured
- ✅ Supabase RLS policies enabled
- ✅ Build completes without errors
- ✅ Internationalization compiled
- ✅ Stripe webhooks configured
- ✅ Domain SSL certificates

## Common Patterns & Examples

### Adding a New Feature
1. **Create component:** `components/NewFeature.tsx`
2. **Add page:** `pages/new-feature/index.tsx`
3. **Internationalize:** Use FormattedMessage for all text
4. **Add types:** Define interfaces in `lib/interfaces/`
5. **Database:** Create migrations if needed
6. **Extract i18n:** Run `yarn i18n`
7. **Test:** Verify build and functionality

### Adding New API Endpoint
1. **Create file:** `pages/api/new-endpoint.ts`
2. **Implement handler:** Use TypeScript with proper types
3. **Add validation:** Validate inputs and methods
4. **Database operations:** Use Supabase client
5. **Error handling:** Comprehensive error responses
6. **Documentation:** Update API documentation

### Internationalization Workflow
1. **Add FormattedMessage:** Replace hardcoded strings
2. **Dynamic content:** Use useIntl for dynamic text
3. **Extract messages:** Run `yarn extract:i18n`
4. **Compile translations:** Run `yarn compile:i18n`
5. **Test build:** Verify with `yarn build`
6. **Add translations:** Update locale files as needed

## Error Handling Patterns

### Component Error Boundaries
```tsx
import { FormattedMessage } from 'react-intl';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center p-8">
      <FormattedMessage
        id="error-boundary-message"
        description="Error boundary fallback"
        defaultMessage="Something went wrong. Please try again."
      />
    </div>
  );
}
```

### API Error Handling
```tsx
try {
  const { data, error } = await supaClient
    .from('table')
    .select('*');
    
  if (error) throw error;
  
  toast.success(intl.formatMessage({
    id: "data-loaded-success",
    description: "Data loaded successfully",
    defaultMessage: "Data loaded successfully!"
  }));
} catch (error) {
  toast.error(intl.formatMessage({
    id: "data-loading-error",
    description: "Error loading data",
    defaultMessage: "Failed to load data: {error}"
  }, { error: error.message }));
}
```

## References & Resources

- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **TypeScript:** [typescriptlang.org](https://typescriptlang.org)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **react-intl:** [formatjs.io/docs/react-intl](https://formatjs.io/docs/react-intl)
- **Stripe:** [stripe.com/docs](https://stripe.com/docs)

## Critical Reminders

🚨 **NEVER** use hardcoded strings in user interfaces  
🚨 **ALWAYS** run `yarn i18n` after adding FormattedMessage components  
🚨 **ALWAYS** use `bg-blog-white dark:bg-fun-blue-500` for backgrounds  
🚨 **ALWAYS** include dark mode variants in styling  
🚨 **ALWAYS** use Flexbox or CSS Grid for layouts - NEVER use absolute/relative positioning except for overlays  
🚨 **ALWAYS** use Next.js `Image` component instead of `<img>` tags for all images  
🚨 **ALWAYS** use TypeScript types from `database.types.ts`  
🚨 **ALWAYS** implement proper error handling  
🚨 **ALWAYS** validate user inputs  
🚨 **ALWAYS** test build before committing  

---

**Built with ❤️ for modern web development**
