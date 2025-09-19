"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InviteMemberDialog from "./components/invite-member-dialog";
import MembersTable from "./components/members-table";
import InvitationsTable from "./components/invitations-table";
import RemoveMemberDialog from "./components/remove-member-dialog";
import { inviteMemberAction } from "@/actions/organization.action";

const inviteSchema = z.object({
    email: z
        .string({ required_error: "L'adresse email est requise" })
        .trim()
        .min(1, "L'adresse email est requise")
        .email("Adresse email invalide"),
});

export default function MembersManager() {
    const {
        data: activeOrganization,
        isPending,
        refetch,
    } = authClient.useActiveOrganization();
    const { data: session } = useSession();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [removalTarget, setRemovalTarget] = useState(null);
    const [isUpdatingMemberId, setIsUpdatingMemberId] = useState(null);
    const [isRemovingMemberId, setIsRemovingMemberId] = useState(null);
    const [resendingInvitationId, setResendingInvitationId] = useState(null);
    const [cancelingInvitationId, setCancelingInvitationId] = useState(null);

    const inviteForm = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: "",
        },
    });

    const members = useMemo(
        () => activeOrganization?.members ?? [],
        [activeOrganization?.members]
    );
    const invitations = useMemo(() => {
        if (!activeOrganization?.invitations?.length) {
            return [];
        }

        const statusOrder = {
            pending: 0,
            accepted: 1,
            rejected: 2,
            canceled: 3,
        };

        return [...activeOrganization.invitations].sort((a, b) => {
            const orderA = statusOrder[a.status] ?? Number.MAX_SAFE_INTEGER;
            const orderB = statusOrder[b.status] ?? Number.MAX_SAFE_INTEGER;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return 0;
        });
    }, [activeOrganization?.invitations]);
    const currentUserId = session?.user?.id;

    const handleInvite = useCallback(
        async values => {
            if (!activeOrganization?.id) {
                toast.error(
                    "Aucune organisation active. Sélectionnez une organisation avant d'inviter."
                );
                return;
            }
            try {
                const response = await inviteMemberAction({
                    email: values.email,
                    role: "member",
                    organizationId: activeOrganization.id,
                });

                if (!response?.success) {
                    throw new Error(response?.error);
                }

                toast.success("Invitation envoyée avec succès");
                inviteForm.reset({ email: "" });
                setInviteOpen(false);
                refetch();
            } catch (error) {
                console.error("Failed to invite member", error);
                toast.error(
                    error?.message ||
                        "Impossible d'envoyer l'invitation pour le moment"
                );
            }
        },
        [activeOrganization?.id, inviteForm, refetch]
    );

    const handleResendInvitation = useCallback(
        async invitation => {
            if (!invitation?.email || !activeOrganization?.id) {
                toast.error("Impossible de renvoyer cette invitation");
                return;
            }
            setResendingInvitationId(invitation.id);
            try {
                const response = await inviteMemberAction({
                    email: invitation.email,
                    role: invitation.role ?? "member",
                    organizationId: activeOrganization.id,
                    resend: true,
                });

                if (!response?.success) {
                    throw new Error(response?.error);
                }

                toast.success("Invitation renvoyée");
                refetch();
            } catch (error) {
                console.error("Failed to resend invitation", error);
                toast.error(
                    error?.message ||
                        "Impossible de renvoyer cette invitation pour le moment"
                );
            } finally {
                setResendingInvitationId(null);
            }
        },
        [activeOrganization?.id, refetch]
    );

    const handleCancelInvitation = useCallback(
        async invitation => {
            if (!invitation?.id) {
                toast.error("Invitation introuvable");
                return;
            }
            setCancelingInvitationId(invitation.id);
            try {
                const result = await authClient.organization.cancelInvitation({
                    invitationId: invitation.id,
                });

                if (result?.error) {
                    throw new Error(result.error?.message);
                }

                toast.success("Invitation annulée");
                refetch();
            } catch (error) {
                console.error("Failed to cancel invitation", error);
                toast.error(
                    error?.message ||
                        "Impossible d'annuler cette invitation pour le moment"
                );
            } finally {
                setCancelingInvitationId(null);
            }
        },
        [refetch]
    );

    const handleCopyInvitationLink = useCallback(invitation => {
        if (!invitation?.id) {
            toast.error("Invitation introuvable");
            return;
        }

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
            toast.success("Lien d'invitation copié");
        } catch (error) {
            console.error("Failed to copy invitation link", error);
            toast.error("Impossible de copier le lien d'invitation");
        }
    }, []);

    const handleRoleChange = useCallback(
        async (memberId, role, currentRole) => {
            if (role === currentRole) {
                return;
            }
            if (!activeOrganization?.id) {
                toast.error(
                    "Aucune organisation active. Impossible de modifier le rôle."
                );
                return;
            }
            setIsUpdatingMemberId(memberId);
            try {
                const result = await authClient.organization.updateMemberRole({
                    memberId,
                    role,
                    organizationId: activeOrganization.id,
                });

                if (result.error) {
                    throw result.error;
                }

                toast.success("Rôle mis à jour");
                refetch();
            } catch (error) {
                console.error("Failed to update member role", error);
                toast.error(
                    error?.message ||
                        "Impossible de mettre à jour le rôle pour le moment"
                );
            } finally {
                setIsUpdatingMemberId(null);
            }
        },
        [activeOrganization?.id, refetch]
    );

    const confirmRemoval = useCallback(async () => {
        if (!removalTarget || !activeOrganization?.id) {
            setRemovalTarget(null);
            return;
        }

        setIsRemovingMemberId(removalTarget.id);
        try {
            const result = await authClient.organization.removeMember({
                memberIdOrEmail: removalTarget.id,
                organizationId: activeOrganization.id,
            });

            if (result?.error) {
                throw result.error;
            }

            toast.success("Membre supprimé de l'organisation");
            refetch();
        } catch (error) {
            console.error("Failed to remove member", error);
            toast.error(
                error?.message ||
                    "Impossible de supprimer ce membre pour le moment"
            );
        } finally {
            setIsRemovingMemberId(null);
            setRemovalTarget(null);
        }
    }, [activeOrganization?.id, refetch, removalTarget]);

    const closeRemovalDialog = useCallback(() => {
        if (isRemovingMemberId) {
            return;
        }
        setRemovalTarget(null);
    }, [isRemovingMemberId]);

    if (isPending) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement des membres de l&apos;organisation...
            </div>
        );
    }

    if (!activeOrganization) {
        return (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Aucune organisation active n&apos;a été trouvée.</p>
                <p>Sélectionnez une organisation pour gérer ses membres.</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                        <span className="text-base font-semibold text-foreground">
                            {members.length} membre
                            {members.length > 1 ? "s" : ""}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {invitations.length} invitation
                            {invitations.length > 1 ? "s" : ""} en cours
                        </span>
                    </div>
                    <InviteMemberDialog
                        form={inviteForm}
                        open={inviteOpen}
                        onOpenChange={setInviteOpen}
                        onInvite={handleInvite}
                        organizationName={activeOrganization.name}
                    />
                </div>

                <Tabs defaultValue="members" className="flex flex-col gap-4">
                    <TabsList>
                        <TabsTrigger value="members">
                            Membres actifs
                        </TabsTrigger>
                        <TabsTrigger value="invitations">
                            Invitations
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="members"
                        className="flex flex-col gap-4"
                    >
                        <MembersTable
                            members={members}
                            onRoleChange={handleRoleChange}
                            onRemove={member => setRemovalTarget(member)}
                            isUpdatingMemberId={isUpdatingMemberId}
                            currentUserId={currentUserId}
                        />
                    </TabsContent>
                    <TabsContent
                        value="invitations"
                        className="flex flex-col gap-4"
                    >
                        <InvitationsTable
                            invitations={invitations}
                            onCopyLink={handleCopyInvitationLink}
                            onResend={handleResendInvitation}
                            onCancel={handleCancelInvitation}
                            resendingInvitationId={resendingInvitationId}
                            cancelingInvitationId={cancelingInvitationId}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <RemoveMemberDialog
                open={Boolean(removalTarget)}
                member={removalTarget}
                isRemoving={Boolean(isRemovingMemberId)}
                onConfirm={confirmRemoval}
                onCancel={closeRemovalDialog}
            />
        </>
    );
}
