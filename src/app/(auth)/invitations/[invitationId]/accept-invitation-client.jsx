"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import FormButton from "@/components/ui/form-button";
import { useTranslations } from "next-intl";

export default function AcceptInvitationClient({ invitationId }) {
    const router = useRouter();
    const { data: session, isPending } = useSession();
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
                throw new Error(
                    result.error.message || t("error_accept")
                );
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
            toast.error(
                error?.message || t("error_cannot_accept")
            );
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
            toast.error(
                error?.message || t("error_cannot_reject")
            );
        } finally {
            setIsRejecting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t("verifying_session")}
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>{t("must_signin")}</p>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link
                            href={`/signin?redirect=/invitations/${invitationId}`}
                        >
                            {t("signin_button")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link
                            href={`/signup?redirect=/invitations/${invitationId}`}
                        >
                            {t("create_account_button")}
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (status === "accepted") {
        return (
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>{t("accepted_message")}</span>
                </div>
            </div>
        );
    }

    if (status === "rejected") {
        return (
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-destructive">
                    <ShieldOff className="h-4 w-4" aria-hidden="true" />
                    <span>{t("rejected_message")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                {t("confirm_message")}
            </p>
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
