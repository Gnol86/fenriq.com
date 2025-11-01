/**
 * ============================================================
 * EXAMPLE: Sidebar Content
 * ============================================================
 *
 * This is an example of project-specific sidebar navigation.
 * The sidebar is used to add custom navigation menus.
 *
 * Location: src/project/sidebar/
 * Integration: Add to src/app/(pages)/@sidebarcontent/app/page.js
 * ============================================================
 */

import { BarChart, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export default async function AppSideBar() {
    const t = await getTranslations("project.sidebar");

    return (
        <>
            {/* Main Application Menu */}
            <SidebarGroup>
                <SidebarGroupLabel className="uppercase">
                    {t("application")}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/app/products">
                                    <Package className="opacity-60" />
                                    <span>{t("products")}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/app/orders">
                                    <ShoppingCart className="opacity-60" />
                                    <span>{t("orders")}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/app/analytics">
                                    <BarChart className="opacity-60" />
                                    <span>{t("analytics")}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}

/**
 * ============================================================
 * INTEGRATION
 * ============================================================
 *
 * In src/app/(pages)/@sidebarcontent/app/page.js:
 *
 * import AppSideBar from "@project/sidebar/app-sidebar";
 *
 * export default function SideBarContent() {
 *     return <AppSideBar />;
 * }
 *
 * ============================================================
 *
 * TRANSLATIONS
 * ============================================================
 *
 * Add to src/messages/en.project.json:
 *
 * {
 *   "sidebar": {
 *     "application": "Application",
 *     "products": "Products",
 *     "orders": "Orders",
 *     "analytics": "Analytics"
 *   }
 * }
 *
 * ============================================================
 */
