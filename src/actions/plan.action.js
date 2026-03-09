"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import {
    getValidatedPlanStripePricing,
    StripePlanValidationError,
} from "@/lib/stripe-plan-pricing";

function getPlanPersistenceData({
    name,
    description,
    priceId,
    annualDiscountPriceId,
    limits,
    freeTrial,
    showInPricingPage,
}) {
    const limitsJson = limits && Object.keys(limits).length > 0 ? JSON.stringify(limits) : null;
    const freeTrialJson = freeTrial ? JSON.stringify({ days: parseInt(freeTrial, 10) }) : null;

    return {
        name,
        description: description || null,
        priceId,
        annualDiscountPriceId: annualDiscountPriceId || null,
        limits: limitsJson,
        freeTrial: freeTrialJson,
        showInPricingPage: showInPricingPage ?? true,
    };
}

function getStripeValidationMessage(t, error) {
    if (!(error instanceof StripePlanValidationError)) {
        return null;
    }

    switch (error.code) {
        case "price_not_found":
            return t("validation_stripe_price_not_found", {
                priceId: error.details?.priceId ?? "",
            });
        case "price_lookup_failed":
            return t("validation_stripe_price_lookup_failed", {
                priceId: error.details?.priceId ?? "",
            });
        case "price_inactive":
            return t("validation_stripe_price_inactive", {
                priceId: error.details?.priceId ?? "",
            });
        case "price_not_recurring":
            return t("validation_stripe_price_not_recurring", {
                priceId: error.details?.priceId ?? "",
            });
        case "monthly_interval_invalid":
            return t("validation_stripe_monthly_interval");
        case "annual_interval_invalid":
            return t("validation_stripe_annual_interval");
        case "product_mismatch":
            return t("validation_stripe_product_mismatch");
        case "currency_mismatch":
            return t("validation_stripe_currency_mismatch");
        case "billing_scheme_mismatch":
            return t("validation_stripe_billing_scheme_mismatch");
        case "tiers_mode_mismatch":
            return t("validation_stripe_tiers_mode_mismatch");
        case "annual_more_expensive":
            return t("validation_stripe_annual_more_expensive");
        default:
            return null;
    }
}

async function validatePlanStripeConfiguration(t, { priceId, annualDiscountPriceId }) {
    try {
        const { annualComparison } = await getValidatedPlanStripePricing({
            priceId,
            annualDiscountPriceId,
        });

        if (annualComparison?.isMoreExpensive) {
            throw new StripePlanValidationError("annual_more_expensive");
        }
    } catch (error) {
        const message = getStripeValidationMessage(t, error);

        if (message) {
            throw new Error(message);
        }

        throw error;
    }
}

function revalidatePlanPaths() {
    revalidatePath("/dashboard/admin/plans");
    revalidatePath("/dashboard/org/subscription");
}

/**
 * Récupère tous les plans
 */
export async function getPlansAction() {
    await requireAdmin();

    const plans = await prisma.plan.findMany({
        orderBy: {
            name: "asc",
        },
    });

    return plans;
}

/**
 * Crée un nouveau plan
 */
export async function createPlanAction({
    name,
    description,
    priceId,
    annualDiscountPriceId,
    limits,
    freeTrial,
    showInPricingPage,
}) {
    await requireAdmin();
    const t = await getTranslations("admin.plans");

    await validatePlanStripeConfiguration(t, {
        priceId,
        annualDiscountPriceId,
    });

    const plan = await prisma.plan.create({
        data: getPlanPersistenceData({
            name,
            description,
            priceId,
            annualDiscountPriceId,
            limits,
            freeTrial,
            showInPricingPage,
        }),
    });

    revalidatePlanPaths();

    return plan;
}

/**
 * Met à jour un plan existant
 */
export async function updatePlanAction({
    planId,
    name,
    description,
    priceId,
    annualDiscountPriceId,
    limits,
    freeTrial,
    showInPricingPage,
}) {
    await requireAdmin();
    const t = await getTranslations("admin.plans");

    await validatePlanStripeConfiguration(t, {
        priceId,
        annualDiscountPriceId,
    });

    const plan = await prisma.plan.update({
        where: {
            id: planId,
        },
        data: getPlanPersistenceData({
            name,
            description,
            priceId,
            annualDiscountPriceId,
            limits,
            freeTrial,
            showInPricingPage,
        }),
    });

    revalidatePlanPaths();

    return plan;
}

/**
 * Supprime un plan
 */
export async function deletePlanAction({ planId }) {
    await requireAdmin();

    await prisma.plan.delete({
        where: {
            id: planId,
        },
    });

    revalidatePlanPaths();

    return { success: true };
}
