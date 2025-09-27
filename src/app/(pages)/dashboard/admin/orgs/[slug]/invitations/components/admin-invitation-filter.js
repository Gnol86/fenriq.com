"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import AdminInvitationTableRow from "./admin-invitation-table-row";

export default function AdminInvitationFilter({
    invitations,
    organizationId,
    organizationSlug,
}) {
    const [showAll, setShowAll] = useState(false);

    // Filtrer les invitations selon l'état du toggle
    const filteredInvitations = showAll
        ? invitations
        : invitations.filter(invitation => invitation.status === "pending");

    const pendingCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;
    const totalCount = invitations.length;

    return (
        <div className="flex flex-col gap-4">
            {/* Bouton de toggle */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {showAll
                        ? `Affichage de toutes les invitations (${totalCount}) - Admin`
                        : `Affichage des invitations en attente (${pendingCount}) - Admin`}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? "Voir les invitations en attente"
                        : "Voir toutes les invitations"}
                </Button>
            </div>

            {/* Table des invitations */}
            <Table>
                {!filteredInvitations.length && (
                    <TableCaption>
                        {showAll
                            ? "Aucune invitation dans cette organisation."
                            : "Aucune invitation en attente dans cette organisation."}
                    </TableCaption>
                )}
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Invité par</TableHead>
                        <TableHead>Expire le</TableHead>
                        <TableHead className="text-right">Actions Admin</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvitations.map(invitation => (
                        <AdminInvitationTableRow
                            key={invitation.id}
                            invitation={invitation}
                            organizationId={organizationId}
                            organizationSlug={organizationSlug}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}