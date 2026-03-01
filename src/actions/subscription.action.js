"use server";

import { headers } from "next/headers";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { SiteConfig } from "@/site-config";
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
                    expand: ["product", "tiers"],
                });

                // Récupérer le prix annuel si disponible
                let annualPrice = null;
                if (plan.annualDiscountPriceId) {
                    annualPrice = await stripe.prices.retrieve(plan.annualDiscountPriceId, {
                        expand: ["product", "tiers"],
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

                const mapTiers = tiers =>
                    tiers?.map(t => ({
                        up_to: t.up_to,
                        unit_amount: t.unit_amount,
                        flat_amount: t.flat_amount,
                    })) ?? null;

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
                        tiersMode: monthlyPrice.tiers_mode ?? null,
                        tiers: mapTiers(monthlyPrice.tiers),
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
                              tiersMode: annualPrice.tiers_mode ?? null,
                              tiers: mapTiers(annualPrice.tiers),
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
export async function createCheckoutSession({ planId, annual = false, seats }) {
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
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
            seats:
                plan.name === "team"
                    ? memberCount
                    : SiteConfig.quota?.enabled && seats
                      ? seats
                      : undefined,
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

/**
 * Crée une session du portail de facturation Stripe pour gérer l'abonnement
 */
export async function createBillingPortalSession() {
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    const data = await auth.api.createBillingPortal({
        body: {
            referenceId: organization.id,
            returnUrl: `${getServerUrl()}/dashboard/org/subscription`,
        },
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    return data;
}

/**
 * Récupère les informations détaillées de l'abonnement depuis Stripe
 */
export async function getSubscriptionDetails(subscriptionId) {
    await requirePermission({
        permissions: { billing: ["manage"] },
    });

    try {
        // Récupérer l'abonnement avec toutes les informations liées
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["default_payment_method", "items.data.price.product", "latest_invoice"],
        });

        // Récupérer les 5 dernières factures
        const invoices = await stripe.invoices.list({
            subscription: subscriptionId,
            limit: 5,
        });

        // Récupérer le prix et le produit
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId, {
            expand: ["product", "tiers"],
        });

        // Depuis l'API 2025-03-31, les dates sont dans les items
        const firstItem = subscription.items.data[0];

        // Retourner uniquement les données sérialisables nécessaires
        return {
            subscription: {
                id: subscription.id,
                status: subscription.status,
                // Les dates sont maintenant dans les items depuis API 2025-03-31
                current_period_start: firstItem.current_period_start,
                current_period_end: firstItem.current_period_end,
                trial_start: subscription.trial_start,
                trial_end: subscription.trial_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: subscription.canceled_at,
                customer: subscription.customer,
                items: {
                    data: subscription.items.data.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        current_period_start: item.current_period_start,
                        current_period_end: item.current_period_end,
                        price: {
                            id: item.price.id,
                        },
                    })),
                },
            },
            invoices: invoices.data.map(invoice => ({
                id: invoice.id,
                number: invoice.number,
                status: invoice.status,
                created: invoice.created,
                amount_paid: invoice.amount_paid,
                currency: invoice.currency,
                invoice_pdf: invoice.invoice_pdf,
            })),
            price: {
                id: price.id,
                unit_amount: price.unit_amount,
                currency: price.currency,
                tiersMode: price.tiers_mode ?? null,
                tiers: price.tiers
                    ? price.tiers.map(t => ({
                          up_to: t.up_to,
                          unit_amount: t.unit_amount,
                          flat_amount: t.flat_amount,
                      }))
                    : null,
                recurring: {
                    interval: price.recurring?.interval,
                    interval_count: price.recurring?.interval_count,
                },
            },
            product: {
                id: price.product.id,
                name: price.product.name,
                description: price.product.description,
            },
        };
    } catch (error) {
        console.error("Error fetching subscription details from Stripe:", error);
        throw new Error("Failed to fetch subscription details");
    }
}

/**
 * Crée une session du portail Stripe pour gérer l'abonnement
 */
export async function createStripePortalSession(formData) {
    const referenceId = formData.get("referenceId");

    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    if (organization.id !== referenceId) {
        throw new Error("Unauthorized");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: formData.get("customerId"),
        return_url: `${getServerUrl()}/dashboard/org/subscription`,
    });

    return { url: session.url };
}
