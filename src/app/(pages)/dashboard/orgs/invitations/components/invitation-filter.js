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
import InvitationTableRow from "./invitation-table-row";

export default function InvitationFilter({
    invitations,
    canCreate,
    canCancel,
    organizationId,
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
                        ? `Affichage de toutes les invitations (${totalCount})`
                        : `Affichage des invitations en attente (${pendingCount})`}
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
                            ? "Aucune invitation."
                            : "Aucune invitation en attente."}
                    </TableCaption>
                )}
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Expire le</TableHead>
                        {(canCreate || canCancel) && (
                            <TableHead className="text-right">Action</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvitations.map(invitation => (
                        <InvitationTableRow
                            key={invitation.id}
                            invitation={invitation}
                            organizationId={organizationId}
                            canCreate={canCreate}
                            canCancel={canCancel}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
