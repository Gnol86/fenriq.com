"use client";
import { useEffect, useMemo, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Loader2, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import ImageProfile from "../image-profile";
import { SiteConfig } from "@/site-config";

export default function OrgButton({ organizations = [], activeOrganization }) {
    const router = useRouter();
    const [switchingOrgId, setSwitchingOrgId] = useState(null);
    const [currentActiveOrg, setCurrentActiveOrg] = useState(
        activeOrganization ?? null
    );

    useEffect(() => {
        setCurrentActiveOrg(activeOrganization ?? null);
    }, [activeOrganization]);

    const sortedOrganizations = useMemo(() => {
        return [...organizations].sort((a, b) =>
            a.name.localeCompare(b.name, "fr", { sensitivity: "accent" })
        );
    }, [organizations]);

    const handleSwitchOrganization = async organizationId => {
        if (!organizationId || organizationId === currentActiveOrg?.id) {
            return;
        }

        setSwitchingOrgId(organizationId);
        try {
            await authClient.organization.setActive({
                organizationId,
            });

            const nextOrg =
                sortedOrganizations.find(org => org.id === organizationId) ??
                null;
            setCurrentActiveOrg(nextOrg);
            router.refresh();
        } catch (error) {
            console.error("Failed to switch organization", error);
        } finally {
            setSwitchingOrgId(null);
        }
    };

    const displayOrganization = currentActiveOrg ?? null;
    const hasOrganizations = sortedOrganizations.length > 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <ImageProfile
                    user={displayOrganization}
                    size="lg"
                    defaultImage="/images/logo.png"
                />
                <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
                    <span className="text-lg font-bold truncate w-full">
                        {SiteConfig.title}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
                        {displayOrganization?.name ||
                            "Aucune organisation active"}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={event => event.preventDefault()}
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Mes organisations
                </DropdownMenuLabel>
                {!hasOrganizations && (
                    <DropdownMenuItem disabled>
                        Aucune organisation
                    </DropdownMenuItem>
                )}
                {hasOrganizations &&
                    sortedOrganizations.map(organization => {
                        const isActive =
                            organization.id === currentActiveOrg?.id;
                        const isSwitching = switchingOrgId === organization.id;

                        return (
                            <DropdownMenuItem
                                key={organization.id}
                                onSelect={async event => {
                                    event.preventDefault();
                                    await handleSwitchOrganization(
                                        organization.id
                                    );
                                }}
                                disabled={isSwitching}
                                className="flex items-center justify-between gap-2"
                            >
                                <ImageProfile user={organization} size="xs" />
                                <span className="truncate text-sm flex-1">
                                    {organization.name}
                                </span>
                                {isSwitching ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : isActive ? (
                                    <Check className="h-4 w-4 text-primary" />
                                ) : null}
                            </DropdownMenuItem>
                        );
                    })}
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
