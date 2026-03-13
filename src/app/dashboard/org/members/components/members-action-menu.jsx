"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { removeMemberAction, updateMemberRoleAction } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

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
    const memberUserId = member?.user?.id ?? member?.userId;
    const isSelf = Boolean(currentUserId && memberUserId === currentUserId);

    const handleRoleChange = async role => {
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
    };

    const handleRemoveMember = async () => {
        if (!organizationId || !member?.id) {
            return;
        }

        const memberName = member?.user?.name;

        dialogManager.confirm({
            title: t("remove_dialog_title"),
            description: memberName
                ? t("remove_dialog_description", { name: memberName })
                : t("remove_dialog_description_fallback"),
            action: {
                label: t("remove_dialog_confirm"),
                variant: "destructive",
                onClick: async () => {
                    await removeMemberAction({
                        memberIdOrEmail: member.id,
                        organizationId,
                    });
                },
                successMessage: t("success_member_removed"),
            },
        });
    };

    const roleOptions = [
        ["owner", tRoles("owner")],
        ["admin", tRoles("admin")],
        ["member", tRoles("member")],
    ];

    if (isSelf) return null;

    return (
        <ButtonGroup>
            {canUpdate && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Actions du membre"
                                disabled={isPending}
                            />
                        }
                    >
                        {t("menu_change_role")}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {roleOptions.map(([role, label]) => (
                            <DropdownMenuItem
                                key={role}
                                closeOnClick={false}
                                onClick={() => handleRoleChange(role)}
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
