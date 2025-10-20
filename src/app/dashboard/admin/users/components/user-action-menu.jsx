"use client";

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
import { useConfirm } from "@/hooks/use-confirm";
import {
    setUserRoleAction,
    banUserAction,
    unbanUserAction,
    removeUserAction,
} from "@/actions/admin.action";
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
    const confirm = useConfirm();

    const handleRoleChange = async newRole => {
        if (newRole === user.role) return;

        await execute(
            () => setUserRoleAction({ userId: user.id, role: newRole }),
            {
                successMessage: t("success_role_updated", {
                    role: tRoles(newRole),
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
        await confirm(
            {
                title: t("confirm_delete", { name: user.name || user.email }),
                variant: "destructive",
            },
            () =>
                execute(() => removeUserAction({ userId: user.id }), {
                    successMessage: t("success_deleted"),
                })
        );
    };

    if (isCurrentUser) {
        return null;
    }

    const isBanned = user.banned;

    const allowedRoles = ["user", "admin"];
    const filteredRoles = allowedRoles.map(role => [role, tRoles(role)]);

    return (
        <div className="flex items-center justify-end gap-2">
            <Select value={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-fit">
                    <SelectValue>{tRoles(user.role)}</SelectValue>
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
                    <UserCheck className="mr-2 h-4 w-4" />
                    {t("unban_button")}
                </Button>
            ) : (
                <Button onClick={handleBanUser} size="sm">
                    <Ban className="mr-2 h-4 w-4" />
                    {t("ban_button")}
                </Button>
            )}

            <Button variant="outline" onClick={handleImpersonateUser} size="sm">
                <HatGlasses className="mr-2 h-4 w-4" />
                {t("impersonate_button")}
            </Button>

            <Button variant="destructive" onClick={handleRemoveUser} size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete_button")}
            </Button>
        </div>
    );
}
