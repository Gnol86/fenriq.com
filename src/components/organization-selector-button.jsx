"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setActiveOrganizationAction } from "@/actions/organisations.action";
import { useRouter } from "next/navigation";

export default function OrganizationSelectorButton({
    organization,
    isActive,
    activeOrganizationId,
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectOrganization = async () => {
        if (!organization?.id || organization.id === activeOrganizationId) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await setActiveOrganizationAction({
                organizationId: organization.id,
            });

            if (!result?.success) {
                throw new Error(
                    result?.error || "Impossible de sélectionner l'organisation"
                );
            }

            toast.success(
                `Organisation "${organization.name}" sélectionnée avec succès`
            );
            
            router.refresh();
        } catch (error) {
            console.error("Failed to switch organization", error);
            const message =
                error?.message ||
                "Impossible de changer d'organisation pour le moment";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isActive) {
        return (
            <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Active</span>
            </div>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSelectOrganization}
            disabled={isLoading}
            className="flex items-center gap-2"
        >
            {isLoading ? (
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