"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageProfile from "../image-profile";
import { SiteConfig } from "@/site-config";
import { setActiveOrganizationAction } from "@/actions/organisations.action";
import { useServerAction } from "@/hooks/use-server-action";

export default function OrgButton({ organizations = [], activeOrganization }) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();

    const handleSwitchOrganization = async organizationId => {
        await execute(() => setActiveOrganizationAction({ organizationId }), {
            loadingMessage: `Changement de l'organisation...`,
            successMessage: `Organisation sélectionnée avec succès`,
            errorMessage: "Impossible de changer d'organisation",
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <ImageProfile
                    user={activeOrganization}
                    size="md"
                    defaultImage="/images/logo.png"
                />
                <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
                    <span className="text-lg font-bold truncate w-full">
                        {SiteConfig.title}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
                        {activeOrganization?.name ||
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
                    {isPending && (
                        <Loader2 size={10} className="animate-spin" />
                    )}
                </DropdownMenuLabel>
                {organizations.length > 0 ? (
                    organizations.map(organization => {
                        const isActive =
                            organization.id === activeOrganization?.id;

                        return (
                            <DropdownMenuItem
                                key={organization.id}
                                onSelect={async event => {
                                    event.preventDefault();
                                    await handleSwitchOrganization(
                                        organization.id
                                    );
                                }}
                                disabled={isPending}
                                className="flex items-center justify-between gap-2"
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
