# AGENTS.md

This file provides specific guidance for specialized agents working with this codebase.

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
- `src/components/` - UI components (Shadcn/UI in `src/components/ui/`, custom in `src/components/`)
- `src/features/` - Feature-specific components and logic
- `src/lib/` - Utilities, configurations, and services
- `src/hooks/` - Custom React hooks
- `src/actions/` - Actions server
- `src/components/email/` - Email templates using React Email
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
- **ALWAYS** use `useServerAction` hook for executing server actions in client components
- Use `resolveActionResult` helper for mutations
- Follow form creation pattern in `/src/features/form/`

### Authentication

#### **🎯 CRITICAL - Use New System Only**

- **NEVER** use legacy auth functions (`getUser`, `getRequiredUser`, etc.)
- **ALWAYS** consider cache invalidation after mutations

#### **Patterns to Follow**

1. **Always** wrap sensitive operations with monitoring
2. **Always** use cache-aware permission checks
3. **Always** invalidate cache after permission changes
4. **Always** use resilient wrappers for production code

### Database

- Prisma ORM with PostgreSQL
- Database hooks for user creation setup
- Organization-based data access patterns

## Important Files

### **🚨 CRITICAL - Server Actions System**

- `src/hooks/use-server-action.js` - **PRIMARY** hook for server actions - ALWAYS use this in client components

### **Agent Rules for Auth**

1. **NEVER** use legacy auth patterns from existing code
2. **ALWAYS** consider cache implications

### **Other Core Files**

- `src/components/ui/form.jsx` - Form components
- `prisma/schema.prisma` - Database schema

## Development Notes

- Always use `pnpm` for package management
- Use TypeScript strict mode - no `any` types
- Prefer server components and avoid unnecessary client-side state
- Prefer using `??` than `||`
- After every file creation or modification, run `pnpm lint` before finishing the task

## Files naming

- All server actions should be suffix by `.action.js` eg. `user.action.js`, `dashboard.action.js`

## Debugging and complexe tasks

- For complexe logic and debugging, use logs. Add a lot of logs at each steps and ASK ME TO SEND YOU the logs so you can debugs easily.

## TypeScript imports

Important, when you import thing try to always use TypeScript paths :

- `@/*` is link to @src
- `@app/*` is link to @src/app
- `@components/*` is link to @src/components
- `@lib/*` is link to @src/lib
- `@hooks/*` is link to @src/hooks
- `@actions/*` is link to @src/actions
- `@email/*` is link to @src/components/email

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

### **🚨 FORBIDDEN Patterns**

```js
// ❌ NEVER use these legacy patterns
import { getUser, needUser } from "@/lib/auth"; // FORBIDDEN
const user = await getUser(); // FORBIDDEN
const user = await needUser(); // FORBIDDEN

// ❌ NEVER create auth code without monitoring
const user = await getCurrentUser(); // Missing monitoring

// ❌ NEVER forget cache invalidation
// Update permissions but forget to invalidate cache
```

### **✅ REQUIRED Patterns**

```js
// ✅ ALWAYS consider cache implications
await invalidateUserCache(userId, orgId);

// ✅ ALWAYS use resilient patterns for production
const resilientFunction = withResilientAuth(fallback)(operation);

// ✅ ALWAYS use useServerAction hook for server actions in client components
import { useServerAction } from "@/hooks/use-server-action";
const { execute, isPending, isSuccess, isError } = useServerAction();
await execute(() => myServerAction(data), {
    loadingMessage: "En cours...",
    successMessage: "Succès!",
    errorMessage: "Erreur",
});
```

# **Internationalization (i18n)**

This project uses **next-intl** for internationalization with French (fr) as the default language and English (en) support.

## Configuration Files

- `src/i18n/config.js` - Locale configuration (locales array, defaultLocale)
- `src/i18n/request.js` - Request configuration for loading translations based on cookie
- `messages/fr.json` - French translations
- `messages/en.json` - English translations
- Cookie: `NEXT_LOCALE` stores user's locale preference

## Translation Patterns

### Server Components

```js
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
    const t = await getTranslations("namespace.subnamespace");

    return <h1>{t("page_title")}</h1>;
}
```

### Client Components

```js
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
    const t = useTranslations("namespace.subnamespace");

    return <h1>{t("page_title")}</h1>;
}
```

### Zod Schemas in Client Components

Schemas must be defined **inside** the component to access translation hooks:

```js
"use client";
import { useTranslations } from "next-intl";

export default function MyForm() {
    const t = useTranslations("validation");

    // ✅ Schema inside component to access t()
    const formSchema = z.object({
        name: z.string()
            .min(2, t("name.min_length"))
            .max(50, t("name.max_length")),
    });

    // ... rest of component
}
```

## Translation Organization

Translations are organized by namespaces in `messages/fr.json` and `messages/en.json`:

```json
{
    "auth": {
        "signin": { "page_title": "...", "email_label": "..." },
        "signup": { "page_title": "...", "password_label": "..." }
    },
    "user": {
        "settings": { "page_title": "...", "name_label": "..." }
    },
    "organization": {
        "members": { "page_title": "...", "table_user": "..." }
    },
    "validation": {
        "email": { "invalid": "...", "required": "..." },
        "password": { "min_length": "...", "mismatch": "..." }
    },
    "common": { "cancel": "...", "save": "...", "n_a": "..." },
    "roles": { "owner": "...", "admin": "...", "member": "..." },
    "breadcrumbs": { "dashboard": "...", "settings": "..." }
}
```

## Helper Patterns for Dynamic Content

Translate dynamic labels with `next-intl` directly.

```js
// Client component example
const tRoles = useTranslations("roles");
const roleLabel = tRoles(member.role);

// Server component example
const tInvitationStatus = await getTranslations("invitation_status");
const statusLabel = tInvitationStatus(statusKey);
```

Utilities like `getInvitationDisplayStatus` return status keys (`pending`, `outdated`, etc.). Convert those keys to user-facing text with the appropriate translation namespace inside the component.

## Translation Keys Best Practices

1. **Namespace by feature**: `auth.signin`, `user.settings`, `organization.members`
2. **Descriptive keys**: `page_title`, `email_label`, `save_button`, `success_message`
3. **Validation namespace**: Group all validation messages under `validation.*`
4. **Common namespace**: Shared translations like buttons, labels, N/A
5. **Use parameters**: `t("confirm_delete", { name: org.name })`

## Adding Translations

When adding new user-facing text:

1. **Never hardcode text** - Always use translation keys
2. **Add to both** `messages/fr.json` AND `messages/en.json`
3. **Use appropriate namespace** based on the feature
4. **Keep keys consistent** across languages
5. **Test both languages** to ensure translations work

## Example: Complete Page Translation

```js
// Server Component
import { getTranslations } from "next-intl/server";

export default async function MembersPage() {
    const t = await getTranslations("organization.members");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("table_user")}</TableHead>
                            <TableHead>{t("table_role")}</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </CardContent>
        </Card>
    );
}
```

# **Documentation:**

✅ ALWAYS use web-search to find documentation about the library you're using.
