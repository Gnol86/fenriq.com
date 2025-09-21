"use server";

import { auth } from "@/lib/auth";
import { hasGlobalPermissionCritical } from "@/lib/auth-access";
import { nameToSlug } from "@/lib/utils";
import { headers } from "next/headers";

export async function createOrganizationAction({ name }) {
    try {
        await auth.api.createOrganization({
            body: {
                name: name,
                slug: nameToSlug(name),
                keepCurrentActiveOrganization: false,
            },
            headers: await headers(),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to create organization", error);
        throw new Error(error.message);
    }
}

export async function deleteOrganizationAction({ organizationId }) {
    const canDeleteOrganization = await hasGlobalPermissionCritical({
        organization: ["delete"],
    });

    if (!canDeleteOrganization) {
        throw new Error(
            "Vous n'avez pas la permission d'effectuer cette action"
        );
    }

    try {
        await auth.api.deleteOrganization({
            body: {
                organizationId,
            },
            headers: await headers(),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete organization", error);
        throw new Error(error.message);
    }
}

export async function updateOrganizationAction({ organizationId, name }) {
    const canDeleteOrganization = await hasGlobalPermissionCritical({
        organization: ["update"],
    });

    if (!canDeleteOrganization) {
        throw new Error(
            "Vous n'avez pas la permission d'effectuer cette action"
        );
    }

    try {
        await auth.api.updateOrganization({
            body: {
                organizationId,
                data: {
                    name: name,
                    slug: nameToSlug(name),
                },
            },
            headers: await headers(),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update organization", error);
        throw new Error(error.message);
    }
}

export async function setActiveOrganizationAction({ organizationId }) {
    try {
        await auth.api.setActiveOrganization({
            body: {
                organizationId,
            },
            headers: await headers(),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to set organization", error);
        throw new Error(error.message);
    }
}
