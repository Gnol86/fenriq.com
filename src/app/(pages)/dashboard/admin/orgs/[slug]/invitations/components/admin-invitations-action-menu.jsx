"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Copy, RotateCcw, X, Eye } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import {
    cancelInvitationAsAdminAction,
    resendInvitationAsAdminAction,
} from "@/actions/admin.action";
import { useTranslations } from "next-intl";

export default function AdminInvitationsActionMenu({
    invitation,
    organizationId,
    organizationSlug,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();
    const tInvitations = useTranslations("organization.invitations");
    const tAdminInvitations = useTranslations("admin.org_invitations");
    const tMembers = useTranslations("admin.org_members");

    const copyLink = useCallback(() => {
        try {
            const origin =
                typeof window !== "undefined" && window.location?.origin
                    ? window.location.origin
                    : "";
            const link = `${origin}/invitations/${invitation.id}`;
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(link);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = link;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            toast.success(tInvitations("success_link_copied"));
        } catch (error) {
            console.error("Failed to copy invitation link", error);
            toast.error(tInvitations("error_copy_link"));
        }
    }, [invitation.id, tInvitations]);

    const resendInvitation = useCallback(async () => {
        if (!invitation?.email || !organizationId) {
            toast.error(tInvitations("error_resend"));
            return;
        }

        await execute(
            () =>
                resendInvitationAsAdminAction({
                    email: invitation.email,
                    role: invitation.role ?? "member",
                    organizationId,
                }),
            {
                successMessage: tInvitations("success_resent"),
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    }, [execute, invitation, organizationId, router, tInvitations]);

    const cancelInvitation = useCallback(async () => {
        if (!invitation?.id || !organizationId) {
            toast.error(tInvitations("error_not_found"));
            return;
        }

        await execute(
            () =>
                cancelInvitationAsAdminAction({
                    invitationId: invitation.id,
                    organizationId,
                }),
            {
                successMessage: tInvitations("success_cancelled"),
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    }, [execute, invitation, organizationId, router, tInvitations]);

    const viewInvitationDetails = useCallback(() => {
        toast.info(tAdminInvitations("toast_invitation_id", { id: invitation.id }));
    }, [invitation.id, tAdminInvitations]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={tAdminInvitations("action_menu_label")}
                    disabled={isPending}
                >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {/* Voir les détails */}
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        viewInvitationDetails();
                    }}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    {tMembers("view_details")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Copier le lien */}
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        copyLink();
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {tInvitations("menu_copy_link")}
                </DropdownMenuItem>

                {/* Renvoyer l'invitation */}
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        resendInvitation();
                    }}
                    disabled={isPending}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {tInvitations("menu_resend")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Annuler l'invitation */}
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={event => {
                        event.preventDefault();
                        cancelInvitation();
                    }}
                    disabled={isPending}
                >
                    <X className="mr-2 h-4 w-4" />
                    {tInvitations("menu_cancel")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
