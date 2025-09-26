"use client";

import { useState } from "react";
import { Trash2, Ban, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServerAction } from "@/hooks/use-server-action";
import {
    setUserRoleAction,
    banUserAction,
    unbanUserAction,
    removeUserAction,
    impersonateUserAction,
} from "@/actions/admin.action";
import { defaultRoleLabels } from "@/lib/constants";
import { HatGlasses } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UserActionMenu({ user, isCurrentUser }) {
    const router = useRouter();
    const { execute } = useServerAction();

    const handleRoleChange = async newRole => {
        if (newRole === user.role) return;

        await execute(
            () => setUserRoleAction({ userId: user.id, role: newRole }),
            {
                successMessage: `Rôle mis à jour vers ${defaultRoleLabels[newRole] || newRole}`,
            }
        );
    };

    const handleBanUser = async () => {
        await execute(
            () =>
                banUserAction({
                    userId: user.id,
                    banReason: "Banni par l'administrateur",
                }),
            {
                successMessage: "Utilisateur banni avec succès",
            }
        );
    };

    const handleUnbanUser = async () => {
        await execute(() => unbanUserAction({ userId: user.id }), {
            successMessage: "Utilisateur débanni avec succès",
        });
    };

    const handleImpersonateUser = async () => {
        try {
            // Utiliser authClient directement au lieu d'une server action
            const result = await authClient.admin.impersonateUser({
                userId: user.id,
            });

            console.log(result);

            if (result.data?.session) {
                toast.success("Usurpation réussie");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Erreur lors de l'usurpation:", error);
        }
    };

    const handleRemoveUser = async () => {
        if (
            !confirm(
                `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.name || user.email} ?`
            )
        ) {
            return;
        }

        await execute(() => removeUserAction({ userId: user.id }), {
            successMessage: "Utilisateur supprimé avec succès",
        });
    };

    if (isCurrentUser) {
        return null;
    }

    const isBanned = user.banned;

    // Filtrer uniquement les rôles user et admin
    const allowedRoles = ["user", "admin"];
    const filteredRoles = Object.entries(defaultRoleLabels).filter(([role]) =>
        allowedRoles.includes(role)
    );

    return (
        <div className="flex gap-2 justify-end items-center">
            <Select value={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-fit">
                    <SelectValue>
                        {defaultRoleLabels[user.role] || user.role}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {filteredRoles.map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isBanned ? (
                <Button onClick={handleUnbanUser} size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Débannir
                </Button>
            ) : (
                <Button onClick={handleBanUser} size="sm">
                    <Ban className="h-4 w-4 mr-2" />
                    Bannir
                </Button>
            )}

            <Button variant="outline" onClick={handleImpersonateUser} size="sm">
                <HatGlasses className="h-4 w-4 mr-2" />
                Usurper
            </Button>

            <Button variant="destructive" onClick={handleRemoveUser} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
            </Button>
        </div>
    );
}
