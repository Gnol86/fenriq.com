"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { nameToSlug } from "@/lib/utils";

export async function createOrganizationAction({ name }) {
    return await auth.api.createOrganization({
        body: {
            name: name,
            slug: nameToSlug(name),
        },
        headers: await headers(),
    });
}

export async function updateOrganizationAction({ name, logo, organizationId }) {
    return await auth.api.updateOrganization({
        body: {
            data: {
                name: name,
                slug: name ? nameToSlug(name) : undefined,
                logo: logo,
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
            resend: true,
        },
        headers: await headers(),
    });
}

export async function updateMemberRoleAction({
    memberId,
    role,
    organizationId,
}) {
    return await auth.api.updateMemberRole({
        body: {
            memberId,
            role,
            organizationId,
        },
        headers: await headers(),
    });
}

export async function removeMemberAction({ memberIdOrEmail, organizationId }) {
    return await auth.api.removeMember({
        body: {
            memberIdOrEmail,
            organizationId,
        },
        headers: await headers(),
    });
}

export async function cancelInvitationAction({ invitationId, organizationId }) {
    return await auth.api.cancelInvitation({
        body: {
            invitationId,
            organizationId,
        },
        headers: await headers(),
    });
}

export async function leaveOrganizationAction({ organizationId }) {
    return await auth.api.leaveOrganization({
        body: {
            organizationId,
        },
        headers: await headers(),
    });
}
