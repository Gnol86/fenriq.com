"use client";

import {
    cancelInvitationAction,
    inviteMemberAction,
} from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useConfirm } from "@/hooks/use-confirm";
import { useServerAction } from "@/hooks/use-server-action";
import { Ban, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

export default function InvitationsActionMenu({
    invitation,
    organizationId,
    canCreate,
    canCancel,
}) {
    const t = useTranslations("organization.invitations");
    const confirm = useConfirm();
    const { execute, isPending } = useServerAction();

    const resendInvitation = useCallback(async () => {
        await execute(
            () =>
                inviteMemberAction({
                    email: invitation.email,
                    role: invitation.role,
                    organizationId,
                }),
            {
                successMessage: t("success_resent"),
            }
        );
    }, [invitation, organizationId, t, execute]);

    const cancelInvitation = useCallback(async () => {
        await confirm(
            {
                title: t("remove_dialog_title"),
                description: invitation.email
                    ? t("remove_dialog_description", {
                          email: invitation.email,
                      })
                    : t("remove_dialog_description_fallback"),
                variant: "destructive",
            },
            () =>
                execute(
                    () =>
                        cancelInvitationAction({
                            organizationId,
                            invitationId: invitation.id,
                        }),
                    {
                        successMessage: t("success_cancelled"),
                    }
                )
        );
    }, [invitation, organizationId, t, confirm, execute]);

    if (invitation.status !== "pending") return null;

    return (
        <ButtonGroup>
            {canCreate && (
                <Button
                    disabled={isPending}
                    variant="outline"
                    size="sm"
                    onClick={() => resendInvitation()}
                >
                    <Mail />
                    {t("menu_resend")}
                </Button>
            )}
            {canCancel && (
                <Button
                    disabled={isPending}
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => cancelInvitation(invitation.id)}
                >
                    <Ban />
                </Button>
            )}
        </ButtonGroup>
    );
}
