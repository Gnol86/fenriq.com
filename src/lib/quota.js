import prisma from "@/lib/prisma";

function normalizeQuantity(quantity) {
    if (typeof quantity === "string") {
        const trimmedQuantity = quantity.trim();

        if (!/^\d+$/.test(trimmedQuantity)) {
            return Number.NaN;
        }

        return Number(trimmedQuantity);
    }

    if (typeof quantity === "number") {
        return quantity;
    }

    return Number.NaN;
}

export function validateQuotaQuantity(quantity, { minimum = 1, step = 1 } = {}) {
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!Number.isFinite(normalizedQuantity) || !Number.isInteger(normalizedQuantity)) {
        throw new Error("La quantité doit être un entier valide");
    }

    if (normalizedQuantity < minimum) {
        throw new Error(`Minimum ${minimum} unités`);
    }

    if (step && step > 1 && normalizedQuantity % step !== 0) {
        throw new Error(`La quantité doit être un multiple de ${step}`);
    }

    return normalizedQuantity;
}

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
