"use client";

import { useTranslations } from "next-intl";

/**
 * Composant pour afficher les statistiques des membres
 * Affiche le nombre de membres actifs avec pluriel approprié
 * @param {Object} props
 * @param {Array} props.members - Tableau des membres de l'organisation
 */
export default function MemberStats({ members }) {
    const memberCount = members.length;
    const t = useTranslations("organization.members");

    if (memberCount === 0) {
        return null;
    }

    return (
        <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
            {t("stats_label", { count: memberCount })}
        </span>
    );
}
