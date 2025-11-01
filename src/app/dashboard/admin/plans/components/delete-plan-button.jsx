"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deletePlanAction } from "@/actions/plan.action";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useServerAction } from "@/hooks/use-server-action";

export default function DeletePlanButton({ planId, planName }) {
    const t = useTranslations("admin.plans");
    const { execute } = useServerAction();
    const confirm = useConfirm();

    const handleDelete = async () => {
        await confirm(
            {
                title: t("confirm_delete", { name: planName }),
                variant: "destructive",
            },
            () =>
                execute(() => deletePlanAction({ planId }), {
                    successMessage: t("success_deleted"),
                })
        );
    };

    return (
        <Button variant="destructive" size="icon-sm" onClick={handleDelete}>
            <Trash2 />
        </Button>
    );
}
