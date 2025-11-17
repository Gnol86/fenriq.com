"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteUserAction } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function DangerZoneForm({ user }) {
    const t = useTranslations("user.danger_zone");

    const handleDeleteClick = () => {
        dialogManager.confirm({
            title: t("alert_title"),
            description: t("alert_description"),
            confirmText: user.email,
            action: {
                label: t("alert_confirm"),
                variant: "destructive",
                onClick: async () => {
                    await deleteUserAction({ userId: user.id });
                },
                successMessage: t("success_message"),
                redirectOnSuccess: "/",
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                <p className="font-medium">{t("warning_title")}</p>
                <p className="text-destructive/70">{t("warning_subtitle")}</p>
            </div>

            <Button variant="destructive" onClick={handleDeleteClick} className="w-fit">
                <TriangleAlert /> {t("delete_button")}
                <TriangleAlert />
            </Button>
        </div>
    );
}
