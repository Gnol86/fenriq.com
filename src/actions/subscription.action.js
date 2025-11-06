"use server";

import { requireActiveOrganization } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

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
export async function createCheckoutSession({ planId, billingInterval = "monthly" }) {
    const { organization, user } = await requireActiveOrganization();

    // Récupérer le plan depuis la base de données
    const plan = await prisma.plan.findUnique({
        where: { id: planId },
    });

    if (!plan) {
        throw new Error("Plan introuvable");
    }

    // Déterminer le priceId correct selon l'intervalle de facturation
    let priceId;
    if (billingInterval === "annual" && plan.annualDiscountPriceId) {
        priceId = plan.annualDiscountPriceId;
    } else {
        priceId = plan.priceId;
    }

    // Calculer la quantité en fonction du type de plan
    let quantity = 1;
    if (plan.name.toLowerCase() === "team") {
        // Pour le plan Team, compter le nombre de membres
        const memberCount = await prisma.member.count({
            where: {
                organizationId: organization.id,
            },
        });
        quantity = memberCount;
    }

    // Créer l'URL de retour
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/dashboard/org/subscription?success=true`;
    const cancelUrl = `${baseUrl}/dashboard/org/subscription?canceled=true`;

    try {
        // Créer la session de checkout
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: user.email,
            metadata: {
                organizationId: organization.id,
                userId: user.id,
                planId: plan.id,
            },
            subscription_data: {
                metadata: {
                    organizationId: organization.id,
                    planId: plan.id,
                },
            },
        });
        return { url: session.url };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Impossible de créer la session de paiement");
    }
}
