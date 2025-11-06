"use server";

import { headers } from "next/headers";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { auth } from "../lib/auth";
import { getServerUrl } from "../lib/server-url";

/**
 * Récupère tous les plans avec leurs informations Stripe
 */
export async function getPlansWithStripeData() {
    await requireActiveOrganization();

    // Récupérer tous les plans de la base de données
    const plans = await prisma.plan.findMany({
        where: {
            showInPricingPage: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Pour chaque plan, récupérer les informations de prix depuis Stripe
    const plansWithStripeData = await Promise.all(
        plans.map(async plan => {
            try {
                // Récupérer le prix mensuel avec les informations du produit
                const monthlyPrice = await stripe.prices.retrieve(plan.priceId, {
                    expand: ["product"],
                });

                // Récupérer le prix annuel si disponible
                let annualPrice = null;
                if (plan.annualDiscountPriceId) {
                    annualPrice = await stripe.prices.retrieve(plan.annualDiscountPriceId, {
                        expand: ["product"],
                    });
                }

                // Parser les limites JSON
                let limits = {};
                if (plan.limits) {
                    try {
                        limits = JSON.parse(plan.limits);
                    } catch (e) {
                        console.error("Error parsing limits:", e);
                    }
                }

                // Parser le free trial JSON
                let freeTrialDays = null;
                if (plan.freeTrial) {
                    try {
                        const freeTrialObj = JSON.parse(plan.freeTrial);
                        freeTrialDays = freeTrialObj.days;
                    } catch (e) {
                        console.error("Error parsing freeTrial:", e);
                    }
                }

                return {
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    limits,
                    freeTrialDays,
                    monthlyPrice: {
                        id: monthlyPrice.id,
                        amount: monthlyPrice.unit_amount,
                        currency: monthlyPrice.currency,
                        product: {
                            id: monthlyPrice.product.id,
                            name: monthlyPrice.product.name,
                            description: monthlyPrice.product.description,
                            metadata: monthlyPrice.product.metadata,
                        },
                    },
                    annualPrice: annualPrice
                        ? {
                              id: annualPrice.id,
                              amount: annualPrice.unit_amount,
                              currency: annualPrice.currency,
                              product: {
                                  id: annualPrice.product.id,
                                  name: annualPrice.product.name,
                                  description: annualPrice.product.description,
                                  metadata: annualPrice.product.metadata,
                              },
                          }
                        : null,
                };
            } catch (error) {
                console.error(`Error fetching Stripe data for plan ${plan.name}:`, error);
                return null;
            }
        })
    );

    // Filtrer les plans qui ont échoué
    return plansWithStripeData.filter(plan => plan !== null);
}

/**
 * Récupère le nombre de membres dans l'organisation active
 */
export async function getOrganizationMemberCount() {
    const { organization } = await requireActiveOrganization();

    const memberCount = await prisma.member.count({
        where: {
            organizationId: organization.id,
        },
    });

    return memberCount;
}

/**
 * Crée une session de checkout Stripe pour s'abonner à un plan
 * Valide le priceId et la quantité côté serveur pour éviter les manipulations
 */
export async function createCheckoutSession({ planId, annual = false }) {
    const { organization } = await requirePermission({
        permissions: { billing: ["update"] },
    });

    const plan = await prisma.plan.findUnique({
        where: {
            id: planId,
        },
    });

    if (!plan) {
        throw new Error("Plan not found");
    }

    const memberCount = await prisma.member.count({
        where: {
            organizationId: organization.id,
        },
    });

    const data = await auth.api.upgradeSubscription({
        body: {
            plan: plan.name,
            annual: annual,
            referenceId: organization.id,
            seats: plan.name === "team" ? memberCount : undefined,
            successUrl: `${getServerUrl()}/dashboard/org/subscription?success=true`,
            cancelUrl: `${getServerUrl()}/dashboard/org/subscription?canceled=true`,
            returnUrl: `${getServerUrl()}/dashboard/org/subscription`,
            disableRedirect: false, // required
        },
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    return data;
}
