import prisma from "@/lib/prisma";

/**
 * Calcule le quota d'une organisation basé sur subscription.seats.
 *
 * @param {string} organizationId
 * @param {function} usageCountFn - async (orgId) => number
 * @returns {Promise<{limit: number, used: number, remaining: number, canAdd: boolean, percentage: number}>}
 */
export async function getOrganizationQuota(organizationId, usageCountFn) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: { in: ["active", "trialing"] },
        },
    });

    const limit = subscription?.seats ?? 0;
    const used = await usageCountFn(organizationId);
    const remaining = Math.max(0, limit - used);

    return {
        limit,
        used,
        remaining,
        canAdd: used < limit,
        percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
    };
}
