import { hasGlobalPermission } from "@/lib/auth-access";

/**
 * Hook personnalisé pour gérer les permissions liées aux invitations
 * Centralise toute la logique de permissions d'invitation
 * @returns {Object} Objet contenant les permissions d'invitation
 */
export function useInvitationPermissions() {
    // Note: Ce hook est synchrone car les permissions sont vérifiées côté serveur
    // Dans un composant client, il faudrait une approche différente avec useState/useEffect

    const getPermissions = async () => {
        const canRead = await hasGlobalPermission({
            invitation: ["read"],
        });

        const canCreate = await hasGlobalPermission({
            invitation: ["create"],
        });

        const canCancel = await hasGlobalPermission({
            invitation: ["cancel"],
        });

        return {
            canRead,
            canCreate,
            canCancel,
            canInvite: canCreate, // Alias pour une meilleure lisibilité
        };
    };

    return { getPermissions };
}

/**
 * Fonction utilitaire pour obtenir toutes les permissions d'invitation
 * À utiliser dans les composants serveur
 * @returns {Promise<Object>} Objet contenant toutes les permissions
 */
export async function getInvitationPermissions() {
    const canRead = await hasGlobalPermission({
        invitation: ["read"],
    });

    const canCreate = await hasGlobalPermission({
        invitation: ["create"],
    });

    const canCancel = await hasGlobalPermission({
        invitation: ["cancel"],
    });

    return {
        canRead,
        canCreate,
        canCancel,
        canInvite: canCreate, // Alias pour une meilleure lisibilité
    };
}
