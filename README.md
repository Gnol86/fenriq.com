# PolGPT Boilerplate

A production-ready Next.js boilerplate with authentication, multi-tenant organizations, payments, and email system built-in.

## 🚀 Features

- **Next.js 15.5** with App Router and Turbopack
- **Authentication** with Better-Auth (email/password, organization support)
- **Multi-tenant Organizations** with role-based permissions
- **PostgreSQL** database with Prisma ORM
- **Stripe** integration for payments and subscriptions
- **Email System** with React Email and Resend
- **UI Components** with Shadcn/UI and TailwindCSS v4
- **Form Management** with React Hook Form and Zod validation
- **Dark Mode** support with Next-Themes
- **Type-safe** with TypeScript path mappings

## 📋 Prerequisites

- Node.js 18+ or 20+
- PostgreSQL database
- pnpm package manager

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd boilerplate
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Stripe (optional)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma db seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
boilerplate/
├── app/                      # Next.js App Router pages and layouts
├── src/
│   ├── actions/             # Server actions (*.action.js)
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/UI components
│   │   └── email/          # Email templates (React Email)
│   ├── features/           # Feature-specific components and logic
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, configurations, and services
│   └── generated/          # Generated files (Prisma client)
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                  # Static assets
```

## 🔐 Authentication

This boilerplate uses [Better-Auth](https://better-auth.com) with:

- Email/password authentication
- Organization management with roles (owner, admin, member)
- Session management with cookie caching
- Rate limiting and security features

### Key Files

- `src/lib/auth.js` - Better-Auth configuration
- `src/lib/organization-permissions.js` - Role-based permissions
- `src/hooks/use-server-action.js` - Hook for server actions (always use this in client components)

## 🏢 Organizations

Multi-tenant organization system with:

- Create and manage organizations
- Invite members with roles
- Role-based permissions (owner, admin, member)
- Organization switching

### Database Models

- `User` - User accounts
- `Organization` - Organizations/tenants
- `Member` - Organization membership with roles
- `Invitation` - Organization invitations

## 💳 Stripe Integration

Stripe integration for:

- Subscription management
- Payment processing
- Webhook handling

Configure Stripe by setting environment variables and webhook endpoints.

## 📧 Email System

Email templates built with [React Email](https://react.email):

- Transactional emails
- Email delivery via [Resend](https://resend.com)
- Customizable templates in `src/components/email/`

## 🎨 Styling

- **TailwindCSS v4** with mobile-first approach
- **Shadcn/UI** components in `src/components/ui/`
- **Dark mode** support with `next-themes`
- **Lucide React** icons

### Styling Conventions

- Use `flex flex-col gap-4` for vertical spacing
- Use `flex gap-4` for horizontal spacing
- Prefer Card component for styled wrappers

## 📝 Forms and Validation

- **React Hook Form** for form management
- **Zod** for schema validation
- Server actions in `*.action.js` files
- Always use `useServerAction` hook in client components

### Example Form Pattern

```jsx
import { useServerAction } from "@/hooks/use-server-action";
import { myServerAction } from "@/actions/my.action";

function MyForm() {
  const { execute, isPending } = useServerAction();

  const onSubmit = async (data) => {
    await execute(() => myServerAction(data), {
      loadingMessage: "Saving...",
      successMessage: "Saved successfully!",
      errorMessage: "Failed to save",
    });
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

## 🔧 Development Commands

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code with ESLint
pnpm format       # Format code with Prettier
```

## 🗄️ Database Commands

```bash
pnpm prisma generate       # Generate Prisma Client
pnpm prisma migrate dev    # Run migrations in development
pnpm prisma migrate deploy # Run migrations in production
pnpm prisma studio         # Open Prisma Studio (database GUI)
pnpm prisma db seed        # Seed database
```

## 📚 Code Conventions

### React/Next.js

- Prefer React Server Components over client components
- Use `"use client"` only when necessary
- Wrap client components in `Suspense` with fallback
- Use dynamic loading for non-critical components

### TypeScript Path Mappings

- `@/*` → `src/`
- `@app/*` → `src/app/`
- `@components/*` → `src/components/`
- `@lib/*` → `src/lib/`
- `@hooks/*` → `src/hooks/`
- `@actions/*` → `src/actions/`
- `@email/*` → `src/components/email/`

### File Naming

- Server actions: `*.action.js` (e.g., `user.action.js`)
- Components: PascalCase (e.g., `UserProfile.jsx`)
- Utilities: kebab-case (e.g., `string-utils.js`)

### State Management

- Use `nuqs` for URL search parameter state
- Prefer server components to avoid client-side state
- Use `??` instead of `||` for nullish coalescing

## 🚨 Important Rules

### Authentication

- **NEVER** use legacy auth functions (`getUser`, `getRequiredUser`)
- **ALWAYS** use `useServerAction` hook for server actions in client components
- **ALWAYS** consider cache invalidation after mutations

### Before Editing Files

1. Read at least 3 similar files to understand patterns
2. Understand conventions and architecture
3. Only then proceed with changes

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `BETTER_AUTH_URL` - Your production URL
- `RESEND_API_KEY` - Resend API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_APP_URL` - Your production URL

### Database Migrations

Run migrations in production:

```bash
pnpm prisma migrate deploy
```

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Better-Auth Documentation](https://better-auth.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

## 🤝 Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and conventions.

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org)
- [Better-Auth](https://better-auth.com)
- [Prisma](https://www.prisma.io)
- [Shadcn/UI](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
- [Stripe](https://stripe.com)
- [Resend](https://resend.com)
- [React Email](https://react.email)
