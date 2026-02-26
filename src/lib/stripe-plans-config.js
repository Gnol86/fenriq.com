/**
 * ============================================================
 * 💳 STRIPE PLANS CONFIGURATION
 * ============================================================
 *
 * This file documents the plan structure used by this boilerplate.
 * Plans are stored in the database (table `plan`) and loaded dynamically
 * by Better-Auth for Stripe subscription management.
 *
 * ── HOW IT WORKS ─────────────────────────────────────────────
 *
 * 1. Plans are created via the Admin UI (/dashboard/admin/plans)
 *    OR via the seed script (prisma/seed.js)
 *
 * 2. Better-Auth reads plans from the DB and syncs with Stripe
 *
 * 3. The frontend fetches plans via Stripe's price API
 *    (see /dashboard/org/subscription)
 *
 * ── SETUP FOR A NEW PROJECT ──────────────────────────────────
 *
 * Step 1: Create your products in Stripe Dashboard
 *   https://dashboard.stripe.com/products
 *
 * Step 2: Copy the Price IDs (format: price_xxxxxxxx)
 *   - Monthly price → priceId
 *   - Annual price  → annualDiscountPriceId (optional)
 *
 * Step 3: Update prisma/seed.js with your real Price IDs
 *
 * Step 4: Run the seed:
 *   bunx prisma db seed
 *
 * ── PLAN STRUCTURE ───────────────────────────────────────────
 *
 * Each plan stored in DB has these fields:
 *
 *   name                  - Unique plan name (e.g., "Starter", "Pro", "Team")
 *   description           - Markdown description shown in pricing cards
 *   priceId               - Stripe Price ID for monthly billing
 *   annualDiscountPriceId - Stripe Price ID for annual billing (optional)
 *   limits                - JSON string of your custom limits (see below)
 *   freeTrial             - JSON string: {"days": 14} or null
 *   showInPricingPage     - Boolean: show/hide in public pricing page
 *
 * ── LIMITS SYSTEM ────────────────────────────────────────────
 *
 * Limits are stored as a JSON string and can contain ANY keys you define.
 * These are YOUR business rules — enforced in your own action code.
 *
 * Example limits schema:
 *   {
 *     "members":     3,   // Max members per org (-1 = unlimited)
 *     "projects":    5,   // Max projects (-1 = unlimited)
 *     "storage_gb":  1,   // Storage in GB (-1 = unlimited)
 *     "api_calls":   1000 // Monthly API calls (-1 = unlimited)
 *   }
 *
 * ── SPECIAL PLAN NAMES ───────────────────────────────────────
 *
 * Better-Auth's Stripe plugin treats the "team" plan name specially:
 *   - Enables per-seat billing (price × number of members)
 *   - The PlanCard component handles the per-seat display automatically
 *
 * ── READING LIMITS IN YOUR CODE ──────────────────────────────
 *
 * Example: Check if org can add more members
 *
 *   import { getOrganizationSubscriptionLimits } from "@/lib/stripe-plans-config";
 *
 *   const limits = await getOrganizationSubscriptionLimits(organizationId);
 *   if (limits.members !== -1 && currentMemberCount >= limits.members) {
 *     throw new Error("Member limit reached for your plan");
 *   }
 *
 * ── ENVIRONMENT VARIABLES ────────────────────────────────────
 *
 *   STRIPE_SECRET_KEY       - Your Stripe secret key (sk_live_... or sk_test_...)
 *   STRIPE_WEBHOOK_SECRET   - Webhook signing secret (whsec_...)
 *   NEXT_PUBLIC_STRIPE_KEY  - Your Stripe publishable key (pk_live_... or pk_test_...)
 *
 * ── TEST MODE ────────────────────────────────────────────────
 *
 * Use Stripe test mode during development:
 *   - Test keys: sk_test_..., pk_test_...
 *   - Test price IDs from: https://dashboard.stripe.com/test/products
 *   - Forward webhooks locally:
 *     stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
 *
 * ============================================================
 */

import prisma from "@/lib/prisma";

/**
 * Parse plan limits from JSON string to object.
 * Returns empty object if limits is null or invalid JSON.
 *
 * @param {string|null} limitsJson
 * @returns {Record<string, number>}
 */
export function parsePlanLimits(limitsJson) {
    if (!limitsJson) return {};
    try {
        return JSON.parse(limitsJson);
    } catch {
        return {};
    }
}

/**
 * Get the subscription limits for an organization.
 * Returns the limits of the organization's current active plan,
 * or an empty object if no active subscription.
 *
 * Usage:
 *   const limits = await getOrganizationSubscriptionLimits(org.id);
 *   if (limits.members !== -1 && memberCount >= limits.members) {
 *     throw new Error("Member limit reached");
 *   }
 *
 * @param {string} organizationId
 * @returns {Promise<Record<string, number>>}
 */
export async function getOrganizationSubscriptionLimits(organizationId) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: { in: ["active", "trialing"] },
        },
    });

    if (!subscription?.plan) return {};

    const plan = await prisma.plan.findUnique({
        where: { name: subscription.plan },
    });

    return parsePlanLimits(plan?.limits ?? null);
}
