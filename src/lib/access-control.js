// src/lib/access-control.js
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Récupère et vérifie l'authentification de l'utilisateur
 * @returns {Promise<{session: Object, user: Object}>}
 * @throws {Error} notFound() si l'utilisateur n'est pas authentifié
 */
export async function requireAuth() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        notFound();
    }

    return {
        session: session.session,
        user: session.user,
    };
}

/**
 * Récupère l'organisation active de l'utilisateur
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 * @throws {Error} notFound() si pas d'organisation active
 */
export async function requireActiveOrganization() {
    const { session, user } = await requireAuth();

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const organization = userOrganizations?.find(
        org => org.id === session.activeOrganizationId
    );

    if (!organization) {
        notFound();
    }

    return {
        session,
        user,
        organization,
    };
}

/**
 * Vérifie que l'utilisateur a les permissions requises dans l'organisation active
 * @param {Object} params
 * @param {Object} params.permissions - Les permissions à vérifier (ex: { member: ["read"] })
 * @returns {Promise<{session: Object, user: Object, organization: Object}>}
 * @throws {Error} notFound() si les permissions sont insuffisantes
 */
export async function requirePermission({ permissions }) {
    const { session, user, organization } = await requireActiveOrganization();

    const response = await auth.api.hasPermission({
        body: {
            permissions: permissions,
        },
        headers: await headers(),
    });

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
export async function requireAdmin() {
    const { session, user } = await requireAuth();

    if (user.role !== "admin") {
        notFound();
    }

    return {
        session,
        user,
    };
}

/**
 * Vérifie si l'utilisateur a les permissions sans lever d'erreur
 * Utile pour afficher/masquer des éléments UI conditionnellement
 * @param {Object} params
 * @param {Object} params.permissions - Les permissions à vérifier
 * @returns {Promise<boolean>}
 */
export async function checkPermission({ permissions }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || !session.session?.activeOrganizationId) {
            return false;
        }

        const response = await auth.api.hasPermission({
            body: {
                permissions: permissions,
            },
            headers: await headers(),
        });

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
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        return session?.user?.role === "admin";
    } catch {
        return false;
    }
}
