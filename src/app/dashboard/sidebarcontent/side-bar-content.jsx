import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { checkAdmin, checkPermission, requireAuth } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import AddOnSideBarContent from "@/project/add-on-side-bar-content-dashboard";
import { ActiveSidebarLink } from "@components/sidebar/active-sidebar-link";
import {
    AlertTriangle,
    Building,
    Euro,
    LayoutDashboard,
    MailPlus,
    MailPlusIcon,
    MessageSquare,
    Settings,
    Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export default async function SideBarContent() {
    const t = await getTranslations("sidebar.dashboard");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

    // Récupère l'organisation active
    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    // Vérifie les permissions pour l'UI conditionnelle
    const canOrgsUpdate = await checkPermission({
        permissions: { organization: ["update"] },
    });

    const canMembresRead = await checkPermission({
        permissions: { member: ["read"] },
    });

    const canInvitationsRead = await checkPermission({
        permissions: { invitation: ["read"] },
    });

    const canOrgsDelete = await checkPermission({
        permissions: { organization: ["delete"] },
    });

    const canBillingRead = await checkPermission({
        permissions: { billing: ["read"] },
    });

    const isAdmin = await checkAdmin();
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
                            <ActiveSidebarLink href="/dashboard">
                                <LayoutDashboard className="opacity-60" />
                                <span>{t("dashboard")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <AddOnSideBarContent />

            {activeUserOrganization &&
                (canOrgsUpdate ||
                    canMembresRead ||
                    canInvitationsRead ||
                    canOrgsDelete) && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="flex items-center gap-1 uppercase">
                            {activeUserOrganization?.name ??
                                t("organization_fallback")}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {canMembresRead && (
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/org/members">
                                            <Users className="opacity-60" />
                                            <span>{t("members")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                )}
                                {canInvitationsRead && (
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/org/invitations">
                                            <MailPlusIcon className="opacity-60" />
                                            <span>{t("invitations")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                )}
                                {canBillingRead && (
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/org/subscription">
                                            <Euro className="opacity-60" />
                                            <span>{t("subscription")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                )}
                                {canOrgsUpdate && (
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/org/manage">
                                            <Settings className="opacity-60" />
                                            <span>
                                                {t("manage_organization")}
                                            </span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                )}
                                {canOrgsDelete && (
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink
                                            href="/dashboard/org/danger-zone"
                                            className="text-destructive"
                                        >
                                            <AlertTriangle className="opacity-60" />
                                            <span>{t("danger")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

            {isAdmin && (
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-1 uppercase">
                        {t("administration")}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <ActiveSidebarLink href="/dashboard/admin/users">
                                    <Users className="opacity-60" />
                                    <span>{t("users")}</span>
                                </ActiveSidebarLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <ActiveSidebarLink href="/dashboard/admin/orgs">
                                    <Building className="opacity-60" />
                                    <span>{t("organizations")}</span>
                                </ActiveSidebarLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <ActiveSidebarLink href="/dashboard/admin/feedbacks">
                                    <MessageSquare className="opacity-60" />
                                    <span>{t("feedbacks")}</span>
                                </ActiveSidebarLink>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-1 uppercase">
                    {user.name}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/user/settings">
                                <Settings className="opacity-60" />
                                <span>{t("settings")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/user/invitations">
                                <MailPlus className="opacity-60" />
                                <span>{t("invitations")}</span>
                            </ActiveSidebarLink>
                            {invitations.length > 0 && (
                                <SidebarMenuBadge className="bg-destructive text-destructive-foreground peer-hover/menu-button:text-destructive-foreground font-bold">
                                    {invitations.length}
                                </SidebarMenuBadge>
                            )}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <ActiveSidebarLink
                                href="/dashboard/user/danger-zone"
                                className="text-destructive"
                            >
                                <AlertTriangle className="opacity-60" />
                                <span>{t("danger")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
