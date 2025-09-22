import { hasGlobalPermission } from "@/lib/auth-access";

/**
 * Hook personnalisé pour gérer les permissions liées aux membres
 * Centralise toute la logique de permissions de membres
 * @returns {Object} Objet contenant les fonctions de permission
 */
export function useMemberPermissions() {
    // Note: Ce hook est synchrone car les permissions sont vérifiées côté serveur
    // Dans un composant client, il faudrait une approche différente avec useState/useEffect

    const getPermissions = async () => {
        const canRead = await hasGlobalPermission({
            member: ["read"],
        });

        const canUpdate = await hasGlobalPermission({
            member: ["update"],
        });

        const canDelete = await hasGlobalPermission({
            member: ["delete"],
        });

        const canInvite = await hasGlobalPermission({
            invitation: ["create"],
        });

        return {
            canRead,
            canUpdate,
            canDelete,
            canInvite,
        };
    };

    return { getPermissions };
}

/**
 * Fonction utilitaire pour obtenir toutes les permissions de membres
 * À utiliser dans les composants serveur
 * @returns {Promise<Object>} Objet contenant toutes les permissions
 */
export async function getMemberPermissions() {
    const canRead = await hasGlobalPermission({
        member: ["read"],
    });

    const canUpdate = await hasGlobalPermission({
        member: ["update"],
    });

    const canDelete = await hasGlobalPermission({
        member: ["delete"],
    });

    const canInvite = await hasGlobalPermission({
        invitation: ["create"],
    });

    return {
        canRead,
        canUpdate,
        canDelete,
        canInvite,
    };
}
