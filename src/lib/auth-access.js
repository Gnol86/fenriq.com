// src/lib/auth-access.js
import "server-only";
import { cache } from "react";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { APIError } from "better-auth/api";

// On clé le cache sur la chaîne de cookie, pas sur l'objet Headers.
const _getSessionCached = cache(async (critical = false, h) => {
    const head = h || (await nextHeaders());
    return auth.api.getSession({
        headers: head,
        query: { disableCookieCache: critical },
    });
});

export const getCurrentUser = cache(async (critical = false, h) => {
    const head = h || (await nextHeaders());
    const session = await _getSessionCached(critical, head);
    const user = session?.user;
    if (!user) return null;

    const activeOrganizationId = session?.session?.activeOrganizationId ?? null;

    return { ...user, activeOrganizationId };
});

export const getListMembersActiveOrganization = cache(
    async (options = {}, critical = false, h) => {
        const isPermitted = await hasGlobalPermissionCritical({
            organization: ["read"],
        });

        if (!isPermitted) {
            throw new Error(
                "Vous n'avez pas la permission d'accéder à cette ressource"
            );
        }
        const head = h || (await nextHeaders());
        const user = await getCurrentUser(critical, head);
        if (!user?.activeOrganizationId) return null;

        try {
            const members = await auth.api.listMembers({
                headers: head,
                query: {
                    organizationId: user.activeOrganizationId,
                    limit: options.limit ?? 10,
                    offset: options.offset ?? 0,
                    sortBy: options.sortBy ?? "createdAt",
                    sortDirection: options.sortDirection ?? "asc",
                    filterField: options.filterField ?? "name",
                    filterOperator: options.filterOperator ?? "contains",
                    filterValue: options.filterValue ?? "",
                },
            });
            return members?.members;
        } catch (error) {
            if (error instanceof APIError) return null;
            throw error;
        }
    }
);

export const getListContactsActiveOrganization = cache(
    async (critical = false, h) => {
        const head = h || (await nextHeaders());
        const user = await getCurrentUser(critical, head);
        if (!user?.activeOrganizationId) return null;

        try {
            const members = await auth.api.listMembers({
                headers: head,
                query: {
                    organizationId: user.activeOrganizationId,
                    limit: 100,
                    sortBy: "createdAt",
                    sortDirection: "asc",
                    filterField: "role",
                    filterOperator: "contains",
                    filterValue: "owner",
                },
            });
            return members?.members;
        } catch (error) {
            if (error instanceof APIError) return null;
            throw error;
        }
    }
);

export const getListOrganizations = cache(async (critical = false, h) => {
    const head = h || (await nextHeaders());
    const organisations = await auth.api.listOrganizations({
        headers: head,
    });
    return organisations;
});

export const getCurrentOrganization = cache(
    async (membersLimit = 0, critical = false, h) => {
        const head = h || (await nextHeaders());
        const user = await getCurrentUser(critical, head);
        if (!user?.activeOrganizationId) return null;

        try {
            return await auth.api.getFullOrganization({
                headers: head,
                query: {
                    organizationId: user.activeOrganizationId,
                    membersLimit: membersLimit,
                },
            });
        } catch (error) {
            if (error instanceof APIError) return null;
            throw error;
        }
    }
);

export const requireUser = async (critical = false, h) => {
    const head = h || (await nextHeaders());
    const user = await getCurrentUser(critical, head);
    if (!user) redirect("/signin");
    return user;
};

export const requireOrganization = async (critical = false, h) => {
    const head = h || (await nextHeaders());
    await requireUser(critical, head);
    const organization = await getCurrentOrganization(0, critical, head);
    if (!organization) redirect("/dashboard");
    return organization;
};

// Fonction interne partagée
const _hasGlobalPermissionInternal = async (
    permissions,
    critical = false,
    h
) => {
    const head = h || (await nextHeaders());
    const user = await getCurrentUser(critical, head);
    if (!user) return false;

    const orgaOk = await auth.api.hasPermission({
        headers: head,
        body: { permissions: permissions },
    });

    return Boolean(orgaOk?.success);
};

// Version sans cache pour les actions critiques
export const hasGlobalPermissionCritical = (permissions, h) =>
    _hasGlobalPermissionInternal(permissions, true, h);

// Version avec cache pour l'UI
export const hasGlobalPermission = cache((permissions, h) =>
    _hasGlobalPermissionInternal(permissions, false, h)
);
