"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * Composant badge de rôle réutilisable
 * Affiche un rôle avec les styles appropriés
 * @param {Object} props
 * @param {string} props.role - Le rôle à afficher (owner, admin, member)
 * @param {string} props.className - Classes CSS additionnelles
 * @param {React.ReactNode} props.children - Contenu personnalisé (remplace le rôle)
 */
export function RoleBadge({ role, className, children, ...props }) {
    // Classes de base pour les badges de rôle
    const baseClasses = "text-sm font-medium text-foreground";

    const tRoles = useTranslations("roles");

    let roleLabel = "";
    if (role) {
        try {
            roleLabel = tRoles(role);
        } catch (error) {
            roleLabel = role;
        }
    }

    return (
        <span className={cn(baseClasses, className)} {...props}>
            {children ?? roleLabel}
        </span>
    );
}
