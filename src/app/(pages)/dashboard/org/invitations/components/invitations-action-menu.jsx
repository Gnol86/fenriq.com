"use client";

import { useCallback, useMemo, useState } from "react";
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
import { Loader2, MoreHorizontal } from "lucide-react";

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
        toast.success("Lien d'invitation copié");
    } catch (error) {
        console.error("Failed to copy invitation link", error);
        toast.error("Impossible de copier le lien d'invitation");
    }
}

export default function InvitationsActionMenu({
    invitation,
    organizationId,
    canCreate,
    canCancel,
}) {
    const router = useRouter();
    const [resendingId, setResendingId] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);

    const isResending = resendingId === invitation.id;
    const isCanceling = cancelingId === invitation.id;

    const resendInvitation = useCallback(() => {
        if (!invitation?.email || !organizationId) {
            toast.error("Impossible de renvoyer cette invitation");
            return;
        }

        setResendingId(invitation.id);
        (async () => {
            try {
                // const response = await inviteMemberAction({
                //     email: invitation.email,
                //     role: invitation.role ?? "member",
                //     organizationId,
                //     resend: true,
                // });

                // if (!response?.success) {
                //     throw new Error(response?.error);
                // }

                toast.success("Invitation renvoyée");
                router.refresh();
            } catch (error) {
                console.error("Failed to resend invitation", error);
                toast.error(
                    error?.message ||
                        "Impossible de renvoyer cette invitation pour le moment"
                );
            } finally {
                setResendingId(null);
            }
        })();
    }, [invitation, organizationId, router]);

    const cancelInvitation = useCallback(() => {
        if (!invitation?.id || !organizationId) {
            toast.error("Invitation introuvable");
            return;
        }

        setCancelingId(invitation.id);
        (async () => {
            try {
                // const result = await cancelInvitationAction({
                //     organizationId,
                //     invitationId: invitation.id,
                // });

                // if (!result?.success) {
                //     throw new Error(result?.error);
                // }

                toast.success("Invitation annulée");
                router.refresh();
            } catch (error) {
                console.error("Failed to cancel invitation", error);
                toast.error(
                    error?.message ||
                        "Impossible d'annuler cette invitation pour le moment"
                );
            } finally {
                setCancelingId(null);
            }
        })();
    }, [invitation, organizationId, router]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Actions sur l'invitation"
                >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {canCreate && (
                    <>
                        <DropdownMenuItem
                            onSelect={event => {
                                event.preventDefault();
                                copyLink(invitation.id);
                            }}
                        >
                            Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={event => {
                                event.preventDefault();
                                resendInvitation();
                            }}
                            disabled={isResending || isCanceling}
                        >
                            {isResending && (
                                <Loader2
                                    className="mr-2 h-4 w-4 animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            Renvoyer
                        </DropdownMenuItem>
                    </>
                )}
                {canCancel && (
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={event => {
                            event.preventDefault();
                            cancelInvitation();
                        }}
                        disabled={isCanceling}
                    >
                        {isCanceling && (
                            <Loader2
                                className="mr-2 h-4 w-4 animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        Annuler
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
