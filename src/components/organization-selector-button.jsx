"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { setActiveOrganizationAction } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";

export default function OrganizationSelectorButton({
    organization,
    isActive,
    activeOrganizationId,
}) {
    const t = useTranslations("organization.selector");
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
                successMessage: t("success_selected", {
                    name: organization.name,
                }),
            }
        );
    };

    if (isActive) {
        return (
            <div className="flex items-center gap-2">
                <Check className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-medium">
                    {t("active_label")}
                </span>
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
                    {t("selecting_button")}
                </>
            ) : (
                t("select_button")
            )}
        </Button>
    );
}
