/**
 * ============================================================
 * 🌱 PRISMA SEED - Demo Stripe Plans
 * ============================================================
 *
 * This seed script populates the database with demo Stripe plans.
 * These are TEMPLATES - you must replace the priceId values with
 * real Stripe Price IDs from your Stripe Dashboard.
 *
 * How to use:
 *   1. Replace the priceId values below with your actual Stripe Price IDs
 *   2. Run: bunx prisma db seed
 *
 * To find your Stripe Price IDs:
 *   - Go to https://dashboard.stripe.com/products
 *   - Create products and prices
 *   - Copy the "price_..." IDs
 *
 * For local testing with Stripe CLI:
 *   - Run: stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
 *   - Use test mode price IDs (price_test_...)
 * ============================================================
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// 📦 DEMO PLANS CONFIGURATION
// Replace priceId values with your real Stripe Price IDs
// ============================================================

const DEMO_PLANS = [
    {
        // ── Starter Plan ─────────────────────────────────────
        name: "Starter",
        description: [
            "## Plan Starter",
            "",
            "Idéal pour démarrer :",
            "- ✅ 1 organisation",
            "- ✅ Jusqu'à 3 membres",
            "- ✅ 5 projets maximum",
            "- ✅ Support par email",
        ].join("\n"),

        // 🔴 TODO: Replace with your real Stripe monthly price ID
        priceId: "price_starter_monthly_REPLACE_ME",

        // 🔴 TODO: Replace with your real Stripe annual price ID (optional)
        annualDiscountPriceId: "price_starter_annual_REPLACE_ME",

        // Business limits enforced by your app logic
        limits: JSON.stringify({
            members: 3,
            projects: 5,
            storage_gb: 1,
        }),

        // Free trial: 14 days
        freeTrial: JSON.stringify({ days: 14 }),

        showInPricingPage: true,
    },

    {
        // ── Pro Plan ──────────────────────────────────────────
        name: "Pro",
        description: [
            "## Plan Pro",
            "",
            "Pour les équipes qui grandissent :",
            "- ✅ 3 organisations",
            "- ✅ Jusqu'à 15 membres",
            "- ✅ Projets illimités",
            "- ✅ Support prioritaire",
            "- ✅ Analytics avancés",
        ].join("\n"),

        // 🔴 TODO: Replace with your real Stripe monthly price ID
        priceId: "price_pro_monthly_REPLACE_ME",

        // 🔴 TODO: Replace with your real Stripe annual price ID (optional)
        annualDiscountPriceId: "price_pro_annual_REPLACE_ME",

        limits: JSON.stringify({
            members: 15,
            projects: -1, // -1 = unlimited
            storage_gb: 20,
        }),

        // Free trial: 7 days
        freeTrial: JSON.stringify({ days: 7 }),

        showInPricingPage: true,
    },

    {
        // ── Team Plan (per-seat pricing) ──────────────────────
        // ⚠️  Better-Auth detects "team" plan name for per-seat billing
        name: "Team",
        description: [
            "## Plan Team",
            "",
            "Tarification par siège pour les grandes équipes :",
            "- ✅ Organisations illimitées",
            "- ✅ Membres illimités",
            "- ✅ Projets illimités",
            "- ✅ Support dédié 24/7",
            "- ✅ SSO & SAML",
            "- ✅ Audit logs",
        ].join("\n"),

        // 🔴 TODO: Replace with your real Stripe monthly per-seat price ID
        priceId: "price_team_monthly_REPLACE_ME",

        // 🔴 TODO: Replace with your real Stripe annual per-seat price ID (optional)
        annualDiscountPriceId: "price_team_annual_REPLACE_ME",

        limits: JSON.stringify({
            members: -1, // unlimited
            projects: -1, // unlimited
            storage_gb: -1, // unlimited
        }),

        // No free trial for team plan
        freeTrial: null,

        showInPricingPage: true,
    },
];

async function main() {
    console.log("🌱 Seeding demo Stripe plans...\n");

    for (const plan of DEMO_PLANS) {
        const existing = await prisma.plan.findUnique({
            where: { name: plan.name },
        });

        if (existing) {
            console.log(`⚠️  Plan "${plan.name}" already exists — updating...`);
            await prisma.plan.update({
                where: { name: plan.name },
                data: plan,
            });
        } else {
            await prisma.plan.create({ data: plan });
            console.log(`✅ Created plan: ${plan.name}`);
        }
    }

    console.log("\n✨ Seed complete!");
    console.log(
        "\n⚠️  IMPORTANT: Replace all 'REPLACE_ME' priceId values with real Stripe Price IDs."
    );
    console.log("   See: https://dashboard.stripe.com/products");
}

main()
    .catch(e => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
