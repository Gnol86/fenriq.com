# 📁 Project Directory

This directory contains **ALL project-specific code** that is unique to your application.

Files in this directory are **protected** and will **NEVER** be overwritten when you update from the boilerplate upstream.

---

## 🗂️ Directory Structure

```
src/project/
├── components/     # Project-specific UI components
├── actions/        # Project-specific server actions
├── hooks/          # Project-specific React hooks
├── lib/            # Project-specific utilities and helpers
├── features/       # Complete features (optional, feature-based organization)
├── sidebar/        # Custom sidebar content for your app
└── examples/       # Example files to guide development
```

---

## 🎯 When to Use This Directory

**✅ Use `src/project/` for:**
- Custom components unique to your application
- Server actions for your business logic
- Custom hooks for your app state/logic
- Utilities and helpers specific to your project
- Feature modules that combine components/actions/hooks

**❌ Do NOT use `src/project/` for:**
- Generic/reusable components (those go in boilerplate)
- Modifications to existing boilerplate components
- Auth, organization, or subscription logic (already in boilerplate)

---

## 📝 Import Paths

This project is configured with TypeScript path aliases:

```js
// Importing from boilerplate
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";

// Importing from project
import { MyComponent } from "@project/components/my-component";
import { myAction } from "@project/actions/my.action";
import { useMyHook } from "@project/hooks/use-my-hook";
```

---

## 🚀 Getting Started

### 1. **Create a Component**

```jsx
// src/project/components/product-card.jsx
"use client";

import { Card } from "@/components/ui/card"; // Boilerplate component
import { Button } from "@/components/ui/button"; // Boilerplate component

export default function ProductCard({ product }) {
    return (
        <Card>
            <h3>{product.name}</h3>
            <p>{product.price}€</p>
            <Button>Buy Now</Button>
        </Card>
    );
}
```

### 2. **Create a Server Action**

```js
// src/project/actions/product.action.js
"use server";

import { getCurrentUser } from "@/lib/auth"; // Boilerplate
import { db } from "@/lib/db"; // Boilerplate

export async function getProducts() {
    const user = await getCurrentUser();
    
    return db.product.findMany({
        where: { organizationId: user.organizationId }
    });
}

export async function createProduct(formData) {
    const user = await getCurrentUser();
    
    return db.product.create({
        data: {
            name: formData.get("name"),
            price: parseInt(formData.get("price")),
            organizationId: user.organizationId
        }
    });
}
```

### 3. **Create a Custom Hook**

```js
// src/project/hooks/use-products.js
"use client";

import { useServerAction } from "@/hooks/use-server-action"; // Boilerplate
import { getProducts } from "@project/actions/product.action";
import { useEffect } from "react";

export function useProducts() {
    const { execute, data, isPending } = useServerAction();
    
    useEffect(() => {
        execute(() => getProducts());
    }, []);
    
    return { products: data, loading: isPending };
}
```

### 4. **Create Custom Sidebar Content**

```jsx
// src/project/sidebar/app-sidebar.jsx
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Package } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AppSideBar() {
    const t = await getTranslations("project.sidebar");

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("products")}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/app/products">
                                <Package className="opacity-60" />
                                {t("my_products")}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
```

Then add it to the sidebar slot:

```jsx
// src/app/(pages)/@sidebarcontent/app/page.js
import AppSideBar from "@project/sidebar/app-sidebar";

export default function SideBarContent() {
    return <AppSideBar />;
}
```

---

## 🎨 Feature-Based Organization (Optional)

For larger projects, you can organize by features:

```
src/project/features/
├── products/
│   ├── components/
│   │   ├── product-card.jsx
│   │   └── product-form.jsx
│   ├── actions/
│   │   └── product.action.js
│   ├── hooks/
│   │   └── use-products.js
│   └── lib/
│       └── product-utils.js
└── orders/
    ├── components/
    ├── actions/
    └── hooks/
```

---

## 📚 Examples

Check the `examples/` directory for complete, working examples:
- `component.example.jsx` - Example component
- `action.example.action.js` - Example server action
- `hook.example.js` - Example custom hook
- `sidebar.example.jsx` - Example sidebar content

---

## 🔒 Git Protection

Files in `src/project/` are protected by `.gitattributes`:

```gitattributes
src/project/** merge=theirs
```

This means when you merge updates from the boilerplate upstream, your project files will **NEVER** be overwritten.

---

## 💡 Tips

1. **Leverage boilerplate utilities**: Use `@/lib/*`, `@/hooks/*`, `@/components/ui/*` from the boilerplate
2. **Follow naming conventions**: Use `.action.js` suffix for server actions
3. **Use translations**: Store project translations in `src/messages/*.project.json`
4. **Database models**: Add project models in `prisma/schema/project.prisma`
5. **Keep it organized**: Group related files in feature folders when projects grow

---

## 📖 More Information

See `.github/SETUP_NEW_PROJECT.md` for complete setup guide and best practices.
