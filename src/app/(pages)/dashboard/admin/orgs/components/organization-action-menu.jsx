"use client";

import { useState } from "react";
import { Trash2, Edit3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import {
    updateOrganizationAction,
    deleteOrganizationAction,
} from "@/actions/admin.action";

export default function OrganizationActionMenu({ organization }) {
    const { execute } = useServerAction();

    const handleUpdateOrganization = async () => {
        // Pour l'instant, juste un placeholder
        // Dans une vraie application, cela ouvrirait un modal de modification
        console.log("Modifier l'organisation:", organization.id);
    };

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
            <Button variant="outline" onClick={handleUpdateOrganization} size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
            </Button>

            <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
            </Button>

            <Button variant="destructive" onClick={handleDeleteOrganization} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
            </Button>
        </div>
    );
}
