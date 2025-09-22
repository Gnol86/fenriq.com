/**
 * Composant pour afficher les statistiques d'invitations
 * Affiche le nombre d'invitations en attente et le total
 * @param {Object} props
 * @param {Array} props.invitations - Tableau des invitations
 */
export default function InvitationStats({ invitations }) {
    const pendingInvitationsCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;
    const totalInvitationsCount = invitations.length;

    return (
        <>
            {/* Indicateur des invitations en attente */}
            {pendingInvitationsCount > 0 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                    {pendingInvitationsCount} invitation
                    {pendingInvitationsCount > 1 ? "s" : ""} en attente
                </span>
            )}

            {/* Total des invitations */}
            {totalInvitationsCount > 0 && (
                <span className="block mt-1 text-muted-foreground">
                    Total : {totalInvitationsCount} invitation
                    {totalInvitationsCount > 1 ? "s" : ""}
                </span>
            )}
        </>
    );
}
