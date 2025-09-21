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
import { LayoutDashboard } from "lucide-react";
import { Plus, Settings, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";

export default async function SideBarContent() {
    const activeOrganization = await getCurrentOrganization();
    const hasOrganization = Boolean(activeOrganization);
    const organizationLabel = activeOrganization?.name ?? "Organisation";
    return (
        <SidebarGroupContent>
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="opacity-60" />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>
                    <span>{organizationLabel}</span>
                </SidebarGroupLabel>
                <SidebarMenu>
                    {!hasOrganization ? (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard/orgs/new">
                                    <Plus className="opacity-60" />
                                    Créer une organisation
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/orgs/manage">
                                        <Settings className="opacity-60" />
                                        Gérer l&apos;organisation
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/orgs/members">
                                        <Users className="opacity-60" />
                                        Membres
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/dashboard/orgs/danger-zone"
                                        className="text-destructive"
                                    >
                                        <AlertTriangle className="opacity-60" />
                                        Danger
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarGroupContent>
    );
}
