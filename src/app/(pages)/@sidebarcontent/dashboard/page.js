import { hasPermissionAction } from "@/actions/organization.action";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import {
    AlertTriangle,
    Building,
    Euro,
    LayoutDashboard,
    MailPlus,
    MailPlusIcon,
    Settings,
    Users,
    MessageSquare,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import AddOnSideBarContent from "./add-on-side-bar-content";

export default async function SideBarContent() {
    const t = await getTranslations("sidebar.dashboard");
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

    const canBillingRead = await hasPermissionAction({
        permissions: { billing: ["read"] },
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
                                    <span>{t("dashboard")}</span>
                                </Link>
                            </SidebarMenuButton>
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
                        <SidebarGroupLabel className="flex gap-1 items-center uppercase">
                            {activeUserOrganization?.name ??
                                t("organization_fallback")}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {canMembresRead && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/members">
                                                <Users className="opacity-60" />
                                                <span>{t("members")}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canInvitationsRead && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/invitations">
                                                <MailPlusIcon className="opacity-60" />
                                                <span>{t("invitations")}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canBillingRead && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/subscription">
                                                <Euro className="opacity-60" />
                                                <span>{t("subscription")}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                {canOrgsUpdate && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/dashboard/org/manage">
                                                <Settings className="opacity-60" />
                                                <span>
                                                    {t("manage_organization")}
                                                </span>
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
                                                <span>{t("danger")}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

            {user.role === "admin" && (
                <SidebarGroup>
                    <SidebarGroupLabel className="flex gap-1 items-center uppercase">
                        {t("administration")}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/admin/users">
                                        <Users className="opacity-60" />
                                        <span>{t("users")}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/admin/orgs">
                                        <Building className="opacity-60" />
                                        <span>{t("organizations")}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard/admin/feedbacks">
                                        <MessageSquare className="opacity-60" />
                                        <span>{t("feedbacks")}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            <SidebarGroup>
                <SidebarGroupLabel className="flex gap-1 items-center uppercase">
                    {user.name}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard/user/settings">
                                    <Settings className="opacity-60" />
                                    <span>{t("settings")}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard/user/invitations">
                                    <MailPlus className="opacity-60" />
                                    <span>{t("invitations")}</span>
                                </Link>
                            </SidebarMenuButton>
                            {invitations.length > 0 && (
                                <SidebarMenuBadge className="bg-destructive text-destructive-foreground peer-hover/menu-button:text-destructive-foreground font-bold">
                                    {invitations.length}
                                </SidebarMenuBadge>
                            )}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link
                                    href="/dashboard/user/danger-zone"
                                    className="text-destructive"
                                >
                                    <AlertTriangle className="opacity-60" />
                                    <span>{t("danger")}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
