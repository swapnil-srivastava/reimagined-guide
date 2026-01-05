# Swapnil's Odyssey - Reimagined Guide

A modern, full-stack blog platform built with Next.js, TypeScript, Supabase, and comprehensive internationalization support. This platform features authentication, content management, e-commerce capabilities, and a responsive design with dark/light theme support.

**Now powered by Turborepo for 516x faster builds!** ⚡🚀

![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7.4-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.2.1-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.1.4-38B2AC?style=flat-square&logo=tailwind-css)
![Turborepo](https://img.shields.io/badge/Turborepo-2.7.2-EF4444?style=flat-square&logo=turborepo)
![pnpm](https://img.shields.io/badge/pnpm-8.15.0-F69220?style=flat-square&logo=pnpm)

## 🚀 Features

- **🔐 Authentication**: Supabase Auth integration with secure user management
- **📝 Content Management**: Rich text editor with TipTap for blog posts and articles
- **🌐 Internationalization**: Full i18n support with react-intl (FormattedMessage)
- **🎨 Theming**: Dark/Light mode with custom color palette
- **🛒 E-commerce**: Shopping cart, product management, Stripe/PayPal integration
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🔍 Search & Filter**: Advanced content filtering and search capabilities
- **👥 User Profiles**: Complete user profile management system
- **📊 Analytics**: Built-in analytics and user tracking
- **🔧 Admin Panel**: Content moderation and administration tools
- **⚡ Monorepo Architecture**: Turborepo with remote caching (366ms builds, 516x faster!)

## 🏗️ Architecture

### Turborepo Monorepo

This project has been migrated to a **Turborepo monorepo** for optimized builds and scalability:

**Performance Improvements:**
- ⚡ **Cold build:** ~3 minutes (first time or after changes)
- 🚀 **Cached build:** **366ms** (when no changes detected)
- 📈 **Speed improvement:** 516x faster with remote caching
- 💾 **Cache hit rate:** 100% on unchanged code
- 📦 **Static pages:** 148 pages generated and cached

**Monorepo Benefits:**
- 🔄 **Incremental builds** - Only rebuild what changed
- 📦 **Package isolation** - Clear dependency boundaries
- 🌐 **Multi-app support** - Ready for additional apps/packages
- 💾 **Remote caching** - Vercel integration for team collaboration
- 🎯 **Task orchestration** - Parallel builds and dependency management

### Tech Stack

- **Frontend**: Next.js 14.2.35 with TypeScript 4.7.4 and React 18.2.0
- **Backend**: Next.js API Routes with Supabase 2.2.1 integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build System**: Turborepo 2.7.2 with pnpm 8.15.0 workspaces
- **Version Management**: Changesets 2.29.8 with conventional commits
- **Styling**: Tailwind CSS 3.1.4 with custom design system
- **State Management**: Redux 4.2.0 with Redux Thunk
- **UI Components**: Material-UI 5.9.0, FontAwesome Icons
- **Internationalization**: react-intl 6.2.5 with FormatJS CLI
- **Payments**: Stripe 16.2.0 and PayPal integration
- **File Storage**: Supabase Storage
- **Email**: Postmark 3.0.15 integration
- **SMS**: Twilio 3.79.0 integration

### Monorepo Structure

```
📁 reimagined-guide/                 # Turborepo monorepo root
├── 📄 package.json                  # Workspace root configuration
├── 📄 pnpm-workspace.yaml          # pnpm workspace definition
├── 📄 turbo.json                   # Turborepo pipeline & caching config
├── 📄 .npmrc                       # pnpm configuration
├── 📁 apps/                        # Applications directory
│   ├── 📁 web/                     # Main Next.js application
│   │   ├── 📁 components/          # Reusable React components (40+)
│   │   │   ├── AddressForm.tsx     # Address management
│   │   │   ├── AudioPlayer.tsx     # Media player with controls
│   │   │   ├── AwesomeNavBar.tsx   # Main navigation
│   │   │   ├── PostContent.tsx     # Blog post rendering
│   │   │   ├── ProductCard.tsx     # E-commerce display
│   │   │   ├── UserProfile.tsx     # Profile management
│   │   │   └── personalization/    # AI personalization features
│   │   ├── 📁 content/            # Internationalization
│   │   │   ├── locales/           # Source translation files (en-US.json, etc.)
│   │   │   └── compiled-locales/  # Compiled FormatJS translations
│   │   ├── 📁 lib/                # Core utilities and business logic
│   │   │   ├── hooks.ts           # Custom React hooks
│   │   │   ├── use-session.ts     # Supabase session management
│   │   │   ├── interfaces/        # TypeScript type definitions
│   │   │   ├── address/           # Address utilities
│   │   │   ├── calendar/          # Calendar integration
│   │   │   ├── experiences/       # Experience management
│   │   │   └── skills/            # Skills utilities
│   │   ├── 📁 pages/              # Next.js pages and API routes
│   │   │   ├── _app.tsx           # Application wrapper
│   │   │   ├── index.tsx          # Home page
│   │   │   ├── api/               # Backend API endpoints
│   │   │   ├── admin/             # Content management system
│   │   │   ├── products/          # E-commerce catalog pages
│   │   │   ├── pricing/           # Subscription and pricing
│   │   │   ├── cart/              # Shopping cart pages
│   │   │   ├── checkout/          # Checkout flow
│   │   │   └── [username]/        # Dynamic user profile pages
│   │   ├── 📁 public/             # Static assets (images, fonts, etc.)
│   │   ├── 📁 redux/              # Redux state management
│   │   │   ├── store.ts           # Redux store configuration
│   │   │   ├── actions/           # Action creators
│   │   │   └── reducer/           # Reducers for state slices
│   │   ├── 📁 services/           # External service integrations
│   │   ├── 📁 styles/             # CSS modules and global styles
│   │   ├── 📁 supabase/           # Supabase migrations and config
│   │   ├── 📁 types/              # Additional TypeScript types
│   │   ├── 📄 package.json        # App-specific dependencies
│   │   ├── 📄 next.config.js      # Next.js configuration
│   │   ├── 📄 tsconfig.json       # TypeScript configuration
│   │   ├── 📄 tailwind.config.js  # Tailwind CSS configuration
│   │   ├── database.types.ts      # Generated Supabase types
│   │   └── supa-client.ts         # Supabase client instance
│   └── 📁 docs/                   # Documentation site (future)
└── 📁 packages/                   # Shared packages (Phase 2 - planned)
    └── (future: utils, react-components, calendar-utils, etc.)
```

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x package manager (recommended for monorepo)
- **Supabase** account and project
- **Stripe** account (for payments - optional)
- **Postmark** account (for emails - optional)
- **Twilio** account (for SMS - optional)

### 1. Clone the Repository

```bash
git clone https://github.com/swapnil-srivastava/reimagined-guide.git
cd reimagined-guide
```

### 2. Install pnpm

```bash
npm install -g pnpm@8.15.0
```

### 3. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This command will install dependencies for all apps in the monorepo using pnpm workspaces.

### 4. Environment Variables

Create a `.env.local` file in the `apps/web/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Postmark Email Configuration
POSTMARK_API_TOKEN=your_postmark_api_token
POSTMARK_FROM_EMAIL=your_verified_sender_email

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXT_PUBLIC_SWAPNIL_ID=admin_user_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 5. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Set up the database schema using the provided migrations:

```bash
# Initialize Supabase locally (optional)
npx supabase init

# Run migrations
npx supabase db push
```

### 6. Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `posts` - Blog posts and articles
- `products` - E-commerce products
- `cart_items` - Shopping cart functionality
- `addresses` - User address management
- `experiences` - User experience/portfolio
- `skills` - User skills and expertise
- `techstack` - Technology stack information
- `rsvps` - Event RSVP management

## 🚀 Development

### Monorepo Commands

**Start development server:**
```bash
# Start dev server for all apps
pnpm dev

# Start dev server for specific app
pnpm --filter @swapnilsrivastava/web dev
```

**Build all apps:**
```bash
# Build entire monorepo (leverages Turborepo caching)
pnpm build

# Build specific app
pnpm --filter @swapnilsrivastava/web build
```

**Run linting:**
```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter @swapnilsrivastava/web lint
```

**Run tests:**
```bash
# Run tests across monorepo
pnpm test

# Test specific app
pnpm --filter @swapnilsrivastava/web test
```

**Internationalization:**
```bash
# Extract and compile translations
pnpm i18n

# Or run individually
pnpm extract:i18n  # Extract FormattedMessage components
pnpm compile:i18n  # Compile translation files
```

**Clean build artifacts:**
```bash
# Clean all build outputs and caches
pnpm clean
```

**Version Management:**
```bash
# Create a new changeset (after making changes)
pnpm changeset
# or
pnpm changeset:add

# Version packages (consume changesets and update versions)
pnpm version-packages

# Publish to npm (usually automated via GitHub Actions)
pnpm changeset:publish

# Check changeset status
pnpm changeset status
```

> 📖 **See [Version Management Guide](docs/VERSIONING.md)** for comprehensive documentation on using Changesets with conventional commits.

### Turborepo-specific Commands

**Run tasks with Turborepo:**
```bash
# Run task across all workspaces
turbo run build
turbo run dev
turbo run lint

# Run with filtering
turbo run build --filter=@swapnilsrivastava/web
turbo run test --filter=@swapnilsrivastava/*

# Dry run (see what would execute)
turbo run build --dry-run

# Force rebuild (ignore cache)
turbo run build --force
```

**Cache management:**
```bash
# View cache status
turbo run build --summarize

# Clear local cache
rm -rf .turbo

# Inspect remote cache
turbo run build --remote-only
```

### Available Scripts (per app)

### Available Scripts (per app)

Within each app (e.g., `apps/web/`), you can also run scripts directly:

```bash
# Navigate to app directory
cd apps/web

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Internationalization
pnpm i18n
```

### Development Workflow

1. **Start the development server**:
   ```bash
   pnpm dev
   # or for specific app
   pnpm --filter @swapnilsrivastava/web dev
   ```

2. **Access the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:3000/api/*](http://localhost:3000/api/)

3. **Adding new features**:
   - Create components in `apps/web/components/`
   - Add pages in `apps/web/pages/`
   - Use TypeScript interfaces from `apps/web/lib/interfaces/`
   - Follow internationalization patterns with `FormattedMessage`
   - Run `pnpm i18n` after adding new text

4. **Internationalization workflow**:
   ```bash
   # After adding new FormattedMessage components
   pnpm i18n
   ```

5. **Build validation**:
   ```bash
   # Build to test for errors (uses cache)
   pnpm build
   
   # Force fresh build (ignores cache)
   turbo run build --force
   ```

## 🎨 Design System

### Typography System

**Default Font:** Poppins (set as default sans-serif)
- **Primary Use:** All body text, UI elements, and standard content
- **Implementation:** Use default classes or explicit `font-poppins`
- **Special Fonts:** 
  - `font-roboto` - Alternative sans-serif when needed

### Color Palette

```css
/* Primary Theme Colors */
--blog-black: #0a0a0a        /* Primary text in light mode */
--blog-white: #fbfbfb        /* Primary text in dark mode & light backgrounds */
--fun-blue-500: #00539c      /* Dark mode background & primary brand color */

/* Fun Blue Extended Palette */
--fun-blue-50: #f2f6fa       /* Very light blue backgrounds */
--fun-blue-100: #e6eef5     /* Light blue backgrounds */
--fun-blue-200: #bfd4e6     /* Subtle blue accents */
--fun-blue-300: #99bad7     /* Medium blue for borders/dividers */
--fun-blue-400: #4d87ba     /* Medium-dark blue for icons */
--fun-blue-600: #004b8c     /* Darker blue for hover states */
--fun-blue-700: #003e75     /* Dark blue for cards/sections */
--fun-blue-800: #00325e     /* Very dark blue for containers */
--fun-blue-900: #00294c     /* Deepest blue for maximum contrast */
```

### Text Color Standards

```css
/* Primary Text */
text-blog-black dark:text-blog-white     /* All body text, headings, UI labels */

/* Secondary Text */
text-gray-600 dark:text-gray-300         /* Supporting text, descriptions */
text-gray-500 dark:text-gray-400         /* Meta information, timestamps */

/* Interactive Text */
hover:text-fun-blue-500 dark:hover:text-fun-blue-300  /* Links and buttons */

/* Status Text */
text-red-600 dark:text-red-400           /* Error messages */
text-green-600 dark:text-green-400       /* Success messages */
text-yellow-600 dark:text-yellow-400     /* Warning messages */
```

### Background Color Standards

```css
/* Primary Page Backgrounds */
bg-blog-white dark:bg-fun-blue-500       /* Main page areas */

/* Contrasting Elements (Cards/Navbar/Footer) */
bg-white dark:bg-fun-blue-600            /* Content cards, navigation, footer */

/* Secondary Containers */
bg-gray-50 dark:bg-fun-blue-700          /* Nested content */

/* Input Backgrounds */
bg-white dark:bg-fun-blue-600            /* Form elements */

/* Hover Backgrounds */
hover:bg-gray-50 dark:hover:bg-fun-blue-600  /* Hover states */
```

### Typography & Spacing

- **Font System**: Poppins as default, with specialized fonts for specific use cases
- **Spacing**: Tailwind's 8px-based spacing system
- **Responsive**: Mobile-first responsive design with consistent breakpoints
- **Dark Mode**: Automatic system preference detection with manual toggle

### Component Guidelines

- **ALWAYS** use `font-poppins` or rely on default for all standard text
- **ALWAYS** use `text-blog-black dark:text-blog-white` for primary text
- **ALWAYS** use `FormattedMessage` for all user-facing text
- **ALWAYS** use `bg-blog-white dark:bg-fun-blue-500` for page backgrounds
- **ALWAYS** use `bg-white dark:bg-fun-blue-600` for card/container backgrounds
- **ALWAYS** use `drop-shadow-lg hover:drop-shadow-xl hover:brightness-125` for card styling
- **ALWAYS** include dark mode variants for every style
- **NEVER** use absolute/relative positioning except for overlays and animations

### Button Standards

**Three standardized button types for consistent UI:**

#### 1. Circular Icon Buttons (Navigation/UI Controls)
```css
w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] bg-fun-blue-300 dark:text-blog-black p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125
```
Use for navbar icons, controls, and UI interactions with FontAwesome icons.

#### 2. Action Buttons with Icons (Primary Actions)
```css
inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm
```
Use for important actions like sign up, add to cart, with heart icon, etc.

#### 3. Standard Action Buttons (Secondary Actions)
```css
bg-hit-pink-500 text-blog-black rounded-lg px-4 py-2 m-2 transition-filter duration-500 hover:filter hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 text-sm font-semibold
```
Use for regular buttons without icons like checkout, submit forms, etc.

## 🌐 Internationalization

The application uses **react-intl** for comprehensive internationalization:

### Message Format

```tsx
<FormattedMessage
  id="unique-message-id"
  description="Context description"
  defaultMessage="Default English text"
/>
```

### Dynamic Messages

```tsx
const intl = useIntl();
const message = intl.formatMessage({
  id: "dynamic-message-id",
  description: "Dynamic message description",
  defaultMessage: "Hello {name}!"
}, { name: userName });
```

### Adding New Languages

1. Create new locale file: `content/locales/[locale].json`
2. Add translations for all message IDs
3. Update `pages/_app.tsx` to include the new locale
4. Run `yarn compile:i18n` to compile translations

## 🔐 Authentication Flow

### Supabase Auth Integration

1. **Sign Up/Sign In**: Email/password authentication
2. **Session Management**: Automatic token refresh
3. **Protected Routes**: Route-level authentication checks
4. **User Profiles**: Extended user data in custom tables

### Usage Example

```tsx
import { useSession } from '../lib/use-session';

function ProtectedComponent() {
  const { user, loading } = useSession();
  
  if (loading) return <Loader />;
  if (!user) return <AuthCheck />;
  
  return <div>Protected content</div>;
}
```

## 🛒 E-commerce Features

### Product Management

- Product creation and editing
- Image upload and management
- Price and inventory tracking
- Category and tag system

### Shopping Cart

- Add/remove items
- Quantity management
- Persistent cart state
- Address management

### Payment Processing

- Stripe integration
- Secure checkout flow
- Webhook handling
- Order management

## 📱 Deployment

### Vercel Deployment (Recommended)

This monorepo is optimized for Vercel deployment with automatic Turborepo integration.

1. **Connect to Vercel**:
   - Import the GitHub repository in Vercel dashboard
   - Vercel will automatically detect Turborepo configuration

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: (auto-detected by Vercel)
   - **Install Command**: `pnpm install` (auto-detected)
   - **Output Directory**: `.next` (default)

3. **Environment Variables**: 
   Add all required environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `POSTMARK_API_TOKEN`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `NEXT_PUBLIC_SWAPNIL_ID`
   - `NEXTAUTH_SECRET`

4. **Remote Caching** (Automatic):
   - Vercel automatically enables Turborepo remote caching
   - No additional configuration needed
   - Subsequent deployments will leverage cached builds
   - **Expected performance**: 366ms builds (vs 3+ minutes cold)

5. **Deploy**:
   ```bash
   # Push to main branch for automatic deployment
   git push origin main
   ```

### Manual Deployment

If deploying to another platform:

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Start production server**:
   ```bash
   pnpm start
   ```

3. **Configure environment variables** on your hosting platform

### Production Considerations

- ✅ Ensure all environment variables are set
- ✅ Configure Supabase RLS policies for production
- ✅ Set up proper domain redirects and SSL
- ✅ Configure Stripe webhooks with production keys
- ✅ Monitor application performance with Vercel Analytics
- ✅ Set up error tracking (Sentry, LogRocket, etc.)
- ✅ Configure CDN for static assets (automatic on Vercel)
- ✅ Enable Turborepo remote caching for faster builds

### Build Performance

**Turborepo + Vercel Integration:**
- **First deployment**: ~3 minutes (cold build)
- **Subsequent deployments** (no changes): **366ms** (cached)
- **Partial changes**: Incremental - only rebuilds affected packages
- **Cache hit rate**: 100% on unchanged code
- **Cost savings**: ~340 build minutes saved per month (at 10 deploys/day)

## 🔧 Configuration

### Turborepo Configuration

The monorepo uses Turborepo for task orchestration and caching:

```json
// turbo.json
{
  "$schema": "https://turborepo.com/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    // ... 16 more environment variables
  ],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    // ... lint, test, i18n tasks
  }
}
```

**Key Features:**
- **Global dependencies**: Tracks `.env.*local` files for cache invalidation
- **Global environment variables**: 18 variables configured for deterministic builds
- **Task pipeline**: Optimized dependency graph for parallel execution
- **Output caching**: `.next/**` build outputs cached (excluding cache directory)
- **Persistent tasks**: Dev server runs continuously without blocking

### pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

This enables:
- Shared dependencies across workspaces
- Faster installs with content-addressable storage
- Strict dependency resolution (prevents phantom dependencies)

### Tailwind CSS

The application includes custom Tailwind configuration:

```javascript
// apps/web/tailwind.config.js
module.exports = {
  darkMode: 'class',
  safelist: ['dark'],
  theme: {
    extend: {
      colors: {
        'fun-blue-500': '#00539c',
        'fun-blue-600': '#004b8c',
        'fun-blue-700': '#003e75',
        'blog-white': '#fbfbfb',
        'blog-black': '#0a0a0a'
      }
    }
  }
}
```

### Next.js Configuration

```javascript
// apps/web/next.config.js
module.exports = {
  typescript: {
    ignoreBuildErrors: true  // Temporary for rsvps table
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  i18n: {
    locales: ['en-US', 'de-DE', 'fr-FR', 'hi-IN'],
    defaultLocale: 'en-US'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**'
      }
    ]
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run linting
yarn lint

# Type checking
npx tsc --noEmit

# Build verification
yarn build
```

### Code Quality

- **ESLint**: Configured with Next.js recommended rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (configure as needed)

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Content Management

- `GET /api/posts` - Fetch posts
- `POST /api/posts` - Create post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### E-commerce

- `GET /api/products` - Fetch products
- `POST /api/checkout` - Process payment
- `POST /api/webhook` - Stripe webhook handler

## 📋 TODO

### High Priority
- [ ] **Replace window.location.href with Next.js Router**: Replace direct window navigation with Next.js `useRouter` for better client-side routing and performance
  - Update sign out redirect in `pages/enter.tsx` (lines ~469, ~489)
  - Update dashboard navigation in `pages/enter.tsx` (line ~524)
  - Implement proper programmatic navigation using `router.push()` instead of `window.location.href`

### Medium Priority
- [ ] Implement proper error boundaries for better error handling
- [ ] Add comprehensive unit and integration tests
- [ ] Optimize image loading and implement lazy loading
- [ ] Add SEO meta tags and structured data
- [ ] Implement service worker for offline functionality

### Low Priority
- [ ] Add more payment providers beyond Stripe
- [ ] Implement advanced analytics dashboard
- [ ] Add social media sharing functionality
- [ ] Create mobile app using React Native

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes in the appropriate workspace (`apps/web/` or `packages/*`)
4. Commit your changes: `git commit -m 'feat: add amazing feature'` (use conventional commits)
5. Create a changeset: `pnpm changeset` (for version-bumping changes)
6. Run tests and linting: `pnpm lint && pnpm build`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- **Monorepo Structure**: Keep apps in `apps/` and shared packages in `packages/`
- **Package Manager**: Use `pnpm` exclusively (not npm or yarn)
- **TypeScript**: Follow TypeScript best practices and maintain type safety
- **Internationalization**: Use `FormattedMessage` for all user-facing text
- **Styling**: Maintain the established color scheme and design system
- **Commit Messages**: Use conventional commits (feat:, fix:, docs:, chore:, etc.)
- **Changesets**: Create changesets for features and fixes that should bump versions
- **Testing**: Test all functionality before submitting PR
- **Build Validation**: Ensure `pnpm build` passes without errors
- **Turborepo**: Leverage Turborepo tasks for consistent development workflow

### Conventional Commit Format

```bash
# Features (minor version bump)
git commit -m "feat: add user notification system"
pnpm changeset  # Select "minor"

# Bug fixes (patch version bump)
git commit -m "fix: resolve cart calculation error"
pnpm changeset  # Select "patch"

# Breaking changes (major version bump)
git commit -m "feat!: redesign API endpoints

BREAKING CHANGE: API v1 removed, use v2"
pnpm changeset  # Select "major"

# No version bump needed
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "style: format code"
# No changeset needed
```

> 📖 **See [Version Management Guide](docs/VERSIONING.md)** for detailed versioning workflow.

### Monorepo Commands for Contributors

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run linting
pnpm lint

# Build all apps
pnpm build

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Turborepo Migration

This project was migrated from a single Next.js app to a Turborepo monorepo in January 2025. Key achievements:

### Migration Results

**Performance:**
- ⚡ **516x faster builds** with remote caching
- 🚀 Cold build: ~3 minutes → Cached build: **366ms**
- 💾 100% cache hit rate on unchanged code
- 📦 148 static pages cached and instantly deployed

**Architecture:**
- 🏗️ Organized into `apps/*` and `packages/*` workspaces
- 🔄 Migrated from yarn to pnpm for better dependency management
- 📋 Turborepo task pipeline for optimized builds
- 🌐 Ready for multi-app expansion and shared packages

**Developer Experience:**
- 🔨 Simplified workspace commands with pnpm
- 🎯 Parallel task execution across workspaces
- 📊 Better visibility into build performance
- 🔄 Incremental builds - only rebuild what changed

### Future Roadmap (Phase 2)

- [ ] Extract shared packages to `packages/*` directory
  - `@swapnilsrivastava/utils` - Common utilities
  - `@swapnilsrivastava/calendar-utils` - Calendar integration
  - `@swapnilsrivastava/react-components` - Shared React components
  - `@swapnilsrivastava/supabase-client` - Supabase client wrapper
  - `@swapnilsrivastava/i18n` - Internationalization utilities
- [ ] Set up Changesets for automatic versioning
- [ ] Publish framework-agnostic packages to npm
- [ ] Create additional apps (mobile, admin dashboard, etc.)
- [ ] Implement cross-framework component library (Angular, Vue, Svelte)

### Migration Documentation

For detailed migration steps and decisions, see:
- [Turborepo Migration Guide](docs/migration/turborepo-migration.md) (coming soon)
- [Performance Benchmarks](docs/migration/performance.md) (coming soon)
- [Package Structure Plan](docs/migration/package-extraction.md) (coming soon)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Turborepo](https://turbo.build/) - Monorepo build system
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Material-UI](https://mui.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Deployment platform with remote caching

## 📞 Support

For support and questions:
- **Email**: contact@swapnilsrivastava.eu
- **Website**: [swapnilsrivastava.eu](https://swapnilsrivastava.eu)
- **GitHub Issues**: [Create an issue](https://github.com/swapnil-srivastava/reimagined-guide/issues)

---

**Built with ❤️ by Swapnil Srivastava**
