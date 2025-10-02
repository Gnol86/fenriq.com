import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function SideBarContent() {
    const t = await getTranslations("sidebar.app");

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("documents_label")}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/app">
                                <Plus className="opacity-60" />
                                {t("create_document")}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
