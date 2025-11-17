"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deletePlanAction } from "@/actions/plan.action";
import { Button } from "@/components/ui/button";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function DeletePlanButton({ planId, planName }) {
    const t = useTranslations("admin.plans");

    const handleDelete = async () => {
        dialogManager.confirm({
            title: t("confirm_delete", { name: planName }),
            action: {
                label: t("confirm_delete_label"),
                variant: "destructive",
                onClick: async () => {
                    await deletePlanAction({ planId });
                },
                successMessage: t("success_deleted"),
            },
        });
    };

    return (
        <Button variant="destructive" size="icon-sm" onClick={handleDelete}>
            <Trash2 />
        </Button>
    );
}
