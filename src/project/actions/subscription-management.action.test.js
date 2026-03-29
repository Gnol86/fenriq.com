import { beforeEach, describe, expect, mock, test } from "bun:test";

const revalidatePathMock = mock();
const requirePermissionMock = mock();
const checkPermissionMock = mock();
const getTranslationsMock = mock(async () => key => key);
const getOrganizationManagedSubscriptionMock = mock();
const syncOrganizationManagedSubscriptionMock = mock();
const planFindUniqueMock = mock();
const planFindFirstMock = mock();
const memberCountMock = mock();
const stripeRetrieveMock = mock();
const subscriptionItemUpdateMock = mock();
const subscriptionsUpdateMock = mock();
const billingPortalSessionCreateMock = mock();
const getValidatedPlanStripePricingMock = mock();

mock.module("next/cache", () => ({
    revalidatePath: revalidatePathMock,
}));

mock.module("next-intl/server", () => ({
    getTranslations: getTranslationsMock,
}));

mock.module("@/lib/access-control", () => ({
    requirePermission: requirePermissionMock,
    checkPermission: checkPermissionMock,
}));

mock.module("@project/lib/subscription-management", () => ({
    getOrganizationManagedSubscription: getOrganizationManagedSubscriptionMock,
    syncOrganizationManagedSubscription: syncOrganizationManagedSubscriptionMock,
}));

mock.module("@/lib/prisma", () => ({
    default: {
        plan: {
            findUnique: planFindUniqueMock,
            findFirst: planFindFirstMock,
        },
        member: {
            count: memberCountMock,
        },
    },
}));

mock.module("@/lib/server-url", () => ({
    getServerUrl: () => "https://app.example.com",
}));

mock.module("@/lib/stripe-plan-pricing", () => ({
    getValidatedPlanStripePricing: getValidatedPlanStripePricingMock,
}));

mock.module("@/lib/stripe", () => ({
    default: {
        subscriptions: {
            retrieve: stripeRetrieveMock,
            update: subscriptionsUpdateMock,
        },
        subscriptionItems: {
            update: subscriptionItemUpdateMock,
        },
        billingPortal: {
            sessions: {
                create: billingPortalSessionCreateMock,
            },
        },
    },
}));

const subscriptionManagementActionModulePromise = import("./subscription-management.action.js");

function createStripeSubscription({
    priceId = "price_current_month",
    quantity = 3,
    status = "active",
    cancelAtPeriodEnd = false,
} = {}) {
    return {
        id: "sub_stripe_123",
        customer: "cus_123",
        status,
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_at: null,
        canceled_at: null,
        ended_at: null,
        trial_start: null,
        trial_end: null,
        items: {
            data: [
                {
                    id: "si_123",
                    price: {
                        id: priceId,
                    },
                    quantity,
                    current_period_start: 1735689600,
                    current_period_end: 1738368000,
                },
            ],
        },
    };
}

describe("project subscription management actions", () => {
    beforeEach(() => {
        revalidatePathMock.mockReset();
        requirePermissionMock.mockReset();
        checkPermissionMock.mockReset();
        getTranslationsMock.mockReset();
        getOrganizationManagedSubscriptionMock.mockReset();
        syncOrganizationManagedSubscriptionMock.mockReset();
        planFindUniqueMock.mockReset();
        planFindFirstMock.mockReset();
        memberCountMock.mockReset();
        stripeRetrieveMock.mockReset();
        subscriptionItemUpdateMock.mockReset();
        subscriptionsUpdateMock.mockReset();
        billingPortalSessionCreateMock.mockReset();
        getValidatedPlanStripePricingMock.mockReset();

        revalidatePathMock.mockReturnValue(undefined);
        requirePermissionMock.mockResolvedValue({
            organization: {
                id: "org_123",
            },
        });
        checkPermissionMock.mockResolvedValue(true);
        getTranslationsMock.mockResolvedValue(key => key);
        getOrganizationManagedSubscriptionMock.mockResolvedValue({
            id: "db_sub_123",
            plan: "starter",
            stripeSubscriptionId: "sub_stripe_123",
            stripeCustomerId: "cus_123",
            status: "active",
            cancelAtPeriodEnd: false,
            seats: 3,
        });
        syncOrganizationManagedSubscriptionMock.mockResolvedValue({
            success: true,
        });
        planFindUniqueMock.mockResolvedValue({
            id: "plan_pro",
            name: "Pro",
            priceId: "price_pro_month",
            annualDiscountPriceId: "price_pro_year",
        });
        planFindFirstMock.mockResolvedValue({
            id: "plan_starter",
            name: "Starter",
            priceId: "price_current_month",
            annualDiscountPriceId: "price_current_year",
        });
        memberCountMock.mockResolvedValue(5);
        stripeRetrieveMock
            .mockResolvedValueOnce(createStripeSubscription())
            .mockResolvedValueOnce(createStripeSubscription({ priceId: "price_pro_year" }));
        subscriptionItemUpdateMock.mockResolvedValue({
            id: "si_123",
        });
        subscriptionsUpdateMock.mockResolvedValue(
            createStripeSubscription({
                cancelAtPeriodEnd: true,
            })
        );
        billingPortalSessionCreateMock.mockResolvedValue({
            url: "https://billing.stripe.com/session",
        });
        getValidatedPlanStripePricingMock.mockResolvedValue({
            monthlyPrice: {
                id: "price_pro_month",
            },
            annualPrice: {
                id: "price_pro_year",
            },
            annualComparison: {
                isMoreExpensive: false,
            },
        });
    });

    test("changeSubscriptionPlan met à jour le prix Stripe avec prorata immédiat", async () => {
        const { changeSubscriptionPlan } = await subscriptionManagementActionModulePromise;

        await expect(
            changeSubscriptionPlan({
                targetPlanId: "plan_pro",
                annual: true,
            })
        ).resolves.toEqual({
            success: true,
        });

        expect(subscriptionItemUpdateMock).toHaveBeenCalledWith("si_123", {
            price: "price_pro_year",
            quantity: 3,
            proration_behavior: "create_prorations",
        });
        expect(syncOrganizationManagedSubscriptionMock).toHaveBeenCalledWith({
            subscriptionId: "db_sub_123",
            stripeSubscription: expect.objectContaining({
                id: "sub_stripe_123",
            }),
            planName: "Pro",
            seats: 3,
        });
        expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/org/subscription");
    });

    test("cancelSubscriptionAtPeriodEnd programme l'annulation à la fin de période", async () => {
        const { cancelSubscriptionAtPeriodEnd } = await subscriptionManagementActionModulePromise;

        await expect(cancelSubscriptionAtPeriodEnd()).resolves.toEqual({
            success: true,
        });

        expect(subscriptionsUpdateMock).toHaveBeenCalledWith("sub_stripe_123", {
            cancel_at_period_end: true,
        });
        expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/org/subscription");
    });

    test("restoreSubscription réactive le renouvellement automatique", async () => {
        getOrganizationManagedSubscriptionMock.mockResolvedValue({
            id: "db_sub_123",
            plan: "starter",
            stripeSubscriptionId: "sub_stripe_123",
            stripeCustomerId: "cus_123",
            status: "active",
            cancelAtPeriodEnd: true,
            seats: 3,
        });
        subscriptionsUpdateMock.mockResolvedValue(
            createStripeSubscription({
                cancelAtPeriodEnd: false,
            })
        );

        const { restoreSubscription } = await subscriptionManagementActionModulePromise;

        await expect(restoreSubscription()).resolves.toEqual({
            success: true,
        });

        expect(subscriptionsUpdateMock).toHaveBeenCalledWith("sub_stripe_123", {
            cancel_at_period_end: false,
        });
        expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/org/subscription");
    });

    test("createPaymentMethodUpdateSession crée un deep link Stripe dédié", async () => {
        const { createPaymentMethodUpdateSession } =
            await subscriptionManagementActionModulePromise;

        await expect(createPaymentMethodUpdateSession()).resolves.toEqual({
            url: "https://billing.stripe.com/session",
        });

        expect(billingPortalSessionCreateMock).toHaveBeenCalledWith({
            customer: "cus_123",
            return_url: "https://app.example.com/dashboard/org/subscription",
            flow_data: {
                type: "payment_method_update",
                after_completion: {
                    type: "redirect",
                    redirect: {
                        return_url: "https://app.example.com/dashboard/org/subscription",
                    },
                },
            },
        });
    });
});
