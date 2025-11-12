// src/lib/access-control.js

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Récupère la session de l'utilisateur
 * Note: Next.js fait automatiquement du Request Memoization,
 * donc cet appel ne sera effectué qu'une seule fois par requête
 */
const getSession = async () => {
    return await auth.api.getSession({
        headers: await headers(),
    });
};

/**
 * Récupère et vérifie l'authentification de l'utilisateur
 * @returns {Promise<{session: Object, user: Object}>}
 * @throws {Error} notFound() si l'utilisateur n'est pas authentifié
 */
export const requireAuth = async () => {
    const session = await getSession();

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
    const session = await getSession();

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
 * Récupère les organisations de l'utilisateur
 * Note: Next.js fait automatiquement du Request Memoization
 */
const getOrganizations = async () => {
    return await auth.api.listOrganizations({
        headers: await headers(),
    });
};

/**
 * Récupère l'organisation active de l'utilisateur
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 * @throws {Error} notFound() si pas d'organisation active
 */
export const requireActiveOrganization = async () => {
    const { session, user } = await requireAuth();

    const userOrganizations = await getOrganizations();

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
    const { session, user } = await getAuth();

    if (!session || !user) {
        return {
            session: null,
            user: null,
            organization: null,
        };
    }

    const userOrganizations = await getOrganizations();
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
 * Vérifie les permissions de l'utilisateur
 * @param {Object} permissions - Les permissions à vérifier
 * @returns {Promise<Object>}
 */
const checkPermissionApi = async permissions => {
    return await auth.api.hasPermission({
        body: {
            permissions: permissions,
        },
        headers: await headers(),
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

    const response = await checkPermissionApi(permissions);

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
        const session = await getSession();

        if (!session?.user || !session.session?.activeOrganizationId) {
            return false;
        }

        const response = await checkPermissionApi(permissions);

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
        const session = await getSession();

        return session?.user?.role === "admin";
    } catch {
        return false;
    }
}
