/**
 * Détermine le statut d'une invitation pour l'affichage utilisateur
 * Gère automatiquement les invitations expirées
 * @param {Object} invitation - L'objet invitation
 * @returns {string} Le statut technique (accepted, pending, outdated, ...)
 */
export function getInvitationDisplayStatus(invitation) {
    if (!invitation) {
        return "unknown";
    }

    // Vérifier si l'invitation est expirée
    if (
        invitation.status === "pending" &&
        invitation.expiresAt &&
        new Date(invitation.expiresAt).getTime() < Date.now()
    ) {
        return "outdated";
    }

    return invitation.status ?? "unknown";
}

/**
 * Retourne les classes CSS pour le badge de statut d'invitation
 * Supporte les thèmes clair et sombre
 * @param {string} statusKey - Le statut technique (accepted, pending, ...)
 * @returns {string} Les classes CSS pour le badge
 */
export function getInvitationStatusBadgeClasses(statusKey) {
    switch (statusKey) {
        case "accepted":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
        case "pending":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
        case "outdated":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200";
        case "canceled":
        case "rejected":
            return "bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200";
        default:
            return "bg-muted text-muted-foreground";
    }
}

/**
 * Trie les invitations par ordre de priorité du statut
 * Ordre : En attente > Acceptée > Refusée > Annulée
 * @param {Array} invitations - Tableau des invitations à trier
 * @returns {Array} Nouveau tableau trié (ne modifie pas l'original)
 */
export function sortInvitationsByStatus(invitations) {
    // Ordre de priorité des statuts
    const statusOrder = {
        pending: 0,
        accepted: 1,
        rejected: 2,
        canceled: 3,
    };

    return [...invitations].sort((a, b) => {
        const orderA = statusOrder[a.status] ?? Number.MAX_SAFE_INTEGER;
        const orderB = statusOrder[b.status] ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        return 0;
    });
}
