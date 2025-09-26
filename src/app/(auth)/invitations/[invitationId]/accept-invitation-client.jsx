"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import FormButton from "@/components/ui/form-button";

export default function AcceptInvitationClient({ invitationId }) {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [status, setStatus] = useState(null);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const result = await authClient.organization.acceptInvitation({
                invitationId,
            });

            if (result?.error) {
                throw new Error(
                    result.error.message || "Échec de l'acceptation"
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
                    ? "Invitation acceptée. Bienvenue !"
                    : "Invitation acceptée. Activez l'organisation depuis le menu si nécessaire."
            );
            router.push("/app");
            router.refresh();
        } catch (error) {
            console.error("Failed to accept invitation", error);
            toast.error(
                error?.message ||
                    "Impossible d'accepter l'invitation pour le moment"
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
                throw new Error(result.error.message || "Échec du refus");
            }

            setStatus("rejected");
            toast.success("Invitation refusée.");
            router.push("/app");
        } catch (error) {
            console.error("Failed to reject invitation", error);
            toast.error(
                error?.message ||
                    "Impossible de refuser l'invitation pour le moment"
            );
        } finally {
            setIsRejecting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Vérification de votre session...
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>Vous devez être connecté pour accepter cette invitation.</p>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link
                            href={`/signin?redirect=/invitations/${invitationId}`}
                        >
                            Se connecter
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link
                            href={`/signup?redirect=/invitations/${invitationId}`}
                        >
                            Créer un compte
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
                    <span>Invitation acceptée. Redirection en cours...</span>
                </div>
            </div>
        );
    }

    if (status === "rejected") {
        return (
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-destructive">
                    <ShieldOff className="h-4 w-4" aria-hidden="true" />
                    <span>Invitation refusée. Redirection en cours...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                Vous êtes sur le point de rejoindre l&apos;organisation.
                Confirmez votre choix.
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
                    Accepter l&apos;invitation
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
                    Refuser
                </FormButton>
            </div>
        </div>
    );
}
