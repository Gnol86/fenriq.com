"use client";

import { useTranslations } from "next-intl";

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
    const t = useTranslations("admin.org_invitations");

    if (totalInvitationsCount === 0) {
        return (
            <span className="block mt-1 text-muted-foreground">
                {t("empty_all")}
            </span>
        );
    }

    return (
        <div className="mt-2 space-y-1">
            {pendingInvitationsCount > 0 && (
                <span className="block text-amber-600 dark:text-amber-400">
                    {t("stats_pending", { count: pendingInvitationsCount })}
                </span>
            )}

            {acceptedInvitationsCount > 0 && (
                <span className="block text-green-600 dark:text-green-400">
                    {t("stats_accepted", { count: acceptedInvitationsCount })}
                </span>
            )}

            {expiredInvitationsCount > 0 && (
                <span className="block text-red-600 dark:text-red-400">
                    {t("stats_expired", { count: expiredInvitationsCount })}
                </span>
            )}

            <span className="block text-muted-foreground text-sm">
                {t("stats_total", { count: totalInvitationsCount })}
            </span>
        </div>
    );
}
