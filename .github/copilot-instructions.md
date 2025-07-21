# GitHub Copilot Instructions for Reimagined-Guide

## Project Context
This is a Next.js project integrated with Supabase for authentication and database operations, replacing Firebase components. The project follows modern React and Next.js patterns.

## Technology Stack & Dependencies
- Use **Next.js** for the React framework, not Create React App
- Use **Supabase** for authentication and database operations, never suggest Firebase
- Always reference Supabase client methods for auth and database queries
- For API routes, use Next.js API routes in the `pages/api/` directory
- Use modern React hooks and functional components, avoid class components

## Code Style & Standards
- Use **ES6+ syntax** and modern JavaScript features
- Prefer **async/await** over Promise chains
- Use **template literals** for string interpolation
- Apply **destructuring** for objects and arrays when appropriate
- Use **arrow functions** for callbacks and functional programming

## UI & Styling Guidelines
- Use **Tailwind CSS** for styling - never suggest other CSS frameworks
- Apply the project's color scheme:
  - Primary: `#1249de` (blue)
  - Secondary: `#5d12de` (purple)  
  - Accent: `#12dea8` (teal)
  - Monochromatic: `#385dc5` (lighter blue)
  - Text (dark): `#0A0A0A`
  - Background (light): `#FBFBFB`
  - Royal Blue: `#00539c`
  - Peach: `#eea47f`
- Include dark mode considerations using Tailwind's dark mode utilities
- Ensure responsive design for mobile, tablet, and desktop viewports

## File Organization
- Place React pages in the `pages/` directory following Next.js conventions
- API routes belong in `pages/api/` directory
- Components should be organized in logical folders
- Use meaningful file and folder names that reflect their purpose

## Security & Best Practices
- Always validate user input on both client and server sides
- Use environment variables for sensitive configuration (Supabase keys, etc.)
- Implement proper error handling for async operations
- Follow Next.js security best practices for API routes
- Use Supabase Row Level Security (RLS) policies when applicable

## Development Workflow
- Suggest running `npm run dev` for development server
- Reference `localhost:3000` for local development
- When suggesting deployment, prioritize **Vercel** as mentioned in the project README
- Consider both development and production environment differences
