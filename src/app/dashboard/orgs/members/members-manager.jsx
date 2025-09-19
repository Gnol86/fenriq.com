"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import InviteMemberDialog from "./components/invite-member-dialog";
import MembersTable from "./components/members-table";
import InvitationsTable from "./components/invitations-table";
import RemoveMemberDialog from "./components/remove-member-dialog";

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
    const { data: session } = authClient.useSession();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [removalTarget, setRemovalTarget] = useState(null);
    const [isUpdatingMemberId, setIsUpdatingMemberId] = useState(null);
    const [isRemovingMemberId, setIsRemovingMemberId] = useState(null);

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
    const invitations = useMemo(
        () => activeOrganization?.invitations ?? [],
        [activeOrganization?.invitations]
    );
    const currentUserId = session?.user?.id;

    const handleInvite = useCallback(
        async (values) => {
            if (!activeOrganization?.id) {
                toast.error(
                    "Aucune organisation active. Sélectionnez une organisation avant d'inviter."
                );
                return;
            }
            try {
                const result = await authClient.organization.createInvitation({
                    email: values.email,
                    role: "member",
                    organizationId: activeOrganization.id,
                });

                if (result.error) {
                    throw result.error;
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
                            {members.length} membre{members.length > 1 ? "s" : ""}
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
                        <TabsTrigger value="members">Membres actifs</TabsTrigger>
                        <TabsTrigger value="invitations">
                            Invitations
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="members" className="flex flex-col gap-4">
                        <MembersTable
                            members={members}
                            onRoleChange={handleRoleChange}
                            onRemove={(member) => setRemovalTarget(member)}
                            isUpdatingMemberId={isUpdatingMemberId}
                            currentUserId={currentUserId}
                        />
                    </TabsContent>
                    <TabsContent value="invitations" className="flex flex-col gap-4">
                        <InvitationsTable invitations={invitations} />
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
