// src/lib/billing-limits.js
import { PrismaClient } from "@/generated/prisma";
import { SiteConfig } from "@/site-config";

const prisma = new PrismaClient();

/**
 * Get the usage limit for an organization
 * Returns the limit based on billing type:
 * - "seat": Number of members allowed
 * - "plan": Number of usage units allowed (from subscription.seats)
 * - "subscription": Unlimited (returns Infinity)
 *
 * @param {string} organizationId - The organization ID
 * @returns {Promise<number>} The usage limit
 */
export async function getUsageLimit(organizationId) {
    if (SiteConfig.billing.type === "subscription") {
        // Mode subscription: pas de limite
        return Infinity;
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: {
                in: ["active", "trialing"],
            },
        },
    });

    if (!subscription) {
        return 0; // Pas d'abonnement = pas de limite
    }

    return subscription.seats ?? 0;
}

/**
 * Get the current usage for an organization
 * You should implement this function based on what you're tracking in your app.
 * Examples:
 * - For vehicles: Count rows in a "vehicles" table
 * - For documents: Count rows in a "documents" table
 * - For projects: Count rows in a "projects" table
 *
 * @param {string} organizationId - The organization ID
 * @returns {Promise<number>} The current usage count
 * @example
 * export async function getCurrentUsage(organizationId) {
 *     return await prisma.vehicle.count({
 *         where: { organizationId }
 *     });
 * }
 */
export async function getCurrentUsage(organizationId) {
    // TODO: Implement this based on your application's needs
    // This is a placeholder that counts members (for demo purposes)

    const memberCount = await prisma.member.count({
        where: {
            organizationId,
        },
    });

    return memberCount;
}

/**
 * Check if an organization can add more usage
 * Returns true if current usage is below the limit
 *
 * @param {string} organizationId - The organization ID
 * @returns {Promise<boolean>} Whether the organization can add usage
 */
export async function canAddUsage(organizationId) {
    if (SiteConfig.billing.type === "subscription") {
        // Mode subscription: toujours autorisé
        return true;
    }

    const limit = await getUsageLimit(organizationId);
    const current = await getCurrentUsage(organizationId);

    return current < limit;
}

/**
 * Get usage stats for an organization
 * Returns detailed information about usage and limits
 *
 * @param {string} organizationId - The organization ID
 * @returns {Promise<{current: number, limit: number, remaining: number, canAdd: boolean}>}
 */
export async function getUsageStats(organizationId) {
    const limit = await getUsageLimit(organizationId);
    const current = await getCurrentUsage(organizationId);
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - current);
    const canAdd = current < limit;

    return {
        current,
        limit,
        remaining,
        canAdd,
    };
}
