"use client";

import { Ban, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { cancelInvitationAction, inviteMemberAction } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function InvitationsActionMenu({
    invitation,
    organizationId,
    canCreate,
    canCancel,
}) {
    const t = useTranslations("organization.invitations");
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
        dialogManager.confirm({
            title: t("remove_dialog_title"),
            description: invitation.email
                ? t("remove_dialog_description", {
                      email: invitation.email,
                  })
                : t("remove_dialog_description_fallback"),
            action: {
                label: t("remove_dialog_confirm"),
                variant: "destructive",
                onClick: async () => {
                    await cancelInvitationAction({
                        organizationId,
                        invitationId: invitation.id,
                    });
                },
                successMessage: t("success_cancelled"),
            },
        });
    }, [invitation, organizationId, t]);

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
