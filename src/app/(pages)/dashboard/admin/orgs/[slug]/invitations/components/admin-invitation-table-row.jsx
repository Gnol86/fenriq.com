import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { getInvitationDisplayStatus } from "@/lib/invitation-utils";
import AdminInvitationsActionMenu from "./admin-invitations-action-menu";
import { useTranslations, useLocale } from "next-intl";

/**
 * Composant ligne de tableau pour afficher une invitation (version admin)
 * Encapsule toute la logique d'affichage d'une invitation dans le tableau admin
 * @param {Object} props
 * @param {Object} props.invitation - L'objet invitation à afficher
 * @param {string} props.organizationId - ID de l'organisation
 * @param {string} props.organizationSlug - Slug de l'organisation
 */
export default function AdminInvitationTableRow({
    invitation,
    organizationId,
    organizationSlug,
}) {
    const statusKey = getInvitationDisplayStatus(invitation);
    const invitationRole = invitation.role ?? "member";
    const tAdminInvitations = useTranslations("admin.org_invitations");
    const tRoles = useTranslations("roles");
    const tInvitationStatus = useTranslations("invitation_status");
    const roleLabel = tRoles(invitationRole);
    const normalizedStatusKey =
        statusKey === "unknown"
            ? invitation?.status ?? "pending"
            : statusKey;
    let statusLabel = normalizedStatusKey;
    try {
        statusLabel = tInvitationStatus(normalizedStatusKey);
    } catch (error) {
        statusLabel = normalizedStatusKey;
    }
    const locale = useLocale();

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
                    {roleLabel}
                </span>
            </TableCell>

            {/* Statut avec badge */}
            <TableCell>
                <StatusBadge status={normalizedStatusKey} variant="invitation">
                    {statusLabel}
                </StatusBadge>
            </TableCell>

            {/* Invité par (info admin supplémentaire) */}
            <TableCell>
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                        {invitation.invitedBy?.name ||
                            invitation.invitedBy?.email ||
                            tAdminInvitations("system_sender")}
                    </span>
                    {invitation.invitedBy?.id && (
                        <span className="text-xs text-blue-600">
                            ID: {invitation.invitedBy.id}
                        </span>
                    )}
                </div>
            </TableCell>

            {/* Date d'expiration */}
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {invitation.expiresAt
                        ? formatDate(invitation.expiresAt, locale)
                        : "-"}
                </span>
            </TableCell>

            {/* Actions Admin */}
            <TableCell className="text-right">
                <AdminInvitationsActionMenu
                    invitation={invitation}
                    organizationId={organizationId}
                    organizationSlug={organizationSlug}
                />
            </TableCell>
        </TableRow>
    );
}
