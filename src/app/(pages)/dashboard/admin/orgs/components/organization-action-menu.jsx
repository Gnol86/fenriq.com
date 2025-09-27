"use client";

import { useState } from "react";
import { Trash2, Edit3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { deleteOrganizationAction } from "@/actions/admin.action";
import Link from "next/link";

export default function OrganizationActionMenu({ organization }) {
    const { execute } = useServerAction();

    const handleDeleteOrganization = async () => {
        if (
            !confirm(
                `Êtes-vous sûr de vouloir supprimer définitivement l'organisation "${organization.name}" ?`
            )
        ) {
            return;
        }

        await execute(
            () => deleteOrganizationAction({ organizationId: organization.id }),
            {
                successMessage: "Organisation supprimée avec succès",
            }
        );
    };

    return (
        <div className="flex gap-2 justify-end items-center">
            <Link href={`/dashboard/admin/orgs/${organization.slug}`}>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                </Button>
            </Link>

            <Button
                variant="destructive"
                onClick={handleDeleteOrganization}
                size="sm"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
            </Button>
        </div>
    );
}
