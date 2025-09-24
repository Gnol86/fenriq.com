"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nameToSlug } from "@/lib/utils";

export async function hasPermissionAction({ permissions }) {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
        return false;
    }

    if (!session.user) {
        return false;
    }

    if (!session.session.activeOrganizationId) {
        return false;
    }

    const response = await auth.api.hasPermission({
        body: {
            permissions: permissions,
        },
        headers: await headers(),
    });
    return response.success;
}

export async function createOrganizationAction({ name }) {
    return await auth.api.createOrganization({
        body: {
            name: name,
            slug: nameToSlug(name),
        },
        headers: await headers(),
    });
}

export async function updateOrganizationAction({ name, organizationId }) {
    return await auth.api.updateOrganization({
        body: {
            data: {
                name: name,
            },
            organizationId: organizationId,
        },
        headers: await headers(),
    });
}

export async function setActiveOrganizationAction({ organizationId }) {
    return await auth.api.setActiveOrganization({
        body: {
            organizationId: organizationId,
        },
        headers: await headers(),
    });
}

export async function deleteOrganizationAction({ organizationId }) {
    return await auth.api.deleteOrganization({
        body: {
            organizationId: organizationId,
        },
        headers: await headers(),
    });
}

export async function inviteMemberAction({ email, role, organizationId }) {
    return await auth.api.createInvitation({
        body: {
            email: email,
            role: role,
            organizationId: organizationId,
        },
        headers: await headers(),
    });
}
