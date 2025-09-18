import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { needUser } from "@/lib/auth";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus, Settings, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ActiveOrgLabel from "@/components/active-org-label";
import HasActiveOrg from "@/components/has-active-org";

export default async function Layout({ children }) {
    const user = await needUser();

    return (
        <SidebarProvider>
            <AppSidebar>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <ActiveOrgLabel />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <HasActiveOrg reverse>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/dashboard/orgs/new">
                                            <Plus className="opacity-60" />
                                            Créer une organisation
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </HasActiveOrg>
                            <HasActiveOrg>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/dashboard/orgs/manage">
                                            <Settings className="opacity-60" />
                                            Gérer l'organisation
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
                            </HasActiveOrg>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </AppSidebar>
            <main className="relative p-10 w-full h-dvh">
                <SidebarTrigger className="absolute top-2 left-2 block lg:hidden" />
                {children}
            </main>
        </SidebarProvider>
    );
}
