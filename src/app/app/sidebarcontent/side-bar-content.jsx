import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ActiveSidebarLink } from "@components/sidebar/active-sidebar-link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SideBarContent() {
    const t = await getTranslations("sidebar.app");

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("documents_label")}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ActiveSidebarLink href="/app">
                            <Plus className="opacity-60" />
                            {t("create_document")}
                        </ActiveSidebarLink>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
