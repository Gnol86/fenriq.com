import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { organizationRoleLabels } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { getInvitationDisplayStatus } from "@/lib/invitation-utils";
import InvitationsActionMenu from "./invitations-action-menu";

/**
 * Composant ligne de tableau pour afficher une invitation
 * Encapsule toute la logique d'affichage d'une invitation dans le tableau
 * @param {Object} props
 * @param {Object} props.invitation - L'objet invitation à afficher
 * @param {string} props.organizationId - ID de l'organisation
 * @param {boolean} props.canCreate - Permission de créer/renvoyer des invitations
 * @param {boolean} props.canCancel - Permission d'annuler des invitations
 */
export default function InvitationTableRow({
    invitation,
    organizationId,
    canCreate,
    canCancel,
    locale,
}) {
    const statusLabel = getInvitationDisplayStatus(invitation);
    const invitationRole = invitation.role ?? "member";
    const showActions = canCreate || canCancel;

    return (
        <TableRow>
            {/* Email de l'invité */}
            <TableCell>
                <span className="text-sm text-foreground">
                    {invitation.email}
                </span>
            </TableCell>

            {/* Rôle assigné */}
            <TableCell>
                <span className="text-sm font-medium text-foreground">
                    {organizationRoleLabels[invitationRole] ?? invitationRole}
                </span>
            </TableCell>

            {/* Statut avec badge */}
            <TableCell>
                <StatusBadge status={statusLabel} variant="invitation" />
            </TableCell>

            {/* Date d'expiration */}
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {invitation.expiresAt
                        ? formatDate(invitation.expiresAt, locale)
                        : "-"}
                </span>
            </TableCell>

            {/* Actions (si permissions) */}
            {showActions && (
                <TableCell className="text-right">
                    <InvitationsActionMenu
                        invitation={invitation}
                        organizationId={organizationId}
                        canCreate={canCreate}
                        canCancel={canCancel}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}
