import { beforeEach, describe, expect, mock, test } from "bun:test";

const requireActiveOrganizationMock = mock();
const findFirstSubscriptionMock = mock();

mock.module("@/lib/access-control", () => ({
    requireActiveOrganization: requireActiveOrganizationMock,
}));

mock.module("@/lib/prisma", () => ({
    default: {
        subscription: {
            findFirst: findFirstSubscriptionMock,
        },
    },
}));

mock.module("@/site-config", () => ({
    SiteConfig: {
        quota: {
            inactiveLimit: 1,
        },
    },
}));

const quotaModulePromise = import("./quota.js");

describe("quota helpers", () => {
    beforeEach(() => {
        requireActiveOrganizationMock.mockReset();
        findFirstSubscriptionMock.mockReset();

        requireActiveOrganizationMock.mockResolvedValue({
            organization: {
                id: "org-1",
            },
        });
        findFirstSubscriptionMock.mockResolvedValue(null);
    });

    test("getQuota retourne canAdd=true et ok=true quand used est sous la limite", async () => {
        findFirstSubscriptionMock.mockResolvedValue({
            id: "sub-1",
            referenceId: "org-1",
            status: "active",
            seats: 10,
        });

        const { getQuota } = await quotaModulePromise;
        const result = await getQuota({
            organizationId: "org-1",
            usageCountFn: async () => 7,
        });

        expect(result).toEqual({
            limit: 10,
            used: 7,
            remaining: 3,
            canAdd: true,
            ok: true,
            hasActiveSubscription: true,
            isFallback: false,
        });
    });

    test("getQuota retourne canAdd=false et ok=true quand used atteint la limite", async () => {
        findFirstSubscriptionMock.mockResolvedValue({
            id: "sub-1",
            referenceId: "org-1",
            status: "trialing",
            seats: 50,
        });

        const { getQuota } = await quotaModulePromise;
        const result = await getQuota({
            organizationId: "org-1",
            usageCountFn: async () => 50,
        });

        expect(result).toEqual({
            limit: 50,
            used: 50,
            remaining: 0,
            canAdd: false,
            ok: true,
            hasActiveSubscription: true,
            isFallback: false,
        });
    });

    test("getQuota retourne canAdd=false et ok=false quand used dépasse la limite", async () => {
        findFirstSubscriptionMock.mockResolvedValue({
            id: "sub-1",
            referenceId: "org-1",
            status: "active",
            seats: 5,
        });

        const { getQuota } = await quotaModulePromise;
        const result = await getQuota({
            organizationId: "org-1",
            usageCountFn: async () => 6,
        });

        expect(result).toEqual({
            limit: 5,
            used: 6,
            remaining: 0,
            canAdd: false,
            ok: false,
            hasActiveSubscription: true,
            isFallback: false,
        });
    });

    test("getQuota utilise inactiveLimit sans abonnement actif", async () => {
        const { getQuota } = await quotaModulePromise;
        const result = await getQuota({
            organizationId: "org-1",
            usageCountFn: async () => 1,
            inactiveLimit: 3,
        });

        expect(result).toEqual({
            limit: 3,
            used: 1,
            remaining: 2,
            canAdd: true,
            ok: true,
            hasActiveSubscription: false,
            isFallback: true,
        });
    });

    test("getQuota résout l'organisation active quand organizationId est absent", async () => {
        const { getQuota } = await quotaModulePromise;
        const usageCountFn = mock(async orgId => (orgId === "org-1" ? 1 : 0));

        await expect(
            getQuota({
                usageCountFn,
            })
        ).resolves.toEqual({
            limit: 1,
            used: 1,
            remaining: 0,
            canAdd: false,
            ok: true,
            hasActiveSubscription: false,
            isFallback: true,
        });
        expect(requireActiveOrganizationMock).toHaveBeenCalledTimes(1);
        expect(usageCountFn).toHaveBeenCalledWith("org-1");
    });
});
