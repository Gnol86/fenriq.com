"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { setActiveOrganizationAction } from "@/actions/organization.action";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";
import { SiteConfig } from "@/site-config";
import ImageProfile from "../image-profile";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import CreateOrganizationDialog from "./create-organization-dialog";

export default function OrgButton({ userOrganizations, activeUserOrganization }) {
    const { execute, isPending } = useServerAction();
    const tDashboard = useTranslations("dashboard.index");
    const tOrganizationSelector = useTranslations("organization.selector");
    const tAdminOrganizations = useTranslations("admin.organizations");
    const { setOpenMobile, isMobile } = useSidebar();

    return (
        <SidebarMenuItem className="mt-2">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <SidebarMenuButton
                            size="lg"
                            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                        />
                    }
                >
                    <ImageProfile
                        entity={activeUserOrganization}
                        size="sm"
                        defaultImage="/images/logo.png"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{SiteConfig.title}</span>
                        <span className="truncate text-xs">
                            {activeUserOrganization?.name || tDashboard("no_active_organization")}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--anchor-width) min-w-56 rounded-lg"
                    side={isMobile ? "top" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            {tDashboard("my_organizations_title")}
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {userOrganizations && userOrganizations.length > 0 ? (
                        userOrganizations.map(organization => {
                            const isActive = organization.id === activeUserOrganization?.id;

                            return (
                                <DropdownMenuItem
                                    key={organization.id}
                                    onClick={async () => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                        if (isPending) return;

                                        await execute(
                                            () =>
                                                setActiveOrganizationAction({
                                                    organizationId: organization.id,
                                                }),
                                            {
                                                successMessage: tOrganizationSelector(
                                                    "success_selected",
                                                    {
                                                        name: organization.name,
                                                    }
                                                ),
                                                redirectOnSuccess: "/dashboard",
                                                refreshOnSuccess: true,
                                            }
                                        );
                                    }}
                                    className="flex items-center justify-between gap-2"
                                    disabled={isPending}
                                >
                                    <ImageProfile entity={organization} size="xs" />
                                    <span className="flex-1 truncate text-sm">
                                        {organization.name}
                                    </span>
                                    {isActive ? <Check className="text-primary h-4 w-4" /> : null}
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <DropdownMenuItem disabled>
                            {tAdminOrganizations("no_organizations")}
                        </DropdownMenuItem>
                    )}

                    <CreateOrganizationDialog />
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
