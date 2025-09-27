/**
 * Composant pour afficher les statistiques des membres en mode admin
 * Affiche le nombre de membres actifs avec pluriel approprié
 * @param {Object} props
 * @param {Array} props.members - Tableau des membres de l'organisation
 */
export default function AdminMemberStats({ members }) {
    const memberCount = members.length;
    const adminCount = members.filter(member =>
        member.role.includes('admin') || member.role.includes('owner')
    ).length;
    const memberOnlyCount = memberCount - adminCount;

    if (memberCount === 0) {
        return null;
    }

    return (
        <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
            {memberCount} membre{memberCount > 1 ? "s" : ""} actif{memberCount > 1 ? "s" : ""} · {" "}
            {adminCount} admin{adminCount > 1 ? "s" : ""} · {" "}
            {memberOnlyCount} membre{memberOnlyCount > 1 ? "s" : ""} standard
            {memberOnlyCount > 1 ? "s" : ""}
        </span>
    );
}