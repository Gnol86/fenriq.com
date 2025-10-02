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
import { getRoleLabel } from "@/lib/constants";
import { HatGlasses } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UserActionMenu({ user, isCurrentUser }) {
    const t = useTranslations("admin.users");
    const tRoles = useTranslations("roles");
    const router = useRouter();
    const { execute } = useServerAction();

    const handleRoleChange = async newRole => {
        if (newRole === user.role) return;

        await execute(
            () => setUserRoleAction({ userId: user.id, role: newRole }),
            {
                successMessage: t("success_role_updated", {
                    role: getRoleLabel(newRole, tRoles),
                }),
            }
        );
    };

    const handleBanUser = async () => {
        await execute(
            () =>
                banUserAction({
                    userId: user.id,
                    banReason: t("ban_reason"),
                }),
            {
                successMessage: t("success_banned"),
            }
        );
    };

    const handleUnbanUser = async () => {
        await execute(() => unbanUserAction({ userId: user.id }), {
            successMessage: t("success_unbanned"),
        });
    };

    const handleImpersonateUser = async () => {
        try {
            const result = await authClient.admin.impersonateUser({
                userId: user.id,
            });

            if (result.data?.session) {
                toast.success(t("success_impersonate"));
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Erreur lors de l'usurpation:", error);
            toast.error(t("impersonate_error"));
        }
    };

    const handleRemoveUser = async () => {
        if (
            !confirm(
                t("confirm_delete", { name: user.name || user.email })
            )
        ) {
            return;
        }

        await execute(() => removeUserAction({ userId: user.id }), {
            successMessage: t("success_deleted"),
        });
    };

    if (isCurrentUser) {
        return null;
    }

    const isBanned = user.banned;

    const allowedRoles = ["user", "admin"];
    const filteredRoles = allowedRoles.map(role => [
        role,
        getRoleLabel(role, tRoles),
    ]);

    return (
        <div className="flex gap-2 justify-end items-center">
            <Select value={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-fit">
                    <SelectValue>
                        {getRoleLabel(user.role, tRoles)}
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
                    {t("unban_button")}
                </Button>
            ) : (
                <Button onClick={handleBanUser} size="sm">
                    <Ban className="h-4 w-4 mr-2" />
                    {t("ban_button")}
                </Button>
            )}

            <Button variant="outline" onClick={handleImpersonateUser} size="sm">
                <HatGlasses className="h-4 w-4 mr-2" />
                {t("impersonate_button")}
            </Button>

            <Button variant="destructive" onClick={handleRemoveUser} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("delete_button")}
            </Button>
        </div>
    );
}
