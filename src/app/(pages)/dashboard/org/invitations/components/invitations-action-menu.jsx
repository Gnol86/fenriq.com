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
import { useTranslations } from "next-intl";

export default function InvitationsActionMenu({
    invitation,
    organizationId,
    canCreate,
    canCancel,
}) {
    const t = useTranslations("organization.invitations");
    const router = useRouter();
    const [resendingId, setResendingId] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);

    const isResending = resendingId === invitation.id;
    const isCanceling = cancelingId === invitation.id;

    const copyLink = useCallback(
        invitationId => {
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
                toast.success(t("success_link_copied"));
            } catch (error) {
                console.error("Failed to copy invitation link", error);
                toast.error(t("error_copy_link"));
            }
        },
        [t]
    );

    const resendInvitation = useCallback(() => {
        if (!invitation?.email || !organizationId) {
            toast.error(t("error_resend_generic"));
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

                toast.success(t("success_resent"));
                router.refresh();
            } catch (error) {
                console.error("Failed to resend invitation", error);
                toast.error(error?.message || t("error_resend"));
            } finally {
                setResendingId(null);
            }
        })();
    }, [invitation, organizationId, router, t]);

    const cancelInvitation = useCallback(() => {
        if (!invitation?.id || !organizationId) {
            toast.error(t("error_not_found"));
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

                toast.success(t("success_cancelled"));
                router.refresh();
            } catch (error) {
                console.error("Failed to cancel invitation", error);
                toast.error(error?.message || t("error_cancel"));
            } finally {
                setCancelingId(null);
            }
        })();
    }, [invitation, organizationId, router, t]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("actions_label")}
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
                            {t("menu_copy_link")}
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
                            {t("menu_resend")}
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
                        {t("menu_cancel")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
