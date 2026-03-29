import prisma from "@/lib/prisma";

export const MANAGED_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due", "unpaid"];

function timestampToDate(value) {
    return value ? new Date(value * 1000) : null;
}

function getStripeCustomerId(stripeSubscription) {
    if (!stripeSubscription?.customer) {
        return null;
    }

    return typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;
}

export async function getOrganizationManagedSubscription(organizationId) {
    return await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: {
                in: MANAGED_SUBSCRIPTION_STATUSES,
            },
        },
        orderBy: {
            periodStart: "desc",
        },
    });
}

export function buildManagedSubscriptionUpdateData({ stripeSubscription, planName, seats }) {
    const subscriptionItem = stripeSubscription.items.data[0] ?? null;

    return {
        plan: planName.trim().toLowerCase(),
        stripeCustomerId: getStripeCustomerId(stripeSubscription),
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        periodStart: timestampToDate(subscriptionItem?.current_period_start),
        periodEnd: timestampToDate(subscriptionItem?.current_period_end),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        cancelAt: timestampToDate(stripeSubscription.cancel_at),
        canceledAt: timestampToDate(stripeSubscription.canceled_at),
        endedAt: timestampToDate(stripeSubscription.ended_at),
        seats: seats ?? subscriptionItem?.quantity ?? 1,
        trialStart: timestampToDate(stripeSubscription.trial_start),
        trialEnd: timestampToDate(stripeSubscription.trial_end),
    };
}

export async function syncOrganizationManagedSubscription({
    subscriptionId,
    stripeSubscription,
    planName,
    seats,
}) {
    return await prisma.subscription.update({
        where: {
            id: subscriptionId,
        },
        data: buildManagedSubscriptionUpdateData({
            stripeSubscription,
            planName,
            seats,
        }),
    });
}
