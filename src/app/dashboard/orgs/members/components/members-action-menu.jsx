"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { defaultRoleLabels } from "./constants";

export default function MembersActionMenu({
    member,
    organizationId,
    memberRole,
    currentUserId,
}) {
    const router = useRouter();
    const [removalTarget, setRemovalTarget] = useState(false);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [isUpdatingMemberId, setIsUpdatingMemberId] = useState(null);

    const isSelf = useMemo(() => {
        const memberUserId = member?.user?.id ?? member?.userId;
        return Boolean(currentUserId && memberUserId === currentUserId);
    }, [currentUserId, member]);

    const handleRoleChange = useCallback(
        async role => {
            if (!organizationId || !member?.id || role === memberRole) {
                return;
            }

            setIsUpdatingMemberId(member.id);
            try {
                // const result = await updateMemberRoleAction({
                //     memberId: member.id,
                //     role,
                //     organizationId,
                // });

                // if (!result?.success) {
                //     throw new Error(result?.error);
                // }

                toast.success("Rôle mis à jour");
                router.refresh();
            } catch (error) {
                console.error("Failed to update member role", error);
                toast.error(
                    error?.message ||
                        "Impossible de mettre à jour le rôle pour le moment"
                );
            } finally {
                setIsUpdatingMemberId(null);
            }
        },
        [member?.id, memberRole, organizationId, router]
    );

    const confirmRemoval = useCallback(() => {
        if (!organizationId || !member?.id) {
            return;
        }

        setIsRemovingMember(true);
        (async () => {
            try {
                // const result = await removeMemberAction({
                //     memberIdOrEmail: member.id,
                //     organizationId,
                // });

                // if (!result?.success) {
                //     throw new Error(result?.error);
                // }

                toast.success("Membre supprimé de l'organisation");
                router.refresh();
            } catch (error) {
                console.error("Failed to remove member", error);
                toast.error(
                    error?.message ||
                        "Impossible de supprimer ce membre pour le moment"
                );
            } finally {
                setIsRemovingMember(false);
                setRemovalTarget(false);
            }
        })();
    }, [member?.id, organizationId, router]);

    const closeRemovalDialog = useCallback(() => {
        if (!isRemovingMember) {
            setRemovalTarget(false);
        }
    }, [isRemovingMember]);

    const roleOptions = useMemo(() => Object.entries(defaultRoleLabels), []);
    const roleChangeDisabled = isSelf || isUpdatingMemberId === member?.id;

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
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            Modifier le rôle
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={event => {
                            event.preventDefault();
                            setRemovalTarget(true);
                        }}
                        disabled={memberRole === "owner" || isSelf}
                    >
                        Supprimer
                    </DropdownMenuItem>
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
