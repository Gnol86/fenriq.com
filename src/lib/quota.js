import { requireActiveOrganization } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { SiteConfig } from "@/site-config";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"];

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
 * Récupère l'abonnement actif d'une organisation basé sur subscription.seats.
 *
 * @param {string} organizationId
 * @returns {Promise<Object|null>}
 */
async function getOrganizationActiveSubscription(organizationId) {
    return await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: {
                in: ACTIVE_SUBSCRIPTION_STATUSES,
            },
        },
        orderBy: {
            periodStart: "desc",
        },
    });
}

/**
 * Calcule le quota d'une organisation basé sur subscription.seats.
 *
 * @param {Object} params
 * @param {string} [params.organizationId]
 * @param {function} params.usageCountFn - async (orgId) => number
 * @param {number} [params.inactiveLimit]
 * @returns {Promise<{limit: number, used: number, remaining: number, canAdd: boolean, ok: boolean, hasActiveSubscription: boolean, isFallback: boolean}>}
 */
export async function getQuota({ organizationId, usageCountFn, inactiveLimit } = {}) {
    if (typeof usageCountFn !== "function") {
        throw new Error("usageCountFn doit être une fonction");
    }

    const resolvedOrganizationId =
        organizationId ?? (await requireActiveOrganization()).organization.id;
    const subscription = await getOrganizationActiveSubscription(resolvedOrganizationId);
    const resolvedInactiveLimit = inactiveLimit ?? SiteConfig.quota?.inactiveLimit ?? 1;
    const limit = subscription?.seats ?? resolvedInactiveLimit;
    const used = await usageCountFn(resolvedOrganizationId);
    const remaining = Math.max(0, limit - used);

    return {
        limit,
        used,
        remaining,
        canAdd: used < limit,
        ok: used <= limit,
        hasActiveSubscription: !!subscription,
        isFallback: !subscription,
    };
}

/**
 * Wrapper de compatibilité pour les usages qui fournissent directement organizationId.
 *
 * @param {string} organizationId
 * @param {function} usageCountFn - async (orgId) => number
 * @param {Object} [options]
 * @param {number} [options.inactiveLimit]
 * @returns {Promise<{limit: number, used: number, remaining: number, canAdd: boolean, ok: boolean, hasActiveSubscription: boolean, isFallback: boolean}>}
 */
export async function getOrganizationQuota(organizationId, usageCountFn, options = {}) {
    return await getQuota({
        organizationId,
        usageCountFn,
        inactiveLimit: options.inactiveLimit,
    });
}
