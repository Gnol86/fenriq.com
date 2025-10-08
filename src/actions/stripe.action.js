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
    const price = stripeSubscription.items.data[0]?.price;

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

/**
 * Get license movements since last invoice
 * Returns added and removed licenses with details from Stripe
 */
export async function getLicenseMovementsSinceLastInvoiceAction({
    organizationId,
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Get subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
    });

    if (
        !subscription?.stripeCustomerId ||
        !subscription?.stripeSubscriptionId
    ) {
        return null;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
        {
            expand: ["items.data.price"],
        }
    );

    const subscriptionItem = stripeSubscription.items.data[0];
    const price = subscriptionItem?.price ?? null;
    const currency = price?.currency ?? subscription.currency ?? null;
    const unitAmount = price?.unit_amount ?? subscription.amount ?? 0;
    const currentSeats = subscriptionItem?.quantity ?? 0;

    // Get last invoice from Stripe (paid)
    const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: 1,
        status: "paid",
        expand: ["data.lines"],
    });

    const lastInvoice = invoices.data[0];

    if (!lastInvoice) {
        return null;
    }

    const lastInvoiceDate = new Date(lastInvoice.created * 1000);

    // Try to derive the quantity billed on the last invoice for this price
    const lastInvoiceQuantity =
        lastInvoice.lines?.data?.find(
            line => !line.proration && line.price?.id === price?.id
        )?.quantity ??
        lastInvoice.lines?.data?.[0]?.quantity ??
        0;

    // Helper to split a total amount (in cents) across N licenses without losing cents
    const splitAmountAcrossQuantity = (totalAmount, quantity) => {
        const qty = Math.max(Math.abs(quantity ?? 1), 1);
        const base = Math.trunc(totalAmount / qty);
        const remainder = totalAmount - base * qty;

        return Array.from({ length: qty }, (_, index) => {
            if (totalAmount >= 0) {
                return base + (index < remainder ? 1 : 0);
            }

            return base - (index < Math.abs(remainder) ? 1 : 0);
        });
    };

    let upcomingInvoice = null;

    try {
        upcomingInvoice = await stripe.invoices.createPreview({
            customer: subscription.stripeCustomerId,
            subscription: subscription.stripeSubscriptionId,
        });
    } catch (error) {
        // Silently handle error
    }

    const lastInvoiceTimestamp = lastInvoice.created;

    const allLines = upcomingInvoice?.lines?.data ?? [];

    const baseLineItems = allLines
        .filter(line => !line.proration)
        .map(line => ({
            id: line.id,
            amount: line.amount ?? 0,
            quantity: line.quantity ?? 0,
            unitAmount: line.price?.unit_amount ?? null,
            currency: line.currency ?? currency,
            description: line.description ?? null,
            periodStart: line.period?.start ?? null,
            periodEnd: line.period?.end ?? null,
        }));

    const baseAmountFromPreview = baseLineItems.reduce(
        (sum, item) => sum + (item.amount ?? 0),
        0
    );

    const prorationLines = allLines.filter(line => {
        if (!line.proration) {
            return false;
        }

        if (
            line.period?.start &&
            line.period.start <= lastInvoiceTimestamp
        ) {
            // Ignore proration rows that happened before the last invoice
            return false;
        }

        return true;
    });

    const eventMap = new Map();

    prorationLines.forEach(line => {
        const eventKey = line.period?.start ?? line.id;
        if (!eventMap.has(eventKey)) {
            eventMap.set(eventKey, {
                key: eventKey,
                occurredAt: new Date(
                    (line.period?.start ??
                        stripeSubscription.current_period_start) * 1000
                ).toISOString(),
                lines: [],
            });
        }

        eventMap.get(eventKey).lines.push(line);
    });

    const addedMembers = [];
    const removedMembers = [];

    Array.from(eventMap.values())
        .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt))
        .forEach(event => {
            const { lines, occurredAt, key } = event;

            const totalAmount = lines.reduce(
                (sum, line) => sum + line.amount,
                0
            );
            if (totalAmount === 0) {
                return;
            }

            const positiveLines = lines.filter(line => line.amount > 0);
            const negativeLines = lines.filter(line => line.amount < 0);

            const positiveQuantity = positiveLines.reduce(
                (sum, line) => sum + (line.quantity ?? 0),
                0
            );
            const negativeQuantity = negativeLines.reduce(
                (sum, line) => sum + (line.quantity ?? 0),
                0
            );

            const seatDelta = positiveQuantity - negativeQuantity;

            if (seatDelta === 0) {
                // Quantity change canceled out (price change, etc.)
                return;
            }

            const description =
                positiveLines[0]?.description ??
                negativeLines[0]?.description ??
                lines[0]?.description ??
                null;

            const distributeAmount = (amount, count, type) => {
                const seatAmounts = splitAmountAcrossQuantity(amount, count);
                seatAmounts.forEach((share, index) => {
                    const baseMovement = {
                        id: `${key}-${type}-${index}`,
                        amount: share,
                        description,
                        lineAmount: amount,
                        lineQuantity: count,
                        lineId: String(key),
                        occurredAt,
                    };

                    if (type === "added") {
                        addedMembers.push({
                            ...baseMovement,
                            addedAt: occurredAt,
                        });
                    } else {
                        removedMembers.push({
                            ...baseMovement,
                            removedAt: occurredAt,
                        });
                    }
                });
            };

            if (seatDelta > 0) {
                distributeAmount(totalAmount, seatDelta, "added");
            } else {
                distributeAmount(totalAmount, Math.abs(seatDelta), "removed");
            }
        });

    addedMembers.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    removedMembers.sort(
        (a, b) => new Date(a.removedAt) - new Date(b.removedAt)
    );

    const totalCharges = prorationLines
        .filter(line => line.amount > 0)
        .reduce((sum, line) => sum + line.amount, 0);

    const totalCredits = prorationLines
        .filter(line => line.amount < 0)
        .reduce((sum, line) => sum + Math.abs(line.amount), 0);

    const netAmountToPay = totalCharges - totalCredits;

    const nextBillingDate = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
        : null;

    return {
        lastInvoiceDate: lastInvoiceDate.toISOString(),
        lastInvoiceNumber: lastInvoice.number ?? lastInvoice.id,
        lastInvoiceQuantity,
        currentSeats,
        addedMembers,
        removedMembers,
        removedCount: removedMembers.length,
        netChange: currentSeats - lastInvoiceQuantity,
        totalCredits,
        totalCharges,
        netAmountToPay,
        currency,
        nextBillingDate,
        amount: unitAmount,
        baseLineItems,
        baseAmount: baseAmountFromPreview,
        hasUpcomingInvoice: Boolean(upcomingInvoice),
    };
}
