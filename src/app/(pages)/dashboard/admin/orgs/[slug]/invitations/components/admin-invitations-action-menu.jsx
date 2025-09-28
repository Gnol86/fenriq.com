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

function copyLink(invitationId) {
    try {
        const origin =
            typeof window !== "undefined" && window.location?.origin
                ? window.location.origin
                : "";
        const link = `${origin}/invitations/${invitationId}`;
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
        toast.success("Lien d'invitation copié (Admin)");
    } catch (error) {
        console.error("Failed to copy invitation link", error);
        toast.error("Impossible de copier le lien d'invitation");
    }
}

export default function AdminInvitationsActionMenu({
    invitation,
    organizationId,
    organizationSlug,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();

    const resendInvitation = useCallback(async () => {
        if (!invitation?.email || !organizationId) {
            toast.error("Impossible de renvoyer cette invitation");
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
                successMessage: "Invitation renvoyée avec succès (Admin)",
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    }, [invitation, organizationId, router, execute]);

    const cancelInvitation = useCallback(async () => {
        if (!invitation?.id || !organizationId) {
            toast.error("Invitation introuvable");
            return;
        }

        await execute(
            () =>
                cancelInvitationAsAdminAction({
                    invitationId: invitation.id,
                    organizationId,
                }),
            {
                successMessage: "Invitation annulée avec succès (Admin)",
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    }, [invitation, organizationId, router, execute]);

    const viewInvitationDetails = useCallback(() => {
        toast.info(`Invitation ID: ${invitation.id}`);
    }, [invitation.id]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Actions admin sur l'invitation"
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
                    Voir les détails
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Copier le lien */}
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        copyLink(invitation.id);
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copier le lien
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
                    Renvoyer l&apos;invitation
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
                    Annuler l&apos;invitation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
