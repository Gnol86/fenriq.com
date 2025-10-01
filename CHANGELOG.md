# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Fixed
- Nothing yet

### Removed
- Nothing yet

## [0.1.0] - 2025-10-01

### Added

#### Core Framework
- Next.js 15.5 with App Router and Turbopack support
- JavaScript with TypeScript path mappings (`@/*`, `@app/*`, `@components/*`, etc.)
- pnpm as package manager

#### Authentication & Authorization
- Better-Auth integration with email/password authentication
- Multi-tenant organization system with role-based permissions (owner, admin, member)
- Organization membership management
- Organization invitation system
- Session management with cookie caching
- Rate limiting and security features
- Custom auth middleware for protected routes

#### Database
- PostgreSQL with Prisma ORM
- Custom Prisma client output path (`src/generated/prisma`)
- Database models for User, Session, Account, Organization, Member, Invitation
- Database hooks for session and user creation
- Auto-organization assignment on user creation

#### UI & Styling
- TailwindCSS v4 with mobile-first approach
- Shadcn/UI component library integration
- Dark mode support with Next-Themes
- Lucide React icons
- Responsive layouts and components
- Custom form components with React Hook Form integration

#### Forms & Validation
- React Hook Form for form management
- Zod validation schemas
- Custom `useServerAction` hook for executing server actions
- Form error handling and success messages
- Server actions pattern with `.action.js` files

#### Email System
- React Email for email templates
- Resend integration for email delivery
- Transactional email templates

#### Payments
- Stripe integration for subscriptions and payments
- Payment processing setup
- Webhook handling infrastructure

#### Developer Experience
- ESLint configuration with React Hooks plugin
- Prettier for code formatting
- Custom development commands (`dev`, `build`, `start`, `lint`, `format`)
- Comprehensive project documentation (CLAUDE.md/AGENTS.md)

#### Components & Features
- Global dialog manager for modals and confirmations
- Avatar component with image cropper
- Collapsible navigation components
- Tabs, tooltips, dropdowns from Radix UI
- Scroll areas and separators
- Alert dialogs for confirmations

### Infrastructure
- Vercel Blob for file storage
- Environment variable configuration
- Server URL detection utility
- Custom site configuration

---

## Version History Links

[Unreleased]: https://github.com/yourusername/boilerplate/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/boilerplate/releases/tag/v0.1.0
