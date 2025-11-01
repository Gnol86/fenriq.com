import { getInvitationStatusBadgeClasses } from "@/lib/invitation-utils";
import { cn } from "@/lib/utils";

/**
 * Composant badge de statut réutilisable
 * Supporte différents types de statuts avec des styles appropriés
 * @param {Object} props
 * @param {string} props.status - Le statut à afficher
 * @param {"invitation"|"default"} props.variant - Le type de badge (détermine le style)
 * @param {string} props.className - Classes CSS additionnelles
 * @param {React.ReactNode} props.children - Contenu personnalisé (remplace le statut)
 */
export function StatusBadge({
    status,
    variant = "default",
    className,
    children,
    ...props
}) {
    // Classes de base pour tous les badges
    const baseClasses =
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";

    // Sélectionner les classes selon le variant
    let variantClasses = "";

    if (variant === "invitation" && status) {
        variantClasses = getInvitationStatusBadgeClasses(status);
    } else {
        // Classes par défaut si variant non supporté
        variantClasses = "bg-muted text-muted-foreground";
    }

    return (
        <span className={cn(baseClasses, variantClasses, className)} {...props}>
            {children ?? status}
        </span>
    );
}
