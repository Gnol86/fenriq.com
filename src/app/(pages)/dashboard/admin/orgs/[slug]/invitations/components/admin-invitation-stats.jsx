/**
 * Composant pour afficher les statistiques d'invitations (version admin)
 * Affiche le nombre d'invitations par statut avec plus de détails
 * @param {Object} props
 * @param {Array} props.invitations - Tableau des invitations
 */
export default function AdminInvitationStats({ invitations }) {
    const pendingInvitationsCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;
    const acceptedInvitationsCount = invitations.filter(
        invitation => invitation.status === "accepted"
    ).length;
    const expiredInvitationsCount = invitations.filter(
        invitation => invitation.status === "expired"
    ).length;
    const totalInvitationsCount = invitations.length;

    if (totalInvitationsCount === 0) {
        return (
            <span className="block mt-1 text-muted-foreground">
                Aucune invitation envoyée
            </span>
        );
    }

    return (
        <div className="mt-2 space-y-1">
            {/* Invitations en attente */}
            {pendingInvitationsCount > 0 && (
                <span className="block text-amber-600 dark:text-amber-400">
                    {pendingInvitationsCount} invitation
                    {pendingInvitationsCount > 1 ? "s" : ""} en attente
                </span>
            )}

            {/* Invitations acceptées */}
            {acceptedInvitationsCount > 0 && (
                <span className="block text-green-600 dark:text-green-400">
                    {acceptedInvitationsCount} invitation
                    {acceptedInvitationsCount > 1 ? "s" : ""} acceptée
                    {acceptedInvitationsCount > 1 ? "s" : ""}
                </span>
            )}

            {/* Invitations expirées */}
            {expiredInvitationsCount > 0 && (
                <span className="block text-red-600 dark:text-red-400">
                    {expiredInvitationsCount} invitation
                    {expiredInvitationsCount > 1 ? "s" : ""} expirée
                    {expiredInvitationsCount > 1 ? "s" : ""}
                </span>
            )}

            {/* Total */}
            <span className="block text-muted-foreground text-sm">
                Total : {totalInvitationsCount} invitation
                {totalInvitationsCount > 1 ? "s" : ""} (Admin)
            </span>
        </div>
    );
}
