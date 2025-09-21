import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { getCurrentOrganization } from "@/lib/auth-access";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SideBarContent() {
    const activeOrganization = await getCurrentOrganization();
    const hasOrganization = Boolean(activeOrganization);
    const organizationLabel = activeOrganization?.name ?? "Organisation";
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Documents</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/app">
                                <Plus className="opacity-60" />
                                Créer un document
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
