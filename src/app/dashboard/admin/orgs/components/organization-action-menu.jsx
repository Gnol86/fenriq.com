"use client";

import { Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { deleteOrganizationAction } from "@/actions/admin.action";
import { Button } from "@/components/ui/button";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function OrganizationActionMenu({ organization }) {
    const t = useTranslations("admin.organizations");

    const handleDeleteOrganization = async () => {
        dialogManager.confirm({
            title: t("confirm_delete", { name: organization.name }),
            action: {
                label: t("confirm_delete_label"),
                variant: "destructive",
                onClick: async () => {
                    await deleteOrganizationAction({
                        organizationId: organization.id,
                    });
                },
                successMessage: t("success_deleted"),
            },
        });
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <Link href={`/dashboard/admin/orgs/${organization.slug}`}>
                <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings_button")}
                </Button>
            </Link>

            <Button variant="destructive" onClick={handleDeleteOrganization} size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete_button")}
            </Button>
        </div>
    );
}
