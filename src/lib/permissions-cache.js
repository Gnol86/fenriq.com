// src/lib/permissions-cache.js
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Cache granulaire pour permissions - Performance optimale 2025
 */

// Configuration du cache par type de permission
const PERMISSION_CACHE_CONFIG = {
    // Permissions critiques - cache court
    CRITICAL: { revalidate: 60 }, // 1 minute
    // Permissions standard - cache moyen  
    STANDARD: { revalidate: 300 }, // 5 minutes
    // Permissions lecture - cache long
    READ_ONLY: { revalidate: 900 }, // 15 minutes
};

// Classification des permissions par criticité
const PERMISSION_TYPES = {
    CRITICAL: [
        'org:admin',
        'org:delete', 
        'user:delete',
        'billing:manage',
        'settings:security'
    ],
    READ_ONLY: [
        'org:read',
        'user:read', 
        'dashboard:view',
        'reports:view'
    ]
    // Tout le reste = STANDARD
};

/**
 * Détermine le type de cache selon la permission
 */
const getCacheType = (permission) => {
    if (PERMISSION_TYPES.CRITICAL.includes(permission)) return 'CRITICAL';
    if (PERMISSION_TYPES.READ_ONLY.includes(permission)) return 'READ_ONLY';
    return 'STANDARD';
};

/**
 * Cache intelligent pour vérification de permissions individuelles
 */
export const checkSinglePermission = (permission, userId, orgId) => {
    const cacheType = getCacheType(permission);
    const config = PERMISSION_CACHE_CONFIG[cacheType];
    
    return unstable_cache(
        async () => {
            console.log(`[CACHE] Checking permission: ${permission} for user: ${userId} in org: ${orgId}`);
            
            try {
                const result = await auth.api.userHasPermission({
                    headers: await headers(),
                    body: {
                        userId,
                        permissions: [permission],
                        organizationId: orgId
                    },
                });
                
                return result?.success ?? false;
            } catch (error) {
                console.error(`Permission check failed for ${permission}:`, error);
                return false;
            }
        },
        [`permission:${permission}:${userId}:${orgId}`],
        {
            revalidate: config.revalidate,
            tags: [`user:${userId}`, `org:${orgId}`, `permission:${permission}`]
        }
    )();
};

/**
 * Cache pour toutes les permissions d'un utilisateur dans une org
 */
export const getUserOrgPermissions = cache(async (userId, orgId) => {
    return unstable_cache(
        async () => {
            console.log(`[CACHE] Fetching all permissions for user: ${userId} in org: ${orgId}`);
            
            try {
                const result = await auth.api.listUserPermissions({
                    headers: await headers(),
                    query: { userId, organizationId: orgId },
                });
                
                return result?.permissions ?? [];
            } catch (error) {
                console.error(`Failed to fetch permissions for user ${userId}:`, error);
                return [];
            }
        },
        [`user-permissions:${userId}:${orgId}`],
        {
            revalidate: 300, // 5 minutes pour liste complète
            tags: [`user:${userId}`, `org:${orgId}`, 'permissions']
        }
    )();
});

/**
 * Cache pour les rôles utilisateur
 */
export const getUserRole = cache(async (userId, orgId) => {
    return unstable_cache(
        async () => {
            console.log(`[CACHE] Fetching role for user: ${userId} in org: ${orgId}`);
            
            try {
                const org = await auth.api.getFullOrganization({
                    headers: await headers(),
                    query: { organizationId: orgId },
                });
                
                const member = org?.members?.find(m => m.userId === userId);
                return member?.role ?? null;
            } catch (error) {
                console.error(`Failed to fetch role for user ${userId}:`, error);
                return null;
            }
        },
        [`user-role:${userId}:${orgId}`],
        {
            revalidate: 600, // 10 minutes pour les rôles
            tags: [`user:${userId}`, `org:${orgId}`, 'roles']
        }
    )();
});

/**
 * Invalide le cache pour un utilisateur spécifique
 */
export const invalidateUserCache = async (userId, orgId = null) => {
    const { revalidateTag } = await import("next/cache");
    
    console.log(`[CACHE] Invalidating cache for user: ${userId}`);
    
    // Invalide tous les caches de l'utilisateur
    await revalidateTag(`user:${userId}`);
    
    // Invalide aussi l'org si spécifiée
    if (orgId) {
        await revalidateTag(`org:${orgId}`);
    }
};

/**
 * Invalide le cache pour une organisation
 */
export const invalidateOrgCache = async (orgId) => {
    const { revalidateTag } = await import("next/cache");
    
    console.log(`[CACHE] Invalidating cache for org: ${orgId}`);
    await revalidateTag(`org:${orgId}`);
};

/**
 * Invalide le cache pour une permission spécifique
 */
export const invalidatePermissionCache = async (permission, userId = null, orgId = null) => {
    const { revalidateTag } = await import("next/cache");
    
    console.log(`[CACHE] Invalidating cache for permission: ${permission}`);
    await revalidateTag(`permission:${permission}`);
    
    // Invalide aussi les caches spécifiques si fournis
    if (userId && orgId) {
        await revalidateTag(`permission:${permission}:${userId}:${orgId}`);
    }
};

/**
 * Vérifie plusieurs permissions en batch avec cache optimisé
 */
export const checkMultiplePermissions = cache(async (permissions, userId, orgId) => {
    // Groupe les permissions par type de cache
    const permissionsByType = permissions.reduce((acc, permission) => {
        const type = getCacheType(permission);
        if (!acc[type]) acc[type] = [];
        acc[type].push(permission);
        return acc;
    }, {});
    
    // Vérifie chaque groupe avec sa stratégie de cache
    const results = {};
    
    for (const [type, perms] of Object.entries(permissionsByType)) {
        for (const permission of perms) {
            results[permission] = await checkSinglePermission(permission, userId, orgId);
        }
    }
    
    return results;
});

/**
 * Hook helper pour les composants React
 */
export const usePermissionCache = () => {
    return {
        checkPermission: checkSinglePermission,
        getUserPermissions: getUserOrgPermissions,
        getUserRole,
        invalidateUser: invalidateUserCache,
        invalidateOrg: invalidateOrgCache,
        invalidatePermission: invalidatePermissionCache,
        checkMultiple: checkMultiplePermissions,
    };
};