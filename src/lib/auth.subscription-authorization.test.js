import { beforeEach, describe, expect, mock, test } from "bun:test";

const checkPermissionMock = mock();
const getStripeCheckoutBrandingSettingsMock = mock();
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

mock.module("@/lib/stripe-branding", () => ({
    getStripeCheckoutBrandingSettings: getStripeCheckoutBrandingSettingsMock,
}));

mock.module("@/site-config", () => ({
    SiteConfig: {
        appId: "test-app",
        title: "Test App",
        prodUrl: "https://example.com",
        brand: {
            primary: "#123456",
            stripeBackgroundColor: "#f5f5f5",
            stripeIconPath: "/images/icon.png",
            stripeLogoPath: "/images/logo.png",
            stripeHeaderStyle: "display_name",
        },
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
        getStripeCheckoutBrandingSettingsMock.mockReset();
        getStripeCheckoutBrandingSettingsMock.mockReturnValue({
            display_name: "Test App",
            button_color: "#123456",
            background_color: "#f5f5f5",
            icon: {
                type: "url",
                url: "https://example.com/images/icon.png",
            },
        });
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

    test("ajoute le branding Stripe sans perdre les paramètres Checkout existants", async () => {
        const { auth } = await authModulePromise;
        const getCheckoutSessionParams =
            auth.plugins[0].options.subscription.getCheckoutSessionParams;

        const result = await getCheckoutSessionParams(
            {
                user: {
                    id: "user-1",
                },
                session: {
                    id: "session-1",
                },
                plan: {
                    name: "pro",
                },
                subscription: {
                    id: "sub-1",
                },
            },
            {},
            {}
        );

        expect(getStripeCheckoutBrandingSettingsMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            params: {
                allow_promotion_codes: true,
                automatic_tax: {
                    enabled: true,
                },
                tax_id_collection: {
                    enabled: true,
                },
                billing_address_collection: "required",
                branding_settings: {
                    display_name: "Test App",
                    button_color: "#123456",
                    background_color: "#f5f5f5",
                    icon: {
                        type: "url",
                        url: "https://example.com/images/icon.png",
                    },
                },
            },
        });
    });
});
