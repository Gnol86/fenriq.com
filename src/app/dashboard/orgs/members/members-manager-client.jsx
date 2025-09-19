"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InviteMemberDialog from "./components/invite-member-dialog";
import MembersTable from "./components/members-table";
import InvitationsTable from "./components/invitations-table";
import RemoveMemberDialog from "./components/remove-member-dialog";
import {
    inviteMemberAction,
    updateMemberRoleAction,
    removeMemberAction,
    cancelInvitationAction,
} from "@/actions/organization.action";

const inviteSchema = z.object({
    email: z
        .string({ required_error: "L'adresse email est requise" })
        .trim()
        .min(1, "L'adresse email est requise")
        .email("Adresse email invalide"),
});

export default function MembersManagerClient({
    organizationId,
    organizationName,
    members: membersProp,
    invitations: invitationsProp,
    currentUserId,
}) {
    const router = useRouter();
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
        () => membersProp ?? [],
        [membersProp]
    );

    const invitations = useMemo(() => {
        if (!Array.isArray(invitationsProp) || invitationsProp.length === 0) {
            return [];
        }

        const statusOrder = {
            pending: 0,
            accepted: 1,
            rejected: 2,
            canceled: 3,
        };

        return [...invitationsProp].sort((a, b) => {
            const orderA = statusOrder[a.status] ?? Number.MAX_SAFE_INTEGER;
            const orderB = statusOrder[b.status] ?? Number.MAX_SAFE_INTEGER;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return 0;
        });
    }, [invitationsProp]);

    const handleInvite = useCallback(
        async values => {
            if (!organizationId) {
                toast.error(
                    "Aucune organisation active. Sélectionnez une organisation avant d'inviter."
                );
                return;
            }
            try {
                const response = await inviteMemberAction({
                    email: values.email,
                    role: "member",
                    organizationId,
                });

                if (!response?.success) {
                    throw new Error(response?.error);
                }

                toast.success("Invitation envoyée avec succès");
                inviteForm.reset({ email: "" });
                setInviteOpen(false);
                router.refresh();
            } catch (error) {
                console.error("Failed to invite member", error);
                toast.error(
                    error?.message ||
                        "Impossible d'envoyer l'invitation pour le moment"
                );
            }
        },
        [organizationId, inviteForm, router]
    );

    const handleResendInvitation = useCallback(
        async invitation => {
            if (!invitation?.email || !organizationId) {
                toast.error("Impossible de renvoyer cette invitation");
                return;
            }
            setResendingInvitationId(invitation.id);
            try {
                const response = await inviteMemberAction({
                    email: invitation.email,
                    role: invitation.role ?? "member",
                    organizationId,
                    resend: true,
                });

                if (!response?.success) {
                    throw new Error(response?.error);
                }

                toast.success("Invitation renvoyée");
                router.refresh();
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
        [organizationId, router]
    );

    const handleCancelInvitation = useCallback(
        async invitation => {
            if (!invitation?.id || !organizationId) {
                toast.error("Invitation introuvable");
                return;
            }
            setCancelingInvitationId(invitation.id);
            try {
                const result = await cancelInvitationAction({
                    organizationId,
                    invitationId: invitation.id,
                });

                if (!result?.success) {
                    throw new Error(result?.error);
                }

                toast.success("Invitation annulée");
                router.refresh();
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
        [organizationId, router]
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
            if (!organizationId) {
                toast.error(
                    "Aucune organisation active. Impossible de modifier le rôle."
                );
                return;
            }
            setIsUpdatingMemberId(memberId);
            try {
                const result = await updateMemberRoleAction({
                    memberId,
                    role,
                    organizationId,
                });

                if (!result?.success) {
                    throw new Error(result?.error);
                }

                toast.success("Rôle mis à jour");
                router.refresh();
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
        [organizationId, router]
    );

    const confirmRemoval = useCallback(async () => {
        if (!removalTarget || !organizationId) {
            setRemovalTarget(null);
            return;
        }

        setIsRemovingMemberId(removalTarget.id);
        try {
            const result = await removeMemberAction({
                memberIdOrEmail: removalTarget.id,
                organizationId,
            });

            if (!result?.success) {
                throw new Error(result?.error);
            }

            toast.success("Membre supprimé de l'organisation");
            router.refresh();
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
    }, [organizationId, removalTarget, router]);

    const closeRemovalDialog = useCallback(() => {
        if (isRemovingMemberId) {
            return;
        }
        setRemovalTarget(null);
    }, [isRemovingMemberId]);

    if (!organizationId) {
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
                        organizationName={organizationName}
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
