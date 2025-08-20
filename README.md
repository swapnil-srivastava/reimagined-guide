# Swapnil's Odyssey - Reimagined Guide

A modern, full-stack blog platform built with Next.js, TypeScript, Supabase, and comprehensive internationalization support. This platform features authentication, content management, e-commerce capabilities, and a responsive design with dark/light theme support.

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7.4-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.2.1-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.1.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

- **🔐 Authentication**: Supabase Auth integration with secure user management
- **📝 Content Management**: Rich text editor with TipTap for blog posts and articles
- **🌐 Internationalization**: Full i18n support with react-intl (FormattedMessage)
- **🎨 Theming**: Dark/Light mode with custom color palette
- **🛒 E-commerce**: Shopping cart, product management, and Stripe integration
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🔍 Search & Filter**: Advanced content filtering and search capabilities
- **👥 User Profiles**: Complete user profile management system
- **📊 Analytics**: Built-in analytics and user tracking
- **🔧 Admin Panel**: Content moderation and administration tools

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 with TypeScript and React 18
- **Backend**: Next.js API Routes with Supabase integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux with Redux Thunk
- **UI Components**: Material-UI, FontAwesome Icons
- **Internationalization**: react-intl with FormatJS
- **Payments**: Stripe integration
- **File Storage**: Supabase Storage
- **Email**: Postmark integration
- **SMS**: Twilio integration

### Project Structure

```
📁 reimagined-guide/
├── 📁 components/           # Reusable React components
│   ├── AddressForm.tsx      # Address management component
│   ├── AudioPlayer.tsx      # Audio player with controls
│   ├── AwesomeNavBar.tsx    # Main navigation component
│   ├── PostContent.tsx      # Blog post display component
│   ├── ProductCard.tsx      # E-commerce product component
│   └── personalization/     # AI personalization components
├── 📁 content/             # Internationalization content
│   ├── locales/            # Translation source files
│   └── compiled-locales/   # Compiled translation files
├── 📁 lib/                 # Utility libraries and interfaces
│   ├── hooks.ts            # Custom React hooks
│   ├── interfaces/         # TypeScript interface definitions
│   └── use-session.ts      # Session management utilities
├── 📁 pages/               # Next.js pages and API routes
│   ├── api/                # Backend API endpoints
│   ├── admin/              # Admin panel pages
│   ├── products/           # E-commerce pages
│   ├── pricing/            # Pricing and subscription pages
│   └── [username]/         # Dynamic user profile pages
├── 📁 public/              # Static assets and images
├── 📁 redux/               # Redux store and state management
├── 📁 services/            # External service integrations
├── 📁 styles/              # CSS modules and global styles
├── 📁 supabase/            # Supabase configuration and migrations
├── 📁 types/               # TypeScript type definitions
├── database.types.ts       # Generated Supabase types
├── supa-client.ts          # Supabase client configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js** 18.x or higher
- **Yarn** package manager
- **Supabase** account and project
- **Stripe** account (for payments)
- **Postmark** account (for emails)
- **Twilio** account (for SMS)

### 1. Clone the Repository

```bash
git clone https://github.com/swapnil-srivastava/reimagined-guide.git
cd reimagined-guide
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

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

### 4. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Set up the database schema using the provided migrations:

```bash
# Initialize Supabase locally (optional)
npx supabase init

# Run migrations
npx supabase db push
```

### 5. Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `posts` - Blog posts and articles
- `products` - E-commerce products
- `cart_items` - Shopping cart functionality
- `addresses` - User address management
- `experiences` - User experience/portfolio
- `skills` - User skills and expertise
- `techstack` - Technology stack information

## 🚀 Development

### Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Extract internationalization messages
yarn extract:i18n

# Compile translations
yarn compile:i18n

# Full i18n pipeline (extract + compile)
yarn i18n
```

### Development Workflow

1. **Start the development server**:
   ```bash
   yarn dev
   ```

2. **Access the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:3000/api/hello](http://localhost:3000/api/hello)

3. **Adding new features**:
   - Create components in `/components`
   - Add pages in `/pages`
   - Use TypeScript interfaces from `/lib/interfaces`
   - Follow internationalization patterns with `FormattedMessage`

4. **Internationalization workflow**:
   ```bash
   # After adding new FormattedMessage components
   yarn i18n
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

/* Accent Colors */
--peach-accent: #eea47f      /* Secondary actions (add, edit, navigate) */
--purple-accent: #5d12de     /* Primary actions (checkout, purchase, confirm) */
--primary-blue: #1249de      /* Alternative blue for special elements */
--blue-secondary: #385dc5    /* Supporting blue variant */
--teal-accent: #12dea8       /* Success states and highlights */

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

1. **Connect to Vercel**:
   ```bash
   npx vercel --prod
   ```

2. **Environment Variables**: Add all required environment variables in Vercel dashboard

3. **Domain Configuration**: Configure custom domain in Vercel settings

### Manual Deployment

1. **Build the application**:
   ```bash
   yarn build
   ```

2. **Start production server**:
   ```bash
   yarn start
   ```

### Production Considerations

- Ensure all environment variables are set
- Configure Supabase RLS policies
- Set up proper domain redirects
- Configure CDN for static assets
- Monitor application performance

## 🔧 Configuration

### Tailwind CSS

The application includes custom Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  safelist: ['dark'], // Ensures dark mode works in production
  theme: {
    extend: {
      colors: {
        'fun-blue-500': '#00539c',
        'blog-white': '#fbfbfb'
      }
    }
  }
}
```

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US'
  },
  images: {
    domains: ['your-supabase-project.supabase.co']
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
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use `FormattedMessage` for all user-facing text
- Maintain the established color scheme
- Write meaningful commit messages
- Test all functionality before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Material-UI](https://mui.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support and questions:
- **Email**: contact@swapnilsrivastava.eu
- **Website**: [swapnilsrivastava.eu](https://swapnilsrivastava.eu)
- **GitHub Issues**: [Create an issue](https://github.com/swapnil-srivastava/reimagined-guide/issues)

---

**Built with ❤️ by Swapnil Srivastava**
