import { ActiveSidebarLink } from "@components/sidebar/active-sidebar-link";
import {
    AlertTriangle,
    Building,
    ChevronRight,
    Euro,
    LayoutDashboard,
    MailPlus,
    MailPlusIcon,
    MessageSquare,
    ReceiptEuro,
    Settings,
    Users,
} from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import prisma from "@/lib/prisma";
import AddOnSideBarContent from "@/project/add-on-side-bar-content-dashboard";

export default async function SideBarContent() {
    const t = await getTranslations("sidebar.dashboard");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();
    const requestHeaders = await headers();

    const [
        userOrganizations,
        session,
        canOrgsUpdate,
        canMembresRead,
        canInvitationsRead,
        canOrgsDelete,
        canBillingManage,
        isAdmin,
        invitations_count,
    ] = await Promise.all([
        auth.api.listOrganizations({
            headers: requestHeaders,
        }),
        auth.api.getSession({
            headers: requestHeaders,
        }),
        checkPermission({
            permissions: { organization: ["update"] },
        }),
        checkPermission({
            permissions: { member: ["read"] },
        }),
        checkPermission({
            permissions: { invitation: ["read"] },
        }),
        checkPermission({
            permissions: { organization: ["delete"] },
        }),
        checkPermission({
            permissions: { billing: ["manage"] },
        }),
        checkAdmin(),
        prisma.invitation.count({
            where: {
                email: user.email,
                status: "pending",
                expiresAt: {
                    gt: new Date(),
                },
            },
        }),
    ]);

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const feedbacks_count = isAdmin
        ? await prisma.feedback.count({
              where: {
                  isResolved: false,
              },
          })
        : 0;

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
                    canOrgsDelete ||
                    canBillingManage) && (
                    <Collapsible className="group/collapsible">
                        <SidebarGroup>
                            <SidebarGroupLabel
                                render={<CollapsibleTrigger />}
                                className="flex items-center gap-1 uppercase [&[data-panel-open]>svg]:rotate-90"
                            >
                                {activeUserOrganization?.name ?? t("organization_fallback")}
                                <ChevronRight className="ml-auto transition-transform" />
                            </SidebarGroupLabel>

                            <CollapsibleContent>
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
                                        {canBillingManage && (
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
                                                    <span>{t("manage_organization")}</span>
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
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}

            {isAdmin && (
                <Collapsible className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel
                            render={<CollapsibleTrigger />}
                            className="flex items-center gap-1 uppercase [&[data-panel-open]>svg]:rotate-90"
                        >
                            {t("administration")}
                            <ChevronRight className="ml-auto transition-transform" />
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/admin">
                                            <LayoutDashboard className="opacity-60" />
                                            <span>{t("admin_dashboard")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
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
                                        <ActiveSidebarLink href="/dashboard/admin/plans">
                                            <ReceiptEuro className="opacity-60" />
                                            <span>{t("plans")}</span>
                                        </ActiveSidebarLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <ActiveSidebarLink href="/dashboard/admin/feedbacks">
                                            <MessageSquare className="opacity-60" />
                                            <span>{t("feedbacks")}</span>
                                        </ActiveSidebarLink>
                                        {feedbacks_count > 0 && (
                                            <SidebarMenuBadge className="bg-destructive text-destructive-foreground peer-hover/menu-button:text-destructive-foreground font-bold">
                                                {feedbacks_count}
                                            </SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            )}

            <Collapsible className="group/collapsible">
                <SidebarGroup>
                    <SidebarGroupLabel
                        render={<CollapsibleTrigger />}
                        className="flex items-center gap-1 uppercase [&[data-panel-open]>svg]:rotate-90"
                    >
                        {user.name}
                        <ChevronRight className="ml-auto transition-transform" />
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <ActiveSidebarLink href="/dashboard/user/invitations">
                                        <MailPlus className="opacity-60" />
                                        <span>{t("invitations")}</span>
                                    </ActiveSidebarLink>
                                    {invitations_count > 0 && (
                                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground peer-hover/menu-button:text-destructive-foreground font-bold">
                                            {invitations_count}
                                        </SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <ActiveSidebarLink href="/dashboard/user/settings">
                                        <Settings className="opacity-60" />
                                        <span>{t("settings")}</span>
                                    </ActiveSidebarLink>
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
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>
        </>
    );
}
