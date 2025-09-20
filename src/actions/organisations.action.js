"use server";

import { auth } from "@/lib/auth";
import { hasGlobalPermission } from "@/lib/auth-access";
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
    if (!(await hasGlobalPermission({ resource: "organizations:delete" }))) {
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
