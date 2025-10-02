"use client";

import { useState } from "react";
import { Trash2, Edit3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { deleteOrganizationAction } from "@/actions/admin.action";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function OrganizationActionMenu({ organization }) {
    const t = useTranslations("admin.organizations");
    const { execute } = useServerAction();

    const handleDeleteOrganization = async () => {
        if (!confirm(t("confirm_delete", { name: organization.name }))) {
            return;
        }

        await execute(
            () => deleteOrganizationAction({ organizationId: organization.id }),
            {
                successMessage: t("success_deleted"),
            }
        );
    };

    return (
        <div className="flex gap-2 justify-end items-center">
            <Link href={`/dashboard/admin/orgs/${organization.slug}`}>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("settings_button")}
                </Button>
            </Link>

            <Button
                variant="destructive"
                onClick={handleDeleteOrganization}
                size="sm"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("delete_button")}
            </Button>
        </div>
    );
}
