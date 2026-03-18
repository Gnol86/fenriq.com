import { beforeEach, describe, expect, mock, test } from "bun:test";

const headersMock = mock(async () => ({}));
const notFoundMock = mock(() => {
    throw new Error("NEXT_NOT_FOUND");
});
const getSessionMock = mock();
const listOrganizationsMock = mock();
const hasPermissionMock = mock();
const findFirstSubscriptionMock = mock();

mock.module("next/headers", () => ({
    headers: headersMock,
}));

mock.module("next/navigation", () => ({
    notFound: notFoundMock,
}));

mock.module("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: getSessionMock,
            listOrganizations: listOrganizationsMock,
            hasPermission: hasPermissionMock,
        },
    },
}));

mock.module("@/lib/prisma", () => ({
    default: {
        subscription: {
            findFirst: findFirstSubscriptionMock,
        },
    },
}));

const accessControlModulePromise = import("./access-control.js");

describe("access-control subscription helpers", () => {
    beforeEach(() => {
        headersMock.mockClear();
        notFoundMock.mockClear();
        getSessionMock.mockReset();
        listOrganizationsMock.mockReset();
        hasPermissionMock.mockReset();
        findFirstSubscriptionMock.mockReset();

        getSessionMock.mockResolvedValue({
            user: {
                id: "user-1",
                role: "user",
            },
            session: {
                activeOrganizationId: "org-1",
            },
        });
        listOrganizationsMock.mockResolvedValue([
            {
                id: "org-1",
                name: "Org 1",
            },
        ]);
        hasPermissionMock.mockResolvedValue({ success: true });
        findFirstSubscriptionMock.mockResolvedValue(null);
    });

    test("getActiveSubscription retourne l'abonnement actif de l'organisation", async () => {
        const activeSubscription = {
            id: "sub-1",
            referenceId: "org-1",
            status: "active",
            seats: 10,
        };
        findFirstSubscriptionMock.mockResolvedValue(activeSubscription);

        const { getActiveSubscription } = await accessControlModulePromise;
        const result = await getActiveSubscription();

        expect(result).toEqual({
            session: {
                activeOrganizationId: "org-1",
            },
            user: {
                id: "user-1",
                role: "user",
            },
            organization: {
                id: "org-1",
                name: "Org 1",
            },
            subscription: activeSubscription,
        });
        expect(findFirstSubscriptionMock).toHaveBeenCalledWith({
            where: {
                referenceId: "org-1",
                status: {
                    in: ["active", "trialing"],
                },
            },
            orderBy: {
                periodStart: "desc",
            },
        });
    });

    test("requireActiveSubscription déclenche notFound sans abonnement actif", async () => {
        const { requireActiveSubscription } = await accessControlModulePromise;

        await expect(requireActiveSubscription()).rejects.toThrow("NEXT_NOT_FOUND");
        expect(notFoundMock).toHaveBeenCalledTimes(1);
    });

    test("checkActiveSubscription retourne true avec un abonnement actif", async () => {
        findFirstSubscriptionMock.mockResolvedValue({
            id: "sub-1",
            referenceId: "org-1",
            status: "trialing",
            seats: 3,
        });

        const { checkActiveSubscription } = await accessControlModulePromise;

        await expect(checkActiveSubscription()).resolves.toBe(true);
    });

    test("checkActiveSubscription retourne false si l'utilisateur n'est pas connecté", async () => {
        getSessionMock.mockResolvedValue(null);

        const { checkActiveSubscription } = await accessControlModulePromise;

        await expect(checkActiveSubscription()).resolves.toBe(false);
        expect(findFirstSubscriptionMock).not.toHaveBeenCalled();
    });

    test("checkActiveSubscription retourne false sans organisation active", async () => {
        listOrganizationsMock.mockResolvedValue([]);

        const { checkActiveSubscription } = await accessControlModulePromise;

        await expect(checkActiveSubscription()).resolves.toBe(false);
        expect(findFirstSubscriptionMock).not.toHaveBeenCalled();
    });

    test("checkActiveSubscription retourne false sans abonnement actif", async () => {
        const { checkActiveSubscription } = await accessControlModulePromise;

        await expect(checkActiveSubscription()).resolves.toBe(false);
    });
});
