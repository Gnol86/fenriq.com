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
import { useServerAction } from "@/hooks/use-server-action";
import { updateMemberRoleAsAdminAction } from "@/actions/admin.action";
import { impersonateUserAction } from "@/actions/admin.action";
import { useTranslations } from "next-intl";

export default function AdminMembersActionMenu({
    member,
    organizationId,
    organizationSlug,
    memberRole,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();
    const [removalTarget, setRemovalTarget] = useState(false);
    const tMembers = useTranslations("admin.org_members");
    const tDetails = useTranslations("admin.org_details");
    const tRoles = useTranslations("roles");
    const fallbackName =
        member.user?.name || member.user?.email || tDetails("fallback_user");

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
                    successMessage: tMembers("success_role_updated"),
                    onSuccess: () => {
                        router.refresh();
                    },
                }
            );
        },
        [member?.id, memberRole, organizationId, router, execute]
    );

    const handleImpersonateUser = useCallback(async () => {
        if (!member?.user?.id) {
            return;
        }

        await execute(
            () =>
                impersonateUserAction({
                    userId: member.user.id,
                }),
            {
                successMessage: tMembers("success_impersonate", {
                    name: fallbackName,
                }),
                onSuccess: () => {
                    router.push("/dashboard");
                    router.refresh();
                },
            }
        );
    }, [fallbackName, member?.user?.id, router, execute, tMembers]);

    const roleOptions = useMemo(
        () =>
            ["owner", "admin", "member"].map(role => ({
                role,
                label: tRoles(role),
            })),
        [tRoles]
    );

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={tMembers("action_menu_label")}
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
                            router.push(
                                `/dashboard/admin/users/${member.user.id}`
                            );
                        }}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {tMembers("view_details")}
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
                        {tMembers("impersonate")}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Modifier le rôle */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" />
                            {tMembers("change_role")}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {roleOptions.map(({ role, label }) => (
                                <DropdownMenuItem
                                    key={role}
                                    onSelect={event => {
                                        event.preventDefault();
                                        handleRoleChange(role);
                                    }}
                                    disabled={isPending || memberRole === role}
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
                            {tMembers("remove")}
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
