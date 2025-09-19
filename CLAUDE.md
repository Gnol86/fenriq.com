# CLAUDE.md

This file provides guidance to Codex when working with code in this repository.

## About the project PolGPT

Boilerplate for Next.js projects with Prisma, Better-Auth, Resend, Tailwind CSS, Shadcn, lucide-react, React-Hook-Form, zod, Next-Themes, and more.

## Development Commands

### Core Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm lint` - Lint the code
- `pnpm format` - Format the code

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: Javascript
- **Styling**: TailwindCSS v4 with Shadcn/UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better-Auth with organization and admin support
- **Email**: React Email with Resend
- **Payments**: Stripe integration
- **Package Manager**: pnpm

### Project Structure

- `app/` - Next.js App Router pages and layouts
- `src/components/` - UI components (Shadcn/UI in `ui/`, custom in `nowts/`)
- `src/features/` - Feature-specific components and logic
- `src/lib/` - Utilities, configurations, and services
- `src/hooks/` - Custom React hooks
- `src/actions/` - Actions server
- `emails/` - Email templates using React Email
- `prisma/` - Database schema and migrations

### Key Features

- **Multi-tenant Organizations**: Full organization management with roles and permissions
- **Authentication**: Email/password
- **Billing**: Stripe subscriptions with plan management
- **Dialog System**: Global dialog manager for modals and confirmations
- **Forms**: React Hook Form with Zod validation and server actions
- **Email System**: Transactional emails with React Email

## Code Conventions

### React/Next.js

- Prefer React Server Components over client components
- Use `"use client"` only for small components
- Wrap client components in `Suspense` with fallback
- Use dynamic loading for non-critical components
- Split components into smaller components

### Styling

- Mobile-first approach with TailwindCSS
- Use Shadcn/UI components from `src/components/ui/`
- Custom components in `src/components/`

### Styling preferences

- For spacing, prefer utility layouts like `flex flex-col gap-4` for vertical spacing and `flex gap-4` for horizontal spacing (instead of `space-y-4`).
- Prefer the card container `@src/components/ui/card.jsx` for styled wrappers rather than adding custom styles directly to `<div>` elements.

### State Management

- Use `nuqs` for URL search parameter state

### Forms and Server Actions

- Use React Hook Form with Zod validation
- Server actions in `.action.js` files
- Use `resolveActionResult` helper for mutations
- Follow form creation pattern in `/src/features/form/`

### Authentication

#### **RECOMMANDÉ - Nouvelle Data Access Layer (2025)**
- Use `getCurrentUser()` from `@/lib/data-access` for optional user (server-side)
- Use `requireUser()` from `@/lib/data-access` for required user (server-side)
- Use `getCurrentOrganization()` from `@/lib/data-access` for current org
- Use `checkUserPermissions()` from `@/lib/data-access` for permission checks
- For sensitive operations (password change, delete), use functions with `Sensitive` suffix

#### **Legacy - À migrer progressivement**
- ~~Use `getUser()` for optional user (server-side)~~ → Use `getCurrentUser()`
- ~~Use `getRequiredUser()` for required user (server-side)~~ → Use `requireUser()`
- Use `useSession()` from auth-client.ts (client-side)
- ~~Use `getCurrentOrgCache()` to get the current org~~ → Use `getCurrentOrganization()`

#### **Cache et Performance**
- Use `@/lib/permissions-cache` for granular permission caching
- Use `invalidateUserCache()` after permission changes
- Monitor performance with `@/lib/auth-monitoring`

### Database

- Prisma ORM with PostgreSQL
- Database hooks for user creation setup
- Organization-based data access patterns

## Important Files

### **Authentication System (2025)**
- `src/lib/data-access.js` - **PREFERRED** Data Access Layer with auth
- `src/lib/permissions-cache.js` - Granular permission caching
- `src/lib/auth-monitoring.js` - Monitoring and logging
- `src/lib/auth-error-handling.js` - Error handling and resilience
- `src/lib/auth.js` - Core authentication configuration

### **Other Core Files**
- `src/components/ui/form.jsx` - Form components
- `prisma/schema.prisma` - Database schema

## Development Notes

- Always use `pnpm` for package management
- Use TypeScript strict mode - no `any` types
- Prefer server components and avoid unnecessary client-side state
- Prefer using `??` than `||`

### **Authentication Best Practices**
- ALWAYS use `@/lib/data-access` for new auth-related code
- Use monitoring with `withAuthMonitoring()` for debugging
- Use resilient wrappers `withResilientAuth()` for production code
- Cache permissions with `@/lib/permissions-cache` for performance
- Use `safeAuthOperation()` for graceful error handling
- Log sensitive operations with `authLogger` for security auditing

## Files naming

- All server actions should be suffix by `.action.js` eg. `user.action.js`, `dashboard.action.js`

## Debugging and complexe tasks

- For complexe logic and debugging, use logs. Add a lot of logs at each steps and ASK ME TO SEND YOU the logs so you can debugs easily.

## TypeScript imports

Important, when you import thing try to always use TypeScript paths :

- `@/*` is link to @src

## Workflow modification

🚨 **CRITICAL RULE - ALWAYS FOLLOW THIS** 🚨

**BEFORE editing any files, you MUST Read at least 3 files** that will help you to understand how to make a coherent and consistency.

This is **NON-NEGOTIABLE**. Do not skip this step under any circumstances. Reading existing files ensures:

- Code consistency with project patterns
- Proper understanding of conventions
- Following established architecture
- Avoiding breaking changes

**Types of files you MUST read:**

1. **Similar files**: Read files that do similar functionality to understand patterns and conventions
2. **Imported dependencies**: Read the definition/implementation of any imports you're not 100% sure how to use correctly - understand their API, types, and usage patterns

**Steps to follow:**

1. Read at least 3 relevant existing files (similar functionality + imported dependencies)
2. Understand the patterns, conventions, and API usage
3. Only then proceed with creating/editing files

## **Authentication Code Examples**

### **Basic User Access**
```js
// ✅ RECOMMENDED - New Data Access Layer
import { getCurrentUser, requireUser } from '@/lib/data-access';

// Optional user
const user = await getCurrentUser();

// Required user (redirects if not found)
const user = await requireUser();

// Sensitive operation (ignores cache)
const user = await getCurrentUser(true);
```

### **Organization Management**
```js
import { getCurrentOrganization, requireOrganization } from '@/lib/data-access';

// Current organization
const org = await getCurrentOrganization();

// Required organization (redirects if not found)
const org = await requireOrganization();
```

### **Permission Checks**
```js
import { checkUserPermissions } from '@/lib/data-access';

// Basic permission check
const { organization, hasPermission } = await checkUserPermissions(['org:admin']);

// Multiple permissions
const result = await checkUserPermissions(['org:read', 'user:write']);

// With error handling
const result = await checkUserPermissions(['org:admin'], { 
  sensitiveOperation: true,
  throwOnError: true 
});
```

### **Performance Caching**
```js
import { 
  checkSinglePermission,
  getUserOrgPermissions,
  invalidateUserCache 
} from '@/lib/permissions-cache';

// Granular permission with intelligent cache
const canEdit = await checkSinglePermission('content:edit', userId, orgId);

// Get all permissions for user in org
const permissions = await getUserOrgPermissions(userId, orgId);

// Invalidate cache after changes
await invalidateUserCache(userId, orgId);
```

### **Error Handling & Monitoring**
```js
import { withAuthMonitoring, safeAuthOperation } from '@/lib/auth-monitoring';
import { withResilientAuth } from '@/lib/auth-error-handling';

// Monitor performance
const monitoredFunction = withAuthMonitoring(myAuthFunction);

// Safe operation with fallback
const user = await safeAuthOperation(() => getCurrentUser(), null);

// Resilient operation with retry + circuit breaker
const resilientGetUser = withResilientAuth(null, 'auth')(getCurrentUser);
```

**Documentation:**

Always use web-search to find documentation about the library you're using.
