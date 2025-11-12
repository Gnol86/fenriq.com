// src/lib/access-control.js

import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Version cachée de headers() pour éviter les appels multiples
 * Cache pendant toute la durée de la requête
 */
const getCachedHeaders = async () => {
    "use cache";
    cacheLife("seconds");
    return await headers();
};

/**
 * Version cachée de getSession pour éviter les requêtes redondantes
 * Cache pendant toute la durée de la requête
 */
const getCachedSession = async () => {
    "use cache";
    cacheLife("seconds");
    return await auth.api.getSession({
        headers: await getCachedHeaders(),
    });
};

/**
 * Récupère et vérifie l'authentification de l'utilisateur
 * @returns {Promise<{session: Object, user: Object}>}
 * @throws {Error} notFound() si l'utilisateur n'est pas authentifié
 */
export const requireAuth = async () => {
    "use cache";
    cacheLife("seconds");
    const session = await getCachedSession();

    if (!session?.user) {
        notFound();
    }

    return {
        session: session.session,
        user: session.user,
    };
};

/**
 * Récupère et vérifie l'authentification de l'utilisateur
 * @returns {Promise<{session: Object, user: Object}>}
 */
export const getAuth = async () => {
    "use cache";
    cacheLife("seconds");
    const session = await getCachedSession();

    if (!session?.user) {
        return {
            session: null,
            user: null,
        };
    }

    return {
        session: session.session,
        user: session.user,
    };
};

/**
 * Version cachée de listOrganizations pour éviter les requêtes redondantes
 * Cache pendant toute la durée de la requête
 */
const getCachedOrganizations = async () => {
    "use cache";
    cacheLife("seconds");
    return await auth.api.listOrganizations({
        headers: await getCachedHeaders(),
    });
};

/**
 * Récupère l'organisation active de l'utilisateur
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 * @throws {Error} notFound() si pas d'organisation active
 */
export const requireActiveOrganization = async () => {
    "use cache";
    cacheLife("seconds");
    const { session, user } = await requireAuth();

    const userOrganizations = await getCachedOrganizations();

    const organization = userOrganizations?.find(org => org.id === session.activeOrganizationId);

    if (!organization) {
        notFound();
    }

    return {
        session,
        user,
        organization,
    };
};

/**
 * Récupère l'organisation active de l'utilisateur
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 */
export const getActiveOrganization = async () => {
    "use cache";
    cacheLife("seconds");
    const { session, user } = await getAuth();

    if (!session || !user) {
        return {
            session: null,
            user: null,
            organization: null,
        };
    }

    const userOrganizations = await getCachedOrganizations();
    const organization = userOrganizations?.find(org => org.id === session.activeOrganizationId);

    if (!organization) {
        return {
            session,
            user,
            organization: null,
        };
    }

    return {
        session,
        user,
        organization,
    };
};

/**
 * Version cachée de hasPermission pour éviter les requêtes redondantes
 * Cache basé sur les permissions demandées
 */
const getCachedPermissionCheck = async () => {
    "use cache";
    cacheLife("seconds");
    return await auth.api.hasPermission({
        body: {
            permissions: permissions,
        },
        headers: await getCachedHeaders(),
    });
};

/**
 * Vérifie que l'utilisateur a les permissions requises dans l'organisation active
 * @param {Object} params
 * @param {Object} params.permissions - Les permissions à vérifier (ex: { member: ["read"] })
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 * @throws {Error} notFound() si les permissions sont insuffisantes
 */
export async function requirePermission({ permissions }) {
    const { session, user, organization } = await requireActiveOrganization();

    const response = await getCachedPermissionCheck(permissions);

    if (!response.success) {
        notFound();
    }

    return {
        session,
        user,
        organization,
    };
}

/**
 * Vérifie que l'utilisateur a le rôle admin
 * @returns {Promise<{session: Object, user: Object}>}
 * @throws {Error} notFound() si l'utilisateur n'est pas admin
 */
export const requireAdmin = async () => {
    "use cache";
    cacheLife("seconds");
    const { session, user } = await requireAuth();

    if (user.role !== "admin") {
        notFound();
    }

    return {
        session,
        user,
    };
};

/**
 * Vérifie si l'utilisateur a les permissions sans lever d'erreur
 * Utile pour afficher/masquer des éléments UI conditionnellement
 * @param {Object} params
 * @param {Object} params.permissions - Les permissions à vérifier
 * @returns {Promise<boolean>}
 */
export async function checkPermission({ permissions }) {
    try {
        const session = await getCachedSession();

        if (!session?.user || !session.session?.activeOrganizationId) {
            return false;
        }

        const response = await getCachedPermissionCheck(permissions);

        return response.success;
    } catch {
        return false;
    }
}

/**
 * Vérifie si l'utilisateur est admin sans lever d'erreur
 * @returns {Promise<boolean>}
 */
export async function checkAdmin() {
    try {
        const session = await getCachedSession();

        return session?.user?.role === "admin";
    } catch {
        return false;
    }
}
