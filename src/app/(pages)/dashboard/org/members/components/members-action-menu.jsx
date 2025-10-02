"use client";

import { useCallback, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RemoveMemberDialog from "./remove-member-dialog";
import { getRoleLabel } from "@/lib/constants";
import { useServerAction } from "@/hooks/use-server-action";
import {
    updateMemberRoleAction,
    removeMemberAction,
} from "@/actions/organization.action";
import { useTranslations } from "next-intl";

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
            ["owner", getRoleLabel("owner", tRoles)],
            ["admin", getRoleLabel("admin", tRoles)],
            ["member", getRoleLabel("member", tRoles)],
        ],
        [tRoles]
    );
    const roleChangeDisabled = isSelf || isPending;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Actions du membre"
                        disabled={isSelf}
                    >
                        <MoreHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canUpdate && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                {t("menu_change_role")}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {roleOptions.map(([role, label]) => (
                                    <DropdownMenuItem
                                        key={role}
                                        onSelect={event => {
                                            event.preventDefault();
                                            handleRoleChange(role);
                                        }}
                                        disabled={
                                            roleChangeDisabled ||
                                            memberRole === role
                                        }
                                    >
                                        <span className="text-sm">{label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}
                    {canDelete && (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={event => {
                                event.preventDefault();
                                setRemovalTarget(true);
                            }}
                            disabled={memberRole === "owner" || isSelf}
                        >
                            {t("menu_remove")}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <RemoveMemberDialog
                open={removalTarget}
                member={member}
                isRemoving={isRemovingMember}
                onConfirm={confirmRemoval}
                onCancel={closeRemovalDialog}
            />
        </>
    );
}
