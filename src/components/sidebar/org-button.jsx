"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteConfig } from "@/site-config";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useServerAction } from "@/hooks/use-server-action";
import { setActiveOrganizationAction } from "@/actions/organization.action";
import ImageProfile from "../image-profile";
import { Loader2 } from "lucide-react";

export default function OrgButton({
    userOrganizations,
    activeUserOrganization,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <ImageProfile
                    user={activeUserOrganization}
                    size="md"
                    defaultImage="/images/logo.png"
                />
                <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
                    <span className="text-lg font-bold truncate w-full">
                        {SiteConfig.title}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
                        {activeUserOrganization?.name ||
                            "Aucune organisation active"}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={event => event.preventDefault()}
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                    Mes organisations{" "}
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
                                            successMessage: `"${organization.name}" sélectionnée`,
                                            refreshOnSuccess: true,
                                        }
                                    );
                                }}
                                className="flex items-center justify-between gap-2"
                                disabled={isPending}
                            >
                                <ImageProfile user={organization} size="xs" />
                                <span className="truncate text-sm flex-1">
                                    {organization.name}
                                </span>
                                {isActive ? (
                                    <Check className="h-4 w-4 text-primary" />
                                ) : null}
                            </DropdownMenuItem>
                        );
                    })
                ) : (
                    <DropdownMenuItem disabled>
                        Aucune organisation
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        router.push("/dashboard/orgs/new");
                    }}
                >
                    <Plus className="" aria-hidden="true" />
                    Créer une organisation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
