# Documentation Index

Welcome to the Swapnil's Odyssey documentation. This directory contains comprehensive guides for features, architecture, deployment, and development.

## 📚 Table of Contents

- [Development](#development)
- [Architecture](#architecture)
- [Features](#features)
- [Deployment](#deployment)
- [Migration](#migration)

---

## 💻 Development

Essential development guides and workflows.

- **[Version Management](VERSIONING.md)** - Comprehensive guide to Changesets and conventional commits for version management

---

## 🏗️ Architecture

Documentation about the system architecture, design decisions, and technical organization.

- **[File Organization Summary](architecture/FILE-ORGANIZATION-SUMMARY.md)** - Overview of project structure and file organization patterns

---

## ✨ Features

Detailed guides for specific features and functionality.

### E-commerce & Shopping

- **[Favorites System](features/FAVORITES-README.md)** - User favorites and wishlist functionality
- **[Favorites Enhancements](features/FAVORITES-ENHANCEMENTS.md)** - Recent improvements to favorites feature
- **[Favorites Summary](features/FAVORITES-SUMMARY.md)** - Complete overview of favorites implementation

### Events & Communication

- **[Event Management](features/EVENT-MANAGEMENT.md)** - Event creation, RSVP system, and calendar integration
- **[Email Enhancements](features/EMAIL-ENHANCEMENTS-SUMMARY.md)** - Email notification system and improvements
- **[Invite Page Redesign](features/INVITE-PAGE-REDESIGN.md)** - Event invitation page design and UX

---

## 🚀 Deployment

Guides for deploying and configuring the application.

- **[PayPal Deployment Guide](deployment/PAYPAL-DEPLOYMENT-GUIDE.md)** - Setting up PayPal payment integration in production

---

## 🔄 Migration

Documentation about migrations and major changes.

### Turborepo Migration (January 2025)

The project was successfully migrated from a single Next.js app to a Turborepo monorepo, achieving:

- ⚡ **516x faster builds** (366ms vs 3 minutes)
- 📦 Remote caching with Vercel
- 🏗️ Organized monorepo structure
- 🔄 pnpm workspaces

**Key Changes:**
- Migrated from yarn to pnpm 8.15.0
- Moved app from root to `apps/web/`
- Configured Turborepo pipeline with 5 tasks
- Enabled remote caching for team collaboration
- 148 static pages now cached and instantly deployed

**Resources:**
- See main [README.md](../README.md) for complete setup instructions
- Check [turbo.json](../turbo.json) for pipeline configuration
- Review [pnpm-workspace.yaml](../pnpm-workspace.yaml) for workspace setup

---

## 📖 Additional Resources

### Database

- [Database Setup Guide](../apps/web/database-setup/README.md) - Complete database schema and setup
- [Security Summary](../apps/web/database-setup/SECURITY-SUMMARY.md) - RLS policies and security configuration
- [Migration Guide](../apps/web/database-setup/MIGRATION-GUIDE.md) - Database migration instructions

### Supabase

- [Supabase README](../apps/web/supabase/README.md) - Supabase configuration and usage
- [Security Analysis](../apps/web/supabase/docs/security-analysis.md) - Security best practices
- [Database Setup](../apps/web/supabase/docs/database-setup-guide.md) - Supabase-specific database guide

### Development

- [GitHub Copilot Instructions](../.github/copilot-instructions.md) - AI coding assistant configuration and project guidelines

---

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Place files in appropriate directory:**
   - `architecture/` - System design, structure, technical decisions
   - `features/` - Feature guides and implementation details
   - `deployment/` - Deployment guides and production setup
   - `migration/` - Migration guides and major changes

2. **Follow naming conventions:**
   - Use UPPERCASE for main documentation files
   - Use kebab-case for subdirectories
   - Be descriptive: `PAYPAL-DEPLOYMENT-GUIDE.md` not `paypal.md`

3. **Update this README:**
   - Add your new document to the appropriate section
   - Include a brief description
   - Use relative links for easy navigation

4. **Use consistent formatting:**
   - Include a title at the top (# Document Title)
   - Add a brief overview/introduction
   - Use headings (##, ###) for sections
   - Include code examples when relevant
   - Add screenshots for UI-related guides

---

## 📞 Questions?

For additional support:
- **Email**: contact@swapnilsrivastava.eu
- **GitHub Issues**: [Create an issue](https://github.com/swapnil-srivastava/reimagined-guide/issues)
- **Website**: [swapnilsrivastava.eu](https://swapnilsrivastava.eu)

---

**Last Updated**: January 2025
