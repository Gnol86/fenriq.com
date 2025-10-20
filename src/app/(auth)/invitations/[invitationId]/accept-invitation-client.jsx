"use client";

import FormButton from "@/components/ui/form-button";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AcceptInvitationClient({ invitationId }) {
    const router = useRouter();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [status, setStatus] = useState(null);
    const t = useTranslations("auth.invitation");

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const result = await authClient.organization.acceptInvitation({
                invitationId,
            });

            if (result?.error) {
                throw new Error(result.error.message || t("error_accept"));
            }

            const newOrganizationId = result?.data?.member?.organizationId;
            let organizationActivated = false;

            if (newOrganizationId) {
                try {
                    await authClient.organization.setActive({
                        organizationId: newOrganizationId,
                    });
                    organizationActivated = true;
                } catch (switchError) {
                    console.error(
                        "Failed to activate organization after invitation acceptance",
                        switchError
                    );
                }
            }

            setStatus("accepted");
            toast.success(
                organizationActivated
                    ? t("success_accepted")
                    : t("success_accepted_activate")
            );
            router.push("/app");
            router.refresh();
        } catch (error) {
            console.error("Failed to accept invitation", error);
            toast.error(error?.message || t("error_cannot_accept"));
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        try {
            const result = await authClient.organization.rejectInvitation({
                invitationId,
            });

            if (result?.error) {
                throw new Error(result.error.message || t("error_reject"));
            }

            setStatus("rejected");
            toast.success(t("success_rejected"));
            router.push("/app");
        } catch (error) {
            console.error("Failed to reject invitation", error);
            toast.error(error?.message || t("error_cannot_reject"));
        } finally {
            setIsRejecting(false);
        }
    };

    if (status === "accepted") {
        return (
            <div className="text-muted-foreground flex flex-col items-start gap-3 text-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>{t("accepted_message")}</span>
                </div>
            </div>
        );
    }

    if (status === "rejected") {
        return (
            <div className="text-muted-foreground flex flex-col items-start gap-3 text-sm">
                <div className="text-destructive flex items-center gap-2">
                    <ShieldOff className="h-4 w-4" aria-hidden="true" />
                    <span>{t("rejected_message")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
                <FormButton
                    onClick={handleAccept}
                    disabled={isRejecting}
                    loading={isAccepting}
                    className="sm:flex-1"
                >
                    {isAccepting && (
                        <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    )}
                    {t("accept_button")}
                </FormButton>
                <FormButton
                    onClick={handleReject}
                    variant="outline"
                    disabled={isAccepting}
                    loading={isRejecting}
                    className="sm:flex-1"
                >
                    {isRejecting && (
                        <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    )}
                    {t("reject_button")}
                </FormButton>
            </div>
        </div>
    );
}
