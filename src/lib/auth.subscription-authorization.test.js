import { beforeEach, describe, expect, mock, test } from "bun:test";

const checkPermissionMock = mock();
const betterAuthMock = mock(config => config);
const stripePluginMock = mock(options => ({
    id: "stripe",
    options,
}));

mock.module("better-auth", () => ({
    APIError: class APIError extends Error {},
    betterAuth: betterAuthMock,
}));

mock.module("@better-auth/stripe", () => ({
    stripe: stripePluginMock,
}));

mock.module("better-auth/adapters/prisma", () => ({
    prismaAdapter: mock(() => ({})),
}));

mock.module("better-auth/next-js", () => ({
    nextCookies: mock(() => ({})),
}));

mock.module("better-auth/plugins", () => ({
    admin: mock(options => ({
        id: "admin",
        options,
    })),
    createAuthMiddleware: handler => handler,
    organization: mock(options => ({
        id: "organization",
        options,
    })),
}));

mock.module("better-auth-localization", () => ({
    localization: mock(options => ({
        id: "localization",
        options,
    })),
}));

mock.module("next/headers", () => ({
    cookies: mock(async () => ({
        get: () => null,
    })),
}));

mock.module("stripe", () => ({
    default: class Stripe {},
}));

mock.module("@/actions/file.action", () => ({
    deleteFile: mock(async () => {}),
}));

mock.module("@/site-config", () => ({
    SiteConfig: {
        appId: "test-app",
        options: {
            organization: {
                allowUserToCreateOrganization: true,
                organizationLimit: 5,
                membershipLimit: 5,
                invitationLimit: 5,
                invitationExpiresIn: 60,
            },
        },
        quota: {
            enabled: true,
        },
    },
}));

mock.module("./access-control", () => ({
    checkPermission: checkPermissionMock,
}));

mock.module("./i18n/config.js", () => ({
    defaultLocale: "en-US",
}));

mock.module("./organization-permissions.js", () => ({
    ac: {},
    adminPermissions: {},
    memberPermissions: {},
    ownerPermissions: {},
}));

mock.module("./prisma", () => ({
    default: {
        plan: {
            findMany: mock(async () => []),
        },
        user: {
            count: mock(async () => 0),
            update: mock(async () => {}),
            findUnique: mock(async () => null),
        },
        member: {
            findFirst: mock(async () => null),
            findMany: mock(async () => []),
        },
    },
}));

mock.module("./server-url", () => ({
    getServerUrl: () => "http://localhost:3000",
}));

const authModulePromise = import("./auth.js");

describe("auth subscription authorizeReference", () => {
    beforeEach(() => {
        checkPermissionMock.mockReset();
        checkPermissionMock.mockResolvedValue(true);
    });

    test("protège list-subscription avec billing.manage", async () => {
        const { auth } = await authModulePromise;
        const authorizeReference = auth.plugins[0].options.subscription.authorizeReference;

        await expect(authorizeReference({ action: "list-subscription" })).resolves.toBe(true);
        expect(checkPermissionMock).toHaveBeenCalledWith({
            permissions: { billing: ["manage"] },
        });
    });

    test("protège billing-portal avec billing.manage", async () => {
        checkPermissionMock.mockResolvedValue(false);

        const { auth } = await authModulePromise;
        const authorizeReference = auth.plugins[0].options.subscription.authorizeReference;

        await expect(authorizeReference({ action: "billing-portal" })).resolves.toBe(false);
        expect(checkPermissionMock).toHaveBeenCalledWith({
            permissions: { billing: ["manage"] },
        });
    });

    test("laisse passer les autres actions sans vérification supplémentaire", async () => {
        const { auth } = await authModulePromise;
        const authorizeReference = auth.plugins[0].options.subscription.authorizeReference;

        await expect(authorizeReference({ action: "other-action" })).resolves.toBe(true);
        expect(checkPermissionMock).not.toHaveBeenCalled();
    });
});
