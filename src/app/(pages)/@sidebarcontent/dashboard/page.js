import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    getCurrentOrganization,
    hasGlobalPermission,
    requireUser,
} from "@/lib/auth-access";
import { MailPlus } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Plus, Settings, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@/generated/prisma";

export default async function SideBarContent() {
    const user = await requireUser();
    const activeOrganization = await getCurrentOrganization();
    const prisma = new PrismaClient();
    const invitations = await prisma.invitation.findMany({
        where: {
            email: user.email,
            status: "pending",
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    const hasOrganization = Boolean(activeOrganization);
    const organizationLabel = activeOrganization?.name ?? "Organisation";

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
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
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>{organizationLabel}</SidebarGroupLabel>
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
                                {(await hasGlobalPermission({
                                    organization: ["update"],
                                })) && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/orgs/manage">
                                                <Settings className="opacity-60" />
                                                Gérer l&apos;organisation
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {(await hasGlobalPermission({
                                    member: ["read"],
                                })) && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/orgs/members">
                                                <Users className="opacity-60" />
                                                Membres
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {(await hasGlobalPermission({
                                    organization: ["delete"],
                                })) && (
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
                                )}
                            </>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>{user.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard/user/invitations">
                                    <MailPlus className="opacity-60" />
                                    Invitations
                                </Link>
                            </SidebarMenuButton>
                            {invitations.length > 0 && (
                                <SidebarMenuBadge className="bg-destructive text-destructive-foreground font-bold">
                                    {invitations.length}
                                </SidebarMenuBadge>
                            )}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
