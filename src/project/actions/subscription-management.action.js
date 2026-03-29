"use server";

import {
    getOrganizationManagedSubscription,
    syncOrganizationManagedSubscription,
} from "@project/lib/subscription-management";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import stripe from "@/lib/stripe";
import { getValidatedPlanStripePricing } from "@/lib/stripe-plan-pricing";

const SUBSCRIPTION_PAGE_PATH = "/dashboard/org/subscription";
const MANAGEABLE_PAYMENT_ISSUE_STATUSES = ["past_due", "unpaid"];

function isTeamPlan(planName) {
    return planName.trim().toLowerCase() === "team";
}

async function getSubscriptionManagementContext(t) {
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    const subscription = await getOrganizationManagedSubscription(organization.id);

    if (!subscription?.stripeSubscriptionId) {
        throw new Error(t("subscription_management_unavailable"));
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
    );
    const subscriptionItem = stripeSubscription.items.data[0];

    if (!subscriptionItem) {
        throw new Error(t("subscription_management_unavailable"));
    }

    return {
        organization,
        subscription,
        stripeSubscription,
        subscriptionItem,
    };
}

async function resolveCurrentPlan(subscription, t) {
    const currentPlan = await prisma.plan.findFirst({
        where: {
            name: {
                equals: subscription.plan,
                mode: "insensitive",
            },
        },
    });

    if (!currentPlan) {
        throw new Error(t("plan_not_found"));
    }

    return currentPlan;
}

async function resolveTargetPlanPricing({ targetPlanId, annual, t }) {
    const targetPlan = await prisma.plan.findUnique({
        where: {
            id: targetPlanId,
        },
    });

    if (!targetPlan) {
        throw new Error(t("plan_not_found"));
    }

    if (annual && !targetPlan.annualDiscountPriceId) {
        throw new Error(t("annual_checkout_unavailable"));
    }

    const { monthlyPrice, annualPrice, annualComparison } = await getValidatedPlanStripePricing({
        priceId: targetPlan.priceId,
        annualDiscountPriceId: targetPlan.annualDiscountPriceId,
    });

    if (annual && (!annualPrice || annualComparison?.isMoreExpensive)) {
        throw new Error(t("annual_checkout_unavailable"));
    }

    return {
        targetPlan,
        targetPriceId: annual ? annualPrice.id : monthlyPrice.id,
    };
}

async function changeSubscriptionPlanInternal({ targetPlanId, annual, t }) {
    const context = await getSubscriptionManagementContext(t);

    if (MANAGEABLE_PAYMENT_ISSUE_STATUSES.includes(context.subscription.status ?? "")) {
        throw new Error(t("change_plan_payment_issue"));
    }

    if (context.subscription.cancelAtPeriodEnd) {
        throw new Error(t("change_plan_restore_first"));
    }

    const { targetPlan, targetPriceId } = await resolveTargetPlanPricing({
        targetPlanId,
        annual,
        t,
    });

    if (context.subscriptionItem.price.id === targetPriceId) {
        throw new Error(t("change_plan_already_selected"));
    }

    const memberCount = await prisma.member.count({
        where: {
            organizationId: context.organization.id,
        },
    });

    const targetQuantity = isTeamPlan(targetPlan.name)
        ? memberCount
        : (context.subscriptionItem.quantity ?? context.subscription.seats ?? 1);

    try {
        await stripe.subscriptionItems.update(context.subscriptionItem.id, {
            price: targetPriceId,
            quantity: targetQuantity,
            proration_behavior: "create_prorations",
        });

        const updatedStripeSubscription = await stripe.subscriptions.retrieve(
            context.subscription.stripeSubscriptionId
        );

        await syncOrganizationManagedSubscription({
            subscriptionId: context.subscription.id,
            stripeSubscription: updatedStripeSubscription,
            planName: targetPlan.name,
            seats: targetQuantity,
        });

        revalidatePath(SUBSCRIPTION_PAGE_PATH);

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error changing subscription plan:", error);

        throw new Error(t("change_plan_failed"));
    }
}

export async function changeSubscriptionPlan({ targetPlanId, annual = false }) {
    const t = await getTranslations("organization.subscription");

    return await changeSubscriptionPlanInternal({
        targetPlanId,
        annual,
        t,
    });
}

export async function toggleSubscriptionInterval({ annual }) {
    const t = await getTranslations("organization.subscription");
    const context = await getSubscriptionManagementContext(t);
    const currentPlan = await resolveCurrentPlan(context.subscription, t);

    return await changeSubscriptionPlanInternal({
        targetPlanId: currentPlan.id,
        annual,
        t,
    });
}

export async function cancelSubscriptionAtPeriodEnd() {
    const t = await getTranslations("organization.subscription");
    const context = await getSubscriptionManagementContext(t);

    if (context.subscription.cancelAtPeriodEnd) {
        return { success: true };
    }

    try {
        const updatedStripeSubscription = await stripe.subscriptions.update(
            context.subscription.stripeSubscriptionId,
            {
                cancel_at_period_end: true,
            }
        );

        await syncOrganizationManagedSubscription({
            subscriptionId: context.subscription.id,
            stripeSubscription: updatedStripeSubscription,
            planName: context.subscription.plan,
            seats: context.subscriptionItem.quantity ?? context.subscription.seats ?? 1,
        });

        revalidatePath(SUBSCRIPTION_PAGE_PATH);

        return { success: true };
    } catch (error) {
        console.error("Error cancelling subscription at period end:", error);

        throw new Error(t("cancel_subscription_failed"));
    }
}

export async function restoreSubscription() {
    const t = await getTranslations("organization.subscription");
    const context = await getSubscriptionManagementContext(t);

    if (!context.subscription.cancelAtPeriodEnd) {
        return { success: true };
    }

    try {
        const updatedStripeSubscription = await stripe.subscriptions.update(
            context.subscription.stripeSubscriptionId,
            {
                cancel_at_period_end: false,
            }
        );

        await syncOrganizationManagedSubscription({
            subscriptionId: context.subscription.id,
            stripeSubscription: updatedStripeSubscription,
            planName: context.subscription.plan,
            seats: context.subscriptionItem.quantity ?? context.subscription.seats ?? 1,
        });

        revalidatePath(SUBSCRIPTION_PAGE_PATH);

        return { success: true };
    } catch (error) {
        console.error("Error restoring subscription:", error);

        throw new Error(t("restore_subscription_failed"));
    }
}

export async function createPaymentMethodUpdateSession() {
    const t = await getTranslations("organization.subscription");
    const context = await getSubscriptionManagementContext(t);
    const returnUrl = `${getServerUrl()}${SUBSCRIPTION_PAGE_PATH}`;
    const customerId =
        context.subscription.stripeCustomerId ??
        (typeof context.stripeSubscription.customer === "string"
            ? context.stripeSubscription.customer
            : null);

    if (!customerId) {
        throw new Error(t("payment_method_update_unavailable"));
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
            flow_data: {
                type: "payment_method_update",
                after_completion: {
                    type: "redirect",
                    redirect: {
                        return_url: returnUrl,
                    },
                },
            },
        });

        return {
            url: session.url,
        };
    } catch (error) {
        console.error("Error creating payment method update session:", error);

        throw new Error(t("payment_method_update_unavailable"));
    }
}
