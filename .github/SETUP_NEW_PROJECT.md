# 🚀 Setting Up a New Project from Boilerplate

This guide explains how to create a new project from this boilerplate and manage updates from the boilerplate upstream repository.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Required Customizations](#required-customizations)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Updating from Boilerplate](#updating-from-boilerplate)
6. [Managing Dependencies](#managing-dependencies)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Initial Setup

### 1. Clone the Boilerplate

```bash
# Clone the boilerplate repository
git clone https://github.com/Gnol86/BLP.git my-project
cd my-project
```

### 2. Configure Git Remotes

```bash
# Rename 'origin' to 'upstream' (boilerplate repo)
git remote rename origin upstream

# Create your new project repository on GitHub
# Then add it as 'origin'
git remote add origin https://github.com/YOUR_USERNAME/my-project.git

# Push to your new repository
git push -u origin main

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR_USERNAME/my-project.git (fetch)
# origin    https://github.com/YOUR_USERNAME/my-project.git (push)
# upstream  https://github.com/Gnol86/BLP.git (fetch)
# upstream  https://github.com/Gnol86/BLP.git (push)
```

### 3. Configure Git Merge Strategy

```bash
# This ensures .gitattributes rules work properly
git config merge.ours.driver true
git config merge.theirs.driver true
```

### 4. Install Dependencies

```bash
# Install packages
pnpm install

# Generate Prisma client
pnpm prisma generate

# Copy environment variables
cp .env.example .env
# Then edit .env with your values
```

---

## ⚙️ Required Customizations

After cloning, you **MUST** customize these files:

### 1. Site Configuration

**File:** `src/site-config.js`

```js
export const SiteConfig = {
    title: "My Project",           // ← Change
    description: "My description",  // ← Change
    prodUrl: "https://myapp.com",  // ← Change
    appId: "myapp",                // ← Change
    domain: "myapp.com",           // ← Change
    company: {
        name: "My Company",        // ← Change
    },
    team: {
        name: "My Team",           // ← Change
        email: "info@myapp.com",   // ← Change
    },
    mail: {
        from: "My App <noreply@myapp.com>",     // ← Change
        replyTo: "support@myapp.com",           // ← Change
        signature: "The My App Team",           // ← Change
    },
    // ... review and customize all other values
};
```

### 2. Landing Page

**File:** `src/app/page.js`

Replace the placeholder content with your landing page design.

### 3. Brand Theme

**File:** `src/app/globals.css`

Customize CSS variables to match your brand:

```css
:root {
  --primary: oklch(...);     /* Your primary color */
  --secondary: oklch(...);   /* Your secondary color */
  /* ... other brand colors */
}
```

### 4. Brand Assets

**Directory:** `public/images/`

Replace these images:
- `logo.png` - Your project logo (512x512px recommended)
- `icon.png` - Your favicon/icon (512x512px recommended)

```bash
cp /path/to/your-logo.png public/images/logo.png
cp /path/to/your-icon.png public/images/icon.png
```

### 5. Package Information

**File:** `package.json`

```json
{
  "name": "my-project",      // ← Change
  "version": "0.1.0",        // ← Update as needed
  "description": "...",      // ← Change
}
```

### 6. Environment Variables

**File:** `.env`

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."  # Generate: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# ... other environment variables
```

---

## 📁 Project Structure

### Protected Project Files (Never Overwritten)

These files/folders are **protected** and will NEVER be overwritten by upstream updates:

```
src/project/                    # All your custom code
├── components/                 # Project-specific components
├── actions/                    # Project-specific server actions
├── hooks/                      # Project-specific hooks
├── lib/                        # Project-specific utilities
├── features/                   # Feature modules
├── sidebar/                    # Custom sidebar content
└── examples/                   # Example files

src/messages/*.project.json     # Project translations
prisma/schema/project.prisma    # Project database models
src/app/page.js                 # Landing page
src/app/globals.css             # Theme/styling
src/site-config.js              # Site configuration
public/images/logo.png          # Your logo
public/images/icon.png          # Your icon
.env*                           # Environment variables
```

### Boilerplate Files (Updated from Upstream)

These files are **managed by the boilerplate** and will be updated automatically:

```
src/actions/                    # Boilerplate server actions
src/components/                 # Boilerplate UI components
src/lib/                        # Boilerplate utilities
src/hooks/                      # Boilerplate hooks
src/app/(pages)/                # Dashboard pages
src/app/(auth)/                 # Auth pages
src/app/layout.js               # Root layout
src/messages/*.json             # Boilerplate translations (not *.project.json)
prisma/schema/base.prisma       # Boilerplate database models
```

---

## 💻 Development Workflow

### Creating Project-Specific Code

#### 1. Components

```jsx
// src/project/components/product-card.jsx
"use client";

import { Card } from "@/components/ui/card";  // Use boilerplate components

export default function ProductCard({ product }) {
    return (
        <Card>
            <h3>{product.name}</h3>
            <p>{product.price}€</p>
        </Card>
    );
}
```

**Usage:**
```jsx
import ProductCard from "@project/components/product-card";
```

#### 2. Server Actions

```js
// src/project/actions/product.action.js
"use server";

import { getCurrentUser } from "@/lib/auth";  // Use boilerplate utilities
import { db } from "@/lib/db";

export async function getProducts() {
    const user = await getCurrentUser();
    return db.product.findMany({
        where: { organizationId: user.organizationId }
    });
}
```

**Usage:**
```jsx
import { getProducts } from "@project/actions/product.action";
```

#### 3. Custom Hooks

```js
// src/project/hooks/use-products.js
"use client";

import { useServerAction } from "@/hooks/use-server-action";  // Use boilerplate hook
import { getProducts } from "@project/actions/product.action";

export function useProducts() {
    const { execute, data, isPending } = useServerAction();
    // ... logic
    return { products: data, loading: isPending };
}
```

#### 4. Translations

```json
// src/messages/en.project.json
{
    "products": {
        "page_title": "My Products",
        "add_button": "Add Product"
    }
}
```

**Usage:**
```jsx
const t = useTranslations("project.products");
t("page_title");  // "My Products"
```

#### 5. Database Models

```prisma
// prisma/schema/project.prisma
model Product {
    id             String       @id @default(cuid())
    name           String
    price          Int
    organizationId String
    organization   Organization @relation(fields: [organizationId], references: [id])
    createdAt      DateTime     @default(now())
    updatedAt      DateTime     @updatedAt

    @@map("product")
}
```

Then run:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name add_product_model
```

#### 6. Sidebar Content

```jsx
// src/project/sidebar/app-sidebar.jsx
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import Link from "next/link";

export default async function AppSideBar() {
    return (
        <SidebarGroup>
            {/* Your custom navigation */}
        </SidebarGroup>
    );
}
```

Then integrate in `src/app/(pages)/@sidebarcontent/app/page.js`:
```jsx
import AppSideBar from "@project/sidebar/app-sidebar";

export default function SideBarContent() {
    return <AppSideBar />;
}
```

---

## 🔄 Updating from Boilerplate

When the boilerplate has new features or fixes, you can update your project:

### Standard Update Process

```bash
# 1. Fetch latest changes from boilerplate
git fetch upstream

# 2. Merge upstream changes
git merge upstream/main

# 3. Check results
# - ✅ Boilerplate files: automatically updated
# - ✅ Project files: kept unchanged
# - ⚠️  package.json: may need manual resolution (see below)

# 4. Install any new dependencies
pnpm install

# 5. Regenerate Prisma client if schema changed
pnpm prisma generate

# 6. Test your application
pnpm dev
```

### What Happens During Merge

| File Type | Behavior | Action Required |
|-----------|----------|-----------------|
| Boilerplate files (`src/components/`, `src/lib/`, etc.) | Automatically updated | ✅ None |
| Project files (`src/project/**`, `*.project.json`) | Kept unchanged | ✅ None |
| Template files (`page.js`, `globals.css`, `site-config.js`) | Kept unchanged | ✅ None |
| `package.json` | Union merge | ⚠️ May need manual resolution |

---

## 📦 Managing Dependencies

### Adding Project-Specific Dependencies

```bash
# Add a new dependency
pnpm add framer-motion

# Commit the change
git add package.json pnpm-lock.yaml
git commit -m "Add framer-motion for animations"
```

### Handling `package.json` Conflicts

When updating from upstream, `package.json` uses **union merge**, which may create conflicts.

**Example Conflict:**

```json
<<<<<<< HEAD (your project)
{
  "dependencies": {
    "framer-motion": "^11.0.0",    // Your addition
    "next": "15.5.3"
  }
}
=======
{
  "dependencies": {
    "next": "15.5.3",
    "zod": "^4.2.0"                 // Boilerplate addition
  }
}
>>>>>>> upstream/main
```

**Resolution:**

1. Keep **BOTH** dependencies:

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",    // Your dependency
    "next": "15.5.3",              // Common dependency
    "zod": "^4.2.0"                // Boilerplate dependency
  }
}
```

2. For **shared dependencies**, take the **upstream version**:

```json
// If both modified "next" version, take upstream version:
"next": "15.6.0"  // ← Upstream (newer)
```

3. Sort alphabetically and verify JSON syntax

4. Install and test:

```bash
pnpm install
pnpm dev
```

---

## 🐛 Troubleshooting

### Merge Conflicts

**Problem:** Git conflicts during `git merge upstream/main`

**Solution:**

```bash
# Check which files have conflicts
git status

# For each conflicted file:
# 1. Open the file
# 2. Look for <<<<<<< HEAD markers
# 3. Resolve manually (keep both, choose one, or merge logic)
# 4. Remove conflict markers

# Mark as resolved
git add <file>

# Complete merge
git commit
```

### Prisma Generation Fails

**Problem:** `pnpm prisma generate` fails after update

**Solution:**

```bash
# Reset generated client
rm -rf src/generated/prisma

# Regenerate
pnpm prisma generate

# If still failing, check your project.prisma for syntax errors
```

### Missing Dependencies

**Problem:** Build fails with missing module errors

**Solution:**

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Regenerate Prisma
pnpm prisma generate
```

### Translations Not Loading

**Problem:** Project translations not working

**Solution:**

1. Verify files exist: `src/messages/*.project.json` (fr, en, nl, de)
2. Check usage: `useTranslations("project.your_namespace")`
3. Restart dev server: `pnpm dev`

### Git Remote Issues

**Problem:** Can't push or fetch

**Solution:**

```bash
# Check remotes
git remote -v

# Re-add if missing
git remote add upstream https://github.com/Gnol86/BLP.git
git remote add origin https://github.com/YOUR_USERNAME/your-project.git
```

---

## ✅ Checklist for New Project

Use this checklist when setting up a new project:

- [ ] Clone boilerplate repository
- [ ] Configure git remotes (origin + upstream)
- [ ] Configure git merge strategies
- [ ] Install dependencies (`pnpm install`)
- [ ] Copy and configure `.env` file
- [ ] Customize `src/site-config.js`
- [ ] Replace landing page (`src/app/page.js`)
- [ ] Customize theme (`src/app/globals.css`)
- [ ] Replace logo and icon images
- [ ] Update `package.json` metadata
- [ ] Test application (`pnpm dev`)
- [ ] Initialize project-specific code in `src/project/`
- [ ] Add project translations to `*.project.json`
- [ ] Create project database models in `prisma/schema/project.prisma`
- [ ] Run Prisma migration (`pnpm prisma migrate dev`)
- [ ] Commit all changes
- [ ] Push to your repository

---

## 📚 Additional Resources

- **Project Structure:** `src/project/README.md`
- **Code Examples:** `src/project/examples/`
- **Boilerplate Documentation:** `CLAUDE.md`
- **Agent Guidelines:** `AGENTS.md`

---

## 🆘 Need Help?

If you encounter issues:

1. Check this document's [Troubleshooting](#troubleshooting) section
2. Review `src/project/examples/` for working code examples
3. Check the boilerplate repository issues: https://github.com/Gnol86/BLP/issues

---

**Happy coding! 🎉**
