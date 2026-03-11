"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateQuotaQuantity } from "@/lib/quota";
import { getServerUrl } from "@/lib/server-url";
import stripe from "@/lib/stripe";
import {
    getValidatedPlanStripePricing,
    StripePlanValidationError,
} from "@/lib/stripe-plan-pricing";
import { SiteConfig } from "@/site-config";

function parsePlanLimits(limitsJson) {
    if (!limitsJson) {
        return {};
    }

    try {
        return JSON.parse(limitsJson);
    } catch (error) {
        console.error("Error parsing limits:", error);
        return {};
    }
}

function parseFreeTrialDays(freeTrialJson) {
    if (!freeTrialJson) {
        return null;
    }

    try {
        const freeTrial = JSON.parse(freeTrialJson);
        return freeTrial.days ?? null;
    } catch (error) {
        console.error("Error parsing freeTrial:", error);
        return null;
    }
}

function shouldBlockAnnualCheckout(error) {
    return (
        error instanceof StripePlanValidationError ||
        (error instanceof Error && error.message === "ANNUAL_PRICE_MORE_EXPENSIVE")
    );
}

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
                const { monthlyPrice, annualPrice, annualComparison, annualValidationError } =
                    await getValidatedPlanStripePricing({
                        priceId: plan.priceId,
                        annualDiscountPriceId: plan.annualDiscountPriceId,
                        allowInvalidAnnual: true,
                    });

                if (annualValidationError) {
                    console.error(`Invalid annual Stripe price for plan ${plan.name}:`, {
                        code: annualValidationError.code,
                        details: annualValidationError.details,
                    });
                }

                return {
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    limits: parsePlanLimits(plan.limits),
                    freeTrialDays: parseFreeTrialDays(plan.freeTrial),
                    monthlyPrice,
                    annualPrice,
                    annualComparison,
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
    const t = await getTranslations("organization.subscription");

    const plan = await prisma.plan.findUnique({
        where: {
            id: planId,
        },
    });

    if (!plan) {
        throw new Error("Plan not found");
    }

    // The Team plan is identified by name and must remain case-insensitive to stay aligned with UI behavior.
    const isTeamPlan = plan.name.trim().toLowerCase() === "team";

    const normalizedSeats =
        isTeamPlan || !SiteConfig.quota?.enabled
            ? undefined
            : validateQuotaQuantity(seats, {
                  minimum: SiteConfig.quota.minimum,
                  step: SiteConfig.quota.step,
              });

    if (annual) {
        if (!plan.annualDiscountPriceId) {
            throw new Error(t("annual_checkout_unavailable"));
        }

        try {
            const { annualComparison } = await getValidatedPlanStripePricing({
                priceId: plan.priceId,
                annualDiscountPriceId: plan.annualDiscountPriceId,
            });

            if (annualComparison?.isMoreExpensive) {
                throw new Error("ANNUAL_PRICE_MORE_EXPENSIVE");
            }
        } catch (error) {
            if (shouldBlockAnnualCheckout(error)) {
                throw new Error(t("annual_checkout_unavailable"));
            }

            throw error;
        }
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
            seats: isTeamPlan ? memberCount : normalizedSeats,
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
