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

    console.log("🔍 Getting license movements for organization:", organizationId);

    // Get subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
        },
    });

    if (!subscription?.stripeCustomerId || !subscription?.stripeSubscriptionId) {
        console.log("❌ No subscription found");
        return null;
    }

    // Get last invoice from Stripe
    const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: 1,
        status: "paid",
    });

    const lastInvoice = invoices.data[0];

    if (!lastInvoice) {
        console.log("❌ No invoice found");
        return null;
    }

    const lastInvoiceDate = new Date(lastInvoice.created * 1000);
    console.log("📅 Last invoice date:", lastInvoiceDate);

    // Get quantity from last invoice (seats at that time)
    const lastInvoiceQuantity = lastInvoice.lines.data[0]?.quantity ?? 0;
    console.log("📊 Last invoice quantity:", lastInvoiceQuantity);

    // Get current subscription seats
    const currentSeats = subscription.seats ?? 0;
    console.log("📊 Current seats:", currentSeats);

    // Get subscription update events since last invoice to track quantity changes
    const events = await stripe.events.list({
        type: "customer.subscription.updated",
        created: {
            gte: lastInvoice.created,
        },
        limit: 100,
    });

    console.log("📋 Subscription update events found:", events.data.length);

    // Parse events to find quantity changes
    const addedLicenses = [];
    const removedLicenses = [];

    for (const event of events.data) {
        const subscription = event.data.object;
        const previousAttributes = event.data.previous_attributes;

        // Check if quantity changed in items
        if (previousAttributes?.items?.data) {
            const currentQuantity = subscription.items?.data[0]?.quantity ?? 0;
            const previousQuantity = previousAttributes.items.data[0]?.quantity ?? 0;

            if (currentQuantity > previousQuantity) {
                const quantityAdded = currentQuantity - previousQuantity;
                console.log(`➕ Event ${event.id}: Added ${quantityAdded} licenses at ${new Date(event.created * 1000)}`);

                for (let i = 0; i < quantityAdded; i++) {
                    addedLicenses.push({
                        id: `${event.id}-${i}`,
                        addedAt: new Date(event.created * 1000).toISOString(),
                        eventId: event.id,
                    });
                }
            } else if (currentQuantity < previousQuantity) {
                const quantityRemoved = previousQuantity - currentQuantity;
                console.log(`➖ Event ${event.id}: Removed ${quantityRemoved} licenses at ${new Date(event.created * 1000)}`);

                for (let i = 0; i < quantityRemoved; i++) {
                    removedLicenses.push({
                        id: `${event.id}-${i}`,
                        removedAt: new Date(event.created * 1000).toISOString(),
                        eventId: event.id,
                    });
                }
            }
        }
    }

    console.log("➕ Total licenses added:", addedLicenses.length);
    console.log("➖ Total licenses removed:", removedLicenses.length);

    // Calculate period length for proration
    const periodStart = new Date(subscription.currentPeriodStart);
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const totalPeriodDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));

    console.log("📅 Period start:", periodStart);
    console.log("📅 Period end:", periodEnd);
    console.log("📅 Total period days:", totalPeriodDays);

    // Calculate proration amounts for each added license
    const addedLicensesWithAmount = addedLicenses.map(license => {
        const licenseAddedDate = new Date(license.addedAt);
        const daysRemaining = Math.ceil((periodEnd - licenseAddedDate) / (1000 * 60 * 60 * 24));

        // Proration: (price_per_license × days_remaining) / total_days
        const proratedAmount = Math.round(
            (subscription.amount * daysRemaining) / totalPeriodDays
        );

        console.log(`💰 License added at ${license.addedAt}: ${daysRemaining} days remaining, prorated amount: ${proratedAmount}`);

        return {
            ...license,
            amount: proratedAmount,
        };
    });

    // Calculate total charges and credits from invoice preview
    let totalCredits = 0;
    let totalCharges = 0;
    let creditPerRemoval = 0;

    try {
        // Use the correct method to retrieve upcoming invoice (preview)
        const upcomingInvoice = await stripe.invoices.createPreview({
            customer: subscription.stripeCustomerId,
            subscription: subscription.stripeSubscriptionId,
        });

        console.log("📋 Upcoming invoice lines:", upcomingInvoice.lines.data.length);

        // Filter proration items created since last invoice
        const prorationItems = upcomingInvoice.lines.data.filter(item => {
            return item.proration === true && item.period.start > lastInvoice.created;
        });

        console.log("📋 Proration items:", prorationItems.length);

        // Calculate totals from Stripe's proration items
        prorationItems.forEach(item => {
            console.log(`📋 Proration item: amount=${item.amount}, description=${item.description}`);
            if (item.amount < 0) {
                totalCredits += Math.abs(item.amount);
            } else {
                totalCharges += item.amount;
            }
        });

        // Calculate credit per removal based on proration
        if (removedLicenses.length > 0 && totalCredits > 0) {
            creditPerRemoval = Math.round(totalCredits / removedLicenses.length);
        }

        console.log("💰 Total credits from Stripe:", totalCredits);
        console.log("💰 Total charges from Stripe:", totalCharges);
        console.log("💰 Credit per removal:", creditPerRemoval);
    } catch (error) {
        console.log("⚠️ Could not retrieve upcoming invoice:", error.message);
        // Continue without invoice items if there's an error
    }

    // Calculate net amount to pay (charges - credits)
    const netAmountToPay = totalCharges - totalCredits;

    // Get next billing date from subscription
    const nextBillingDate = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toISOString()
        : null;

    return {
        lastInvoiceDate: lastInvoiceDate.toISOString(),
        lastInvoiceNumber: lastInvoice.number ?? lastInvoice.id,
        lastInvoiceQuantity,
        currentSeats,
        addedMembers: addedLicensesWithAmount,
        removedMembers: removedLicenses,
        removedCount: removedLicenses.length,
        creditPerRemoval,
        netChange: currentSeats - lastInvoiceQuantity,
        totalCredits,
        totalCharges,
        netAmountToPay,
        currency: subscription.currency,
        nextBillingDate,
        amount: subscription.amount,
    };
}
