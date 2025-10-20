"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { setActiveOrganizationAction } from "@/actions/organization.action";

export default function OrganizationSelectorButton({
    organization,
    isActive,
    activeOrganizationId,
}) {
    const { execute, isPending } = useServerAction();

    const handleSelectOrganization = async () => {
        if (!organization?.id || organization.id === activeOrganizationId) {
            return;
        }

        await execute(
            () =>
                setActiveOrganizationAction({
                    organizationId: organization.id,
                }),
            {
                successMessage: `"${organization.name}" sélectionnée`,
            }
        );
    };

    if (isActive) {
        return (
            <div className="flex items-center gap-2">
                <Check className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-medium">Active</span>
            </div>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSelectOrganization}
            disabled={isPending}
            className="flex items-center gap-2"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sélection...
                </>
            ) : (
                "Sélectionner"
            )}
        </Button>
    );
}
