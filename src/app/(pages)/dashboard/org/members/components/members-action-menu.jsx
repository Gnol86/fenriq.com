"use client";

import {
    removeMemberAction,
    updateMemberRoleAction,
} from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import RemoveMemberDialog from "./remove-member-dialog";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

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
    const [removalTarget, setRemovalTarget] = useState(false);
    const [isRemovingMember, setIsRemovingMember] = useState(false);

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
        [member?.id, memberRole, organizationId, execute]
    );

    const confirmRemoval = useCallback(async () => {
        if (!organizationId || !member?.id) {
            return;
        }

        setIsRemovingMember(true);
        await execute(
            () =>
                removeMemberAction({
                    memberIdOrEmail: member.id,
                    organizationId,
                }),
            {
                successMessage: t("success_member_removed"),
                errorMessage: t("error_member_remove"),
            }
        );
        setIsRemovingMember(false);
        setRemovalTarget(false);
    }, [member?.id, organizationId, execute]);

    const closeRemovalDialog = useCallback(() => {
        if (!isRemovingMember) {
            setRemovalTarget(false);
        }
    }, [isRemovingMember]);

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
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                        setRemovalTarget(true);
                    }}
                >
                    {t("menu_remove")}
                </Button>
            )}

            <RemoveMemberDialog
                open={removalTarget}
                member={member}
                isRemoving={isRemovingMember}
                onConfirm={confirmRemoval}
                onCancel={closeRemovalDialog}
            />
        </ButtonGroup>
    );
}
