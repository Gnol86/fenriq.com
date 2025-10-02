"use client";

import { useTranslations } from "next-intl";

/**
 * Composant pour afficher les statistiques des membres en mode admin
 * Affiche le nombre de membres actifs avec pluriel approprié
 * @param {Object} props
 * @param {Array} props.members - Tableau des membres de l'organisation
 */
export default function AdminMemberStats({ members }) {
    const totalCount = members.length;
    const adminCount = members.filter(
        member => member.role.includes("admin") || member.role.includes("owner")
    ).length;
    const standardCount = totalCount - adminCount;
    const t = useTranslations("admin.org_members");

    if (totalCount === 0) {
        return null;
    }

    return (
        <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
            {t("stats_summary", {
                count: totalCount,
                adminCount,
                memberCount: standardCount,
            })}
        </span>
    );
}
