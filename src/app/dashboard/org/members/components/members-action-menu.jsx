"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import {
    removeMemberAction,
    updateMemberRoleAction,
} from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { useServerAction } from "@/hooks/use-server-action";

export default function MembersActionMenu({
    member,
    organizationId,
    memberRole,
    currentUserId,
    canUpdate,
    canDelete,
}) {
    const t = useTranslations("organization.members");
    const tRoles = useTranslations("roles");
    const { execute, isPending } = useServerAction();
    const confirm = useConfirm();

    const isSelf = useMemo(() => {
        const memberUserId = member?.user?.id ?? member?.userId;
        return Boolean(currentUserId && memberUserId === currentUserId);
    }, [currentUserId, member]);

    const handleRoleChange = useCallback(
        async role => {
            if (!organizationId || !member?.id || role === memberRole) {
                return;
            }

            await execute(
                () =>
                    updateMemberRoleAction({
                        memberId: member.id,
                        role,
                        organizationId,
                    }),
                {
                    successMessage: t("success_role_updated"),
                    errorMessage: t("error_role_update"),
                }
            );
        },
        [member?.id, memberRole, organizationId, execute, t]
    );

    const handleRemoveMember = useCallback(async () => {
        if (!organizationId || !member?.id) {
            return;
        }

        const memberName = member?.user?.name;

        await confirm(
            {
                title: t("remove_dialog_title"),
                description: memberName
                    ? t("remove_dialog_description", { name: memberName })
                    : t("remove_dialog_description_fallback"),
                variant: "destructive",
            },
            () =>
                execute(
                    () =>
                        removeMemberAction({
                            memberIdOrEmail: member.id,
                            organizationId,
                        }),
                    {
                        successMessage: t("success_member_removed"),
                        errorMessage: t("error_member_remove"),
                    }
                )
        );
    }, [member, organizationId, confirm, execute, t]);

    const roleOptions = useMemo(
        () => [
            ["owner", tRoles("owner")],
            ["admin", tRoles("admin")],
            ["member", tRoles("member")],
        ],
        [tRoles]
    );

    if (isSelf) return null;

    return (
        <ButtonGroup>
            {canUpdate && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label="Actions du membre"
                            disabled={isPending}
                        >
                            {t("menu_change_role")}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {roleOptions.map(([role, label]) => (
                            <DropdownMenuItem
                                key={role}
                                onSelect={event => {
                                    event.preventDefault();
                                    handleRoleChange(role);
                                }}
                                disabled={isPending}
                            >
                                <span className="text-sm">{label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {canDelete && (
                <Button
                    variant="destructive"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={handleRemoveMember}
                >
                    <Trash2 />
                </Button>
            )}
        </ButtonGroup>
    );
}
