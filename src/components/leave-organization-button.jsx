"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { leaveOrganizationAction } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirm } from "@/hooks/use-confirm";
import { useServerAction } from "@/hooks/use-server-action";

export default function LeaveOrganizationButton({ organization, isActive }) {
    const t = useTranslations("organization.leave");
    const { execute, isPending } = useServerAction();
    const confirm = useConfirm();

    const handleLeaveOrganization = useCallback(async () => {
        if (!organization?.id) {
            return;
        }

        await confirm(
            {
                title: t("dialog_title"),
                description: t("dialog_description", {
                    orgName: organization.name,
                }),
                variant: "destructive",
            },
            () =>
                execute(
                    () =>
                        leaveOrganizationAction({
                            organizationId: organization.id,
                        }),
                    {
                        successMessage: t("success_message", {
                            orgName: organization.name,
                        }),
                        errorMessage: t("error_message"),
                    }
                )
        );
    }, [organization, confirm, execute, t]);

    // Ne pas afficher le bouton si c'est l'organisation active
    if (isActive) {
        return null;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="destructive"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={handleLeaveOrganization}
                    aria-label={t("button_aria_label")}
                >
                    <LogOut />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{t("button_aria_label")}</TooltipContent>
        </Tooltip>
    );
}
