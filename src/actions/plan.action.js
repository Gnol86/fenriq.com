"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access-control";
import prisma from "@/lib/prisma";

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

    // Convertir les limites en JSON string si présentes
    const limitsJson = limits && Object.keys(limits).length > 0 ? JSON.stringify(limits) : null;

    // Convertir freeTrial en JSON string si présent
    const freeTrialJson = freeTrial ? JSON.stringify({ days: parseInt(freeTrial, 10) }) : null;

    const plan = await prisma.plan.create({
        data: {
            name,
            description: description || null,
            priceId,
            annualDiscountPriceId: annualDiscountPriceId || null,
            limits: limitsJson,
            freeTrial: freeTrialJson,
            showInPricingPage: showInPricingPage ?? true,
        },
    });

    revalidatePath("/dashboard/admin/plans");

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

    // Convertir les limites en JSON string si présentes
    const limitsJson = limits && Object.keys(limits).length > 0 ? JSON.stringify(limits) : null;

    // Convertir freeTrial en JSON string si présent
    const freeTrialJson = freeTrial ? JSON.stringify({ days: parseInt(freeTrial, 10) }) : null;

    const plan = await prisma.plan.update({
        where: {
            id: planId,
        },
        data: {
            name,
            description: description || null,
            priceId,
            annualDiscountPriceId: annualDiscountPriceId || null,
            limits: limitsJson,
            freeTrial: freeTrialJson,
            showInPricingPage: showInPricingPage ?? true,
        },
    });

    revalidatePath("/dashboard/admin/plans");

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

    revalidatePath("/dashboard/admin/plans");

    return { success: true };
}
