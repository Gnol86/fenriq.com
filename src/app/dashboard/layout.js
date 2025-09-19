import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { requireUser, getCurrentOrganization } from "@/lib/auth-access";
import { Plus, Settings, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";

export default async function Layout({ children }) {
    const user = await requireUser();
    const activeOrganization = await getCurrentOrganization();
    const hasOrganization = Boolean(activeOrganization);
    const organizationLabel = activeOrganization?.name ?? "Organisation";
    const organizations = user?.organizations ?? [];

    return (
        <SidebarProvider>
            <AppSidebar
                user={user}
                activeOrganization={activeOrganization}
                organizations={organizations}
            >
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <span>{organizationLabel}</span>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
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
                    </SidebarGroupContent>
                </SidebarGroup>
            </AppSidebar>
            <main className="relative p-0 w-full h-dvh">
                <SidebarTrigger className="absolute top-2 left-2 block lg:hidden" />
                {children}
                <AnimatedThemeToggler className="fixed bottom-4 right-4" />
            </main>
        </SidebarProvider>
    );
}
