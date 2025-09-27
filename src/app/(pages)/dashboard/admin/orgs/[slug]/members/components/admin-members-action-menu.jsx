"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, UserCog, Eye, HatGlasses } from "lucide-react";
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
import AdminRemoveMemberDialog from "./admin-remove-member-dialog";
import { defaultRoleLabels } from "@/lib/constants";
import { useServerAction } from "@/hooks/use-server-action";
import { updateMemberRoleAsAdminAction } from "@/actions/admin.action";
import { impersonateUserAction } from "@/actions/admin.action";

export default function AdminMembersActionMenu({
    member,
    organizationId,
    organizationSlug,
    memberRole,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();
    const [removalTarget, setRemovalTarget] = useState(false);

    const handleRoleChange = useCallback(
        async role => {
            if (!organizationId || !member?.id || role === memberRole) {
                return;
            }

            await execute(
                () =>
                    updateMemberRoleAsAdminAction({
                        memberId: member.id,
                        role,
                        organizationId,
                    }),
                {
                    successMessage: "Rôle mis à jour avec succès (Admin)",
                    onSuccess: () => {
                        router.refresh();
                    },
                }
            );
        },
        [member?.id, memberRole, organizationId, router, execute]
    );

    const handleImpersonateUser = useCallback(
        async () => {
            if (!member?.user?.id) {
                return;
            }

            await execute(
                () =>
                    impersonateUserAction({
                        userId: member.user.id,
                    }),
                {
                    successMessage: `Usurpation de ${member.user.name || member.user.email} démarrée`,
                    onSuccess: () => {
                        router.push("/dashboard");
                        router.refresh();
                    },
                }
            );
        },
        [member?.user?.id, router, execute]
    );

    const roleOptions = useMemo(() => Object.entries(defaultRoleLabels), []);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Actions admin du membre"
                        disabled={isPending}
                    >
                        <MoreHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Voir les détails */}
                    <DropdownMenuItem
                        onSelect={event => {
                            event.preventDefault();
                            router.push(`/dashboard/admin/users/${member.user.id}`);
                        }}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                    </DropdownMenuItem>

                    {/* Usurper l'utilisateur */}
                    <DropdownMenuItem
                        onSelect={event => {
                            event.preventDefault();
                            handleImpersonateUser();
                        }}
                        disabled={isPending}
                    >
                        <HatGlasses className="mr-2 h-4 w-4" />
                        Usurper l&apos;utilisateur
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Modifier le rôle */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" />
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
                                        isPending ||
                                        memberRole === role
                                    }
                                >
                                    <span className="text-sm">{label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    {/* Supprimer (sauf owner) */}
                    {memberRole !== "owner" && (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={event => {
                                event.preventDefault();
                                setRemovalTarget(true);
                            }}
                            disabled={isPending}
                        >
                            Supprimer de l&apos;organisation
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AdminRemoveMemberDialog
                open={removalTarget}
                onOpenChange={setRemovalTarget}
                member={member}
                organizationId={organizationId}
                organizationSlug={organizationSlug}
            />
        </>
    );
}