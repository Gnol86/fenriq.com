import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MailPlus } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Plus, Settings, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@/generated/prisma";
import { MailPlusIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermissionAction } from "@/actions/organization.action";
import { Building } from "lucide-react";

export default async function SideBarContent() {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });
    const user = session?.user;
    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canOrgsUpdate = await hasPermissionAction({
        permissions: { organization: ["update"] },
    });

    const canMembresRead = await hasPermissionAction({
        permissions: { member: ["read"] },
    });

    const canInvitationsRead = await hasPermissionAction({
        permissions: { invitation: ["read"] },
    });

    const canOrgsDelete = await hasPermissionAction({
        permissions: { organization: ["delete"] },
    });

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
                <SidebarGroupLabel>
                    {activeUserOrganization?.name ?? "Organisation"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {!activeUserOrganization ? (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/org/new">
                                        <Plus className="opacity-60" />
                                        Créer une organisation
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ) : (
                            <>
                                {canOrgsUpdate && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/manage">
                                                <Settings className="opacity-60" />
                                                Gérer l&apos;organisation
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canMembresRead && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/members">
                                                <Users className="opacity-60" />
                                                Membres
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canInvitationsRead && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/invitations">
                                                <MailPlusIcon className="opacity-60" />
                                                Invitations
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canOrgsDelete && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href="/dashboard/org/danger-zone"
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

            {user.role === "admin" && (
                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/admin/users">
                                        <Users className="opacity-60" />
                                        Utilisateurs
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/admin/orgs">
                                        <Building className="opacity-60" />
                                        Organisations
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            <SidebarGroup>
                <SidebarGroupLabel>{user.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard/user/settings">
                                    <Settings className="opacity-60" />
                                    Parramètres
                                </Link>
                            </SidebarMenuButton>
                            {invitations.length > 0 && (
                                <SidebarMenuBadge className="bg-destructive text-destructive-foreground font-bold">
                                    {invitations.length}
                                </SidebarMenuBadge>
                            )}
                        </SidebarMenuItem>
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
