"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerUrl } from "@/lib/server-url";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function createCheckoutSessionAction({
    priceId,
    organizationId,
    quantity,
    successUrl,
    cancelUrl,
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const baseUrl = getServerUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: quantity ?? 1,
                adjustable_quantity: {
                    enabled: false,
                },
            },
        ],
        success_url: successUrl ?? `${baseUrl}/dashboard`,
        cancel_url: cancelUrl ?? `${baseUrl}/dashboard`,
        client_reference_id: organizationId,
        metadata: {
            userId: session.user.id,
            organizationId: organizationId ?? "",
        },
        subscription_data: {
            metadata: {
                organizationId: organizationId ?? "",
            },
        },
        billing_address_collection: "required",
        tax_id_collection: {
            enabled: true,
        },
    });

    return { url: checkoutSession.url };
}

export async function createPortalSessionAction({ customerId, returnUrl }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const baseUrl = getServerUrl();
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl ?? `${baseUrl}/dashboard`,
    });

    return { url: portalSession.url };
}

export async function getSubscriptionAction({ subscriptionId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return subscription;
}

export async function cancelSubscriptionAction({ subscriptionId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return subscription;
}

/**
 * Get active subscription for an organization
 */
export async function getOrganizationSubscriptionAction({ organizationId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
        include: {
            organization: true,
        },
    });

    return subscription;
}

/**
 * Create or update subscription in database from Stripe data
 */
export async function upsertSubscriptionFromStripeAction({
    stripeSubscription,
    organizationId,
}) {
    console.log("🔄 upsertSubscriptionFromStripeAction called");
    console.log("Organization ID:", organizationId);
    console.log("Stripe Subscription ID:", stripeSubscription.id);
    console.log("Stripe Customer ID:", stripeSubscription.customer);
    console.log("Subscription status:", stripeSubscription.status);

    const price = stripeSubscription.items.data[0]?.price;
    console.log("Price ID:", price?.id);
    console.log("Price amount:", price?.unit_amount);
    console.log("Price currency:", price?.currency);

    const subscriptionData = {
        plan: price?.id ?? "default",
        stripeCustomerId: stripeSubscription.customer,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(
            stripeSubscription.current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000)
            : null,
        trialStart: stripeSubscription.trial_start
            ? new Date(stripeSubscription.trial_start * 1000)
            : null,
        trialEnd: stripeSubscription.trial_end
            ? new Date(stripeSubscription.trial_end * 1000)
            : null,
        seats: stripeSubscription.items.data[0]?.quantity ?? 1,
        currency: price?.currency ?? null,
        amount: price?.unit_amount ?? null,
        interval: price?.recurring?.interval ?? null,
    };

    console.log("Subscription data to upsert:", JSON.stringify(subscriptionData, null, 2));

    try {
        const subscription = await prisma.subscription.upsert({
            where: {
                referenceId: organizationId,
            },
            update: subscriptionData,
            create: {
                ...subscriptionData,
                referenceId: organizationId,
            },
        });

        console.log("✅ Subscription upserted successfully with ID:", subscription.id);
        return subscription;
    } catch (error) {
        console.error("❌ Error upserting subscription:", error);
        throw error;
    }
}

/**
 * Update subscription quantity (seats) on Stripe
 * Note: This function is called from Better-Auth hooks (no user session)
 */
export async function updateSubscriptionQuantityAction({
    organizationId,
    quantity,
}) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
    });

    if (!subscription?.stripeSubscriptionId) {
        // Pas d'abonnement actif, ne rien faire silencieusement
        console.log(
            "No active subscription found for organization:",
            organizationId
        );
        return { success: false, reason: "no_subscription" };
    }

    // Get the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
    );

    // Update the quantity of the first item (assuming single item subscription)
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;

    if (!subscriptionItemId) {
        console.error("No subscription item found for:", subscription.id);
        return { success: false, reason: "no_subscription_item" };
    }

    await stripe.subscriptionItems.update(subscriptionItemId, {
        quantity: quantity,
    });

    // Update local database
    await prisma.subscription.update({
        where: {
            id: subscription.id,
        },
        data: {
            seats: quantity,
        },
    });

    return { success: true };
}

/**
 * Get subscription details from Stripe
 */
export async function getStripeSubscriptionDetailsAction({ organizationId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
    });

    if (!subscription?.stripeSubscriptionId) {
        return null;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
        {
            expand: ["default_payment_method", "latest_invoice"],
        }
    );

    return stripeSubscription;
}

/**
 * Get invoices for an organization from Stripe
 */
export async function getOrganizationInvoicesAction({
    organizationId,
    limit = 10,
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
    });

    if (!subscription?.stripeCustomerId) {
        return [];
    }

    const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: limit,
    });

    return invoices.data;
}

/**
 * Delete subscription from database
 */
export async function deleteSubscriptionAction({ organizationId }) {
    await prisma.subscription.delete({
        where: {
            referenceId: organizationId,
        },
    });

    return { success: true };
}
