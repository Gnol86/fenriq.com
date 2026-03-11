"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { nameToSlug } from "@/lib/utils";

function serializeOrganization(organization) {
    if (!organization?.id) {
        return null;
    }

    return {
        id: organization.id,
        name: organization.name ?? "",
        slug: organization.slug ?? null,
    };
}

async function getOrganizationCreationLogContext(requestHeaders) {
    try {
        const session = await auth.api.getSession({
            headers: requestHeaders,
        });

        return {
            userId: session?.user?.id ?? null,
            sessionId: session?.session?.id ?? null,
            activeOrganizationId: session?.session?.activeOrganizationId ?? null,
        };
    } catch (error) {
        console.error("[createOrganizationAction] Failed to load session context", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        return {
            userId: null,
            sessionId: null,
            activeOrganizationId: null,
        };
    }
}

async function reconcileOrganizationCreation({ requestHeaders, slug, logContext }) {
    try {
        const organizations = await auth.api.listOrganizations({
            headers: requestHeaders,
        });
        const matchedOrganization = organizations?.find(organization => organization.slug === slug);

        if (matchedOrganization) {
            console.warn("[createOrganizationAction] Reconciled organization after failure", {
                slug,
                organizationId: matchedOrganization.id,
                ...logContext,
            });

            return serializeOrganization(matchedOrganization);
        }
    } catch (error) {
        console.error(
            "[createOrganizationAction] Failed to list organizations for reconciliation",
            {
                slug,
                ...logContext,
                errorMessage: error?.message,
                errorName: error?.name,
            }
        );
    }

    try {
        const orphanCandidate = await prisma.organization.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                slug: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });

        if (orphanCandidate && orphanCandidate._count.members === 0) {
            console.error("[createOrganizationAction] Orphan organization candidate detected", {
                slug,
                organizationId: orphanCandidate.id,
                membersCount: orphanCandidate._count.members,
                ...logContext,
            });
        }
    } catch (error) {
        console.error(
            "[createOrganizationAction] Failed to inspect orphan organization candidate",
            {
                slug,
                ...logContext,
                errorMessage: error?.message,
                errorName: error?.name,
            }
        );
    }

    return null;
}

export async function createOrganizationAction({ name }) {
    const requestHeaders = await headers();
    const slug = nameToSlug(name);

    try {
        const organization = await auth.api.createOrganization({
            body: {
                name,
                slug,
            },
            headers: requestHeaders,
        });

        return serializeOrganization(organization);
    } catch (error) {
        const logContext = await getOrganizationCreationLogContext(requestHeaders);
        const reconciledOrganization = await reconcileOrganizationCreation({
            requestHeaders,
            slug,
            logContext,
        });

        if (reconciledOrganization) {
            return reconciledOrganization;
        }

        console.error("[createOrganizationAction] Failed to create organization", {
            name,
            slug,
            ...logContext,
            errorMessage: error?.message,
            errorStatus: error?.status,
            errorBody: error?.body,
            errorName: error?.name,
        });

        throw error;
    }
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
    try {
        const result = await auth.api.createInvitation({
            body: {
                email: email,
                role: role,
                organizationId: organizationId,
                resend: true,
            },
            headers: await headers(),
        });
        // Return only serializable data to avoid Server Components boundary errors
        return { id: result?.id, status: result?.status ?? "sent" };
    } catch (error) {
        console.error("[inviteMemberAction] Error creating invitation:", {
            email,
            role,
            organizationId,
            errorMessage: error?.message,
            errorStatus: error?.status,
            errorBody: error?.body,
            errorName: error?.name,
        });
        throw error;
    }
}

export async function updateMemberRoleAction({ memberId, role, organizationId }) {
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
