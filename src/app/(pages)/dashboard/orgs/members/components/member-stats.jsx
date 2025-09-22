/**
 * Composant pour afficher les statistiques des membres
 * Affiche le nombre de membres actifs avec pluriel approprié
 * @param {Object} props
 * @param {Array} props.members - Tableau des membres de l'organisation
 */
export default function MemberStats({ members }) {
    const memberCount = members.length;

    if (memberCount === 0) {
        return null;
    }

    return (
        <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
            {memberCount} membre{memberCount > 1 ? "s" : ""} actif
            {memberCount > 1 ? "s" : ""}
        </span>
    );
}
