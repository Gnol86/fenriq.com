"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteOrganizationAction } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function DangerZoneForm({ organization, hasActiveSubscription }) {
    const t = useTranslations("organization.danger_zone");

    const handleDeleteClick = () => {
        if (hasActiveSubscription) {
            return;
        }

        dialogManager.confirm({
            title: t("alert_title"),
            description: t("alert_description", {
                name: organization.name,
            }),
            confirmText: organization.name,
            action: {
                label: t("alert_confirm"),
                variant: "destructive",
                onClick: async () => {
                    await deleteOrganizationAction({
                        organizationId: organization.id,
                    });
                },
                successMessage: t("success_message"),
                redirectOnSuccess: "/dashboard",
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {hasActiveSubscription ? (
                <div className="rounded-md border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
                    <p className="font-medium">{t("subscription_warning_title")}</p>
                    <p className="text-yellow-600/70 dark:text-yellow-400/70">
                        {t("subscription_warning_description")}
                    </p>
                </div>
            ) : (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                    <p className="font-medium">{t("warning_title", { name: organization.name })}</p>
                    <p className="text-destructive/70">{t("warning_subtitle")}</p>
                </div>
            )}

            <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={hasActiveSubscription}
                className="w-fit"
            >
                <TriangleAlert /> {t("delete_button")}
                <TriangleAlert />
            </Button>
        </div>
    );
}
