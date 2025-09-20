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

export const requireOrganization = async critical => {
    const head = await nextHeaders();
    await requireUser(critical, head);
    const organization = await getCurrentOrganization(critical, head);
    if (!organization) redirect("/dashboard");
    return organization;
};

// permission peut être un objet { resource: ["action"] } ou un tableau selon ton AC.
// On passe toujours headers aux deux endpoints pour être propres.
export const hasGlobalPermission = cache(
    async (permission, critical = false, h) => {
        const head = h || (await nextHeaders());
        const user = await getCurrentUser(critical, head);
        if (!user) return false;

        const [orgaOk, adminOk] = await Promise.all([
            auth.api.hasPermission({
                headers: head,
                body: { permissions: permission },
            }),
            auth.api.userHasPermission({
                headers: head,
                body: {
                    userId: user.id,
                    permissions: permission,
                },
            }),
        ]);

        return Boolean(orgaOk || adminOk);
    }
);
