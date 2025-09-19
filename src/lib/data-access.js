// src/lib/data-access.js
import { cache } from "react";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Data Access Layer - Best practices 2025
 * Centralise tous les accès aux données avec autorisation intégrée
 */

// Cache sélectif par type d'opération
const CACHE_STRATEGIES = {
    SENSITIVE: false,     // Pas de cache pour opérations sensibles
    STANDARD: true,       // Cache standard pour données utilisateur
    PERMISSIONS: true,    // Cache pour permissions (courte durée)
};

/**
 * Récupère la session avec stratégie de cache configurable
 */
const _getSessionCached = cache(async (cookieHeader, disableCache = false) => {
    return await auth.api.getSession({
        headers: { cookie: cookieHeader },
        query: disableCache ? { disableCookieCache: true } : {},
    });
});

/**
 * Récupère l'utilisateur courant avec organisations
 * @param {boolean} sensitiveOperation - Si true, ignore le cache cookie
 */
export const getCurrentUser = cache(async (sensitiveOperation = false) => {
    const cookieHeader = (await headers()).get("cookie") || "";
    const session = await _getSessionCached(cookieHeader, sensitiveOperation);
    
    const user = session?.user;
    if (!user) return null;

    // Récupère les organisations seulement si nécessaire
    if (!sensitiveOperation) {
        try {
            const listOrganizations = await auth.api.listOrganizations({
                headers: await headers(),
            });
            user.organizations = listOrganizations;
        } catch (error) {
            console.error("Error fetching organizations:", error);
            user.organizations = [];
        }
    }

    return user;
});

/**
 * Récupère l'utilisateur courant ou redirige vers signin
 */
export const requireUser = async (sensitiveOperation = false) => {
    const user = await getCurrentUser(sensitiveOperation);
    if (!user) {
        const { redirect } = await import("next/navigation");
        redirect("/signin");
    }
    return user;
};

/**
 * Récupère l'organisation active avec cache intelligent
 */
export const getCurrentOrganization = cache(async (sensitiveOperation = false) => {
    const cookieHeader = (await headers()).get("cookie") || "";
    const session = await _getSessionCached(cookieHeader, sensitiveOperation);
    
    const activeOrganizationId = session?.session?.activeOrganizationId;
    if (!activeOrganizationId) return null;

    try {
        return await auth.api.getFullOrganization({
            headers: await headers(),
            query: { organizationId: activeOrganizationId },
        });
    } catch (error) {
        if (error.name === "APIError") return null;
        throw error;
    }
});

/**
 * Récupère l'organisation active ou redirige
 */
export const requireOrganization = async (sensitiveOperation = false) => {
    const organization = await getCurrentOrganization(sensitiveOperation);
    if (!organization) {
        const { redirect } = await import("next/navigation");
        redirect("/dashboard/orgs/new");
    }
    return organization;
};

/**
 * Récupère le rôle de l'utilisateur dans l'organisation active
 */
export const getCurrentUserRole = cache(async () => {
    const [user, organization] = await Promise.all([
        getCurrentUser(),
        getCurrentOrganization(),
    ]);
    
    if (!user || !organization?.members?.length) return null;
    
    const member = organization.members.find(
        orgMember => orgMember.userId === user.id
    );
    
    return member?.role ?? null;
});

/**
 * Vérifie les permissions avec gestion d'erreur robuste
 */
export const checkUserPermissions = async (permissions, options = {}) => {
    const { 
        sensitiveOperation = false,
        throwOnError = false 
    } = options;
    
    const [organization, user] = await Promise.all([
        requireOrganization(sensitiveOperation),
        requireUser(sensitiveOperation),
    ]);

    const body = { userId: user.id };

    // Normalisation des permissions
    if (permissions) {
        if (Array.isArray(permissions)) {
            body.permissions = permissions;
        } else if (typeof permissions === 'object' && permissions !== null) {
            Object.assign(body, permissions);
        } else {
            body.permissions = [permissions];
        }
    }

    try {
        const result = await auth.api.userHasPermission({
            headers: await headers(),
            body,
        });

        if (!result?.success) {
            if (throwOnError) {
                throw new Error("Insufficient permissions");
            }
            const { redirect } = await import("next/navigation");
            redirect("/dashboard?error=insufficient_permissions");
        }

        return { organization, user, hasPermission: true };
    } catch (error) {
        if (error.name === "APIError") {
            if (throwOnError) throw error;
            const { redirect } = await import("next/navigation");
            redirect("/dashboard?error=permission_check_failed");
        }
        throw error;
    }
};

/**
 * Récupère les permissions de l'utilisateur pour une organisation
 */
export const getUserPermissions = cache(async (organizationId) => {
    const user = await getCurrentUser();
    if (!user?.organizations) return [];
    
    const org = user.organizations.find(org => org.id === organizationId);
    return org?.permissions ?? [];
});

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
export const hasPermission = cache(async (permission, organizationId = null) => {
    try {
        const targetOrgId = organizationId || (await getCurrentOrganization())?.id;
        if (!targetOrgId) return false;
        
        const permissions = await getUserPermissions(targetOrgId);
        return permissions.includes(permission);
    } catch {
        return false;
    }
});

/**
 * Wrapper pour opérations sensibles (change password, delete account, etc.)
 */
export const withSensitiveOperation = (fn) => {
    return async (...args) => {
        console.log(`[SECURITY] Sensitive operation: ${fn.name}`);
        return fn(...args, true); // Force sensitiveOperation = true
    };
};

// Exports pour opérations sensibles
export const getCurrentUserSensitive = withSensitiveOperation(getCurrentUser);
export const requireUserSensitive = withSensitiveOperation(requireUser);
export const getCurrentOrganizationSensitive = withSensitiveOperation(getCurrentOrganization);
export const checkUserPermissionsSensitive = withSensitiveOperation(checkUserPermissions);