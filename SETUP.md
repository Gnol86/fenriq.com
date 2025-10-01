# Setup Guide

Complete setup guide for the PolGPT boilerplate.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Better-Auth Configuration](#better-auth-configuration)
- [Email Setup (Resend)](#email-setup-resend)
- [Stripe Setup (Optional)](#stripe-setup-optional)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.x or 20.x installed ([Download](https://nodejs.org/))
- **pnpm** package manager installed (`npm install -g pnpm`)
- **PostgreSQL** database (local or cloud)
  - Local: [PostgreSQL Downloads](https://www.postgresql.org/download/)
  - Cloud: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd boilerplate
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including Next.js, Prisma, Better-Auth, and UI libraries.

## Database Setup

### Option A: Local PostgreSQL

1. **Start PostgreSQL** (if not running):
   ```bash
   # macOS (with Homebrew)
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start via Services or pgAdmin
   ```

2. **Create Database**:
   ```bash
   psql postgres
   CREATE DATABASE polgpt_dev;
   \q
   ```

3. **Get Connection String**:
   ```
   postgresql://your_username:your_password@localhost:5432/polgpt_dev
   ```

### Option B: Cloud PostgreSQL (Recommended for Production)

#### Using Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the connection string (use Transaction mode for Prisma)

#### Using Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

#### Using Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from Variables tab

### 3. Configure Prisma

Create `.env` file in root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### 4. Run Migrations

```bash
# Generate Prisma Client
pnpm prisma generate

# Create database tables
pnpm prisma migrate dev --name init

# Verify with Prisma Studio (optional)
pnpm prisma studio
```

Prisma Studio will open at http://localhost:5555 where you can view and edit database records.

## Environment Configuration

Create a `.env` file in the project root with all required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-minimum-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Environment Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | Secret key for auth tokens (min 32 chars) |
| `BETTER_AUTH_URL` | ✅ | Base URL of your app |
| `RESEND_API_KEY` | ✅ | API key from Resend |
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key (if using payments) |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe webhook secret (if using payments) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe publishable key (client-side) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your application URL |

## Better-Auth Configuration

Better-Auth is pre-configured in `src/lib/auth.js`.

### Generate Secret Key

Generate a secure secret key (minimum 32 characters):

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```env
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### Configuration Details

The auth system includes:

- **Session Duration**: 7 days
- **Cookie Cache**: 5 minutes
- **Rate Limiting**: 100 requests per 10 seconds
- **Organization Support**: Multi-tenant with roles
- **Admin Plugin**: Admin capabilities
- **Localization**: Multi-language support

### Default Roles

- **owner**: Full control, can delete organization
- **admin**: Manage members and settings
- **member**: Basic access

## Email Setup (Resend)

### 1. Create Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Verify your email
3. Add your domain (or use onboarding domain for testing)

### 2. Get API Key

1. Go to [API Keys](https://resend.com/api-keys)
2. Create new API key
3. Copy and add to `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

### 3. Configure Email Templates

Email templates are in `src/components/email/`. Customize as needed:

```jsx
// Example: Welcome email
import { Button, Html } from '@react-email/components';

export function WelcomeEmail({ userName }) {
  return (
    <Html>
      <h1>Welcome {userName}!</h1>
      <Button href="https://yourapp.com">Get Started</Button>
    </Html>
  );
}
```

### 4. Test Email Sending

Create a test server action:

```js
// src/actions/test-email.action.js
"use server";

import { sendEmail } from "@/lib/email";

export async function testEmail() {
  await sendEmail({
    to: "your-email@example.com",
    subject: "Test Email",
    react: <WelcomeEmail userName="Test User" />
  });
}
```

## Stripe Setup (Optional)

Only required if you're implementing payments.

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Activate your account
3. Switch to Test mode (toggle in top right)

### 2. Get API Keys

1. Go to [API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy both keys:

```env
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
```

### 3. Setup Webhooks

For local development:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy webhook secret:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
   ```

For production, create webhook in [Stripe Dashboard](https://dashboard.stripe.com/webhooks).

### 4. Create Products

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Create your subscription plans
3. Copy price IDs for your app

## Running the Application

### Development Mode

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

The app will:
- Hot reload on file changes
- Use Turbopack for fast builds
- Show detailed error messages

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Other Commands

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Open database viewer
pnpm prisma studio

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Check firewall/network settings

**Test connection**:
```bash
psql "postgresql://user:password@host:5432/dbname"
```

### Prisma Client Issues

**Error**: `PrismaClient is unable to be run in the browser`

**Solution**: Ensure you're only importing Prisma in server components or API routes.

**Error**: `Unknown field` or type errors

**Solution**: Regenerate Prisma Client:
```bash
pnpm prisma generate
```

### Better-Auth Issues

**Error**: `BETTER_AUTH_SECRET is required`

**Solution**: Generate and add secret to `.env`:
```bash
openssl rand -base64 32
```

**Error**: `Invalid session` or authentication loops

**Solutions**:
- Clear browser cookies
- Verify `BETTER_AUTH_URL` matches your app URL
- Check database for session records

### Email Sending Issues

**Error**: `Resend API key is invalid`

**Solutions**:
- Verify API key is correct
- Check API key permissions
- Ensure domain is verified (for production)

**Error**: Email not received

**Solutions**:
- Check spam folder
- Verify email address
- Check Resend dashboard logs
- Use test mode for development

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Build Errors

**Error**: Type errors during build

**Solutions**:
- Run `pnpm lint` to find issues
- Check TypeScript path mappings
- Verify all imports are correct

**Error**: Module not found

**Solutions**:
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Stripe Webhook Issues

**Error**: Webhook signature verification failed

**Solutions**:
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook endpoint is accessible
- Check Stripe CLI is forwarding correctly

### Performance Issues

**Slow development server**:
- Turbopack is already enabled
- Clear `.next` folder
- Reduce number of files watched

**Slow database queries**:
- Add indexes to Prisma schema
- Use `prisma studio` to analyze queries
- Consider database connection pooling

## Next Steps

After setup is complete:

1. **Create your first user**: Register at `/auth/sign-up`
2. **Create an organization**: Navigate to `/dashboard/organizations`
3. **Customize the app**: Update site config in `src/site-config.js`
4. **Add your branding**: Update logo and colors
5. **Deploy**: See [README.md](./README.md#deployment) for deployment guide

## Getting Help

- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for development guidelines
- **Issues**: Check existing issues or create new one
- **Better-Auth**: [better-auth.com](https://better-auth.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)

## Security Checklist

Before deploying to production:

- [ ] Change all default secrets and keys
- [ ] Use strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure Stripe webhooks with production keys
- [ ] Verify email domain in Resend
- [ ] Set `NODE_ENV=production`
- [ ] Review and restrict API routes
- [ ] Enable security headers
- [ ] Set up monitoring and logging
