"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteConfig } from "@/site-config";
import { Check } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { setActiveOrganizationAction } from "@/actions/organization.action";
import ImageProfile from "../image-profile";
import CreateOrganizationDialog from "./create-organization-dialog";
import { useTranslations } from "next-intl";

export default function OrgButton({
    userOrganizations,
    activeUserOrganization,
}) {
    const { execute, isPending } = useServerAction();
    const tDashboard = useTranslations("dashboard.index");
    const tOrganizationSelector = useTranslations("organization.selector");
    const tAdminOrganizations = useTranslations("admin.organizations");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 p-2">
                <ImageProfile
                    entity={activeUserOrganization}
                    size="md"
                    defaultImage="/images/logo.png"
                />
                <div className="flex min-w-0 flex-1 flex-col items-start justify-start overflow-hidden text-left">
                    <span className="w-full truncate text-lg font-bold">
                        {SiteConfig.title}
                    </span>
                    <span className="text-muted-foreground -mt-1 w-full truncate text-xs font-medium">
                        {activeUserOrganization?.name ||
                            tDashboard("no_active_organization")}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={event => event.preventDefault()}
            >
                <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2 text-xs">
                    {tDashboard("my_organizations_title")}
                </DropdownMenuLabel>
                {userOrganizations && userOrganizations.length > 0 ? (
                    userOrganizations.map(organization => {
                        const isActive =
                            organization.id === activeUserOrganization?.id;

                        return (
                            <DropdownMenuItem
                                key={organization.id}
                                onSelect={async event => {
                                    event.preventDefault();
                                    if (isPending) return;

                                    await execute(
                                        () =>
                                            setActiveOrganizationAction({
                                                organizationId: organization.id,
                                            }),
                                        {
                                            successMessage:
                                                tOrganizationSelector(
                                                    "success_selected",
                                                    { name: organization.name }
                                                ),
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
                                {isActive ? (
                                    <Check className="text-primary h-4 w-4" />
                                ) : null}
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
    );
}
