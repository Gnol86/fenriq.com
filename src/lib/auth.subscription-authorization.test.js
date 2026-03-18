import { beforeEach, describe, expect, mock, test } from "bun:test";

const checkPermissionMock = mock();
const authorizationModulePromise = import("./auth.subscription-authorization.js");

describe("auth subscription authorizeReference", () => {
    beforeEach(() => {
        checkPermissionMock.mockReset();
        checkPermissionMock.mockResolvedValue(true);
    });

    test("protège list-subscription avec billing.manage", async () => {
        const { authorizeSubscriptionReference } = await authorizationModulePromise;

        await expect(
            authorizeSubscriptionReference(
                { action: "list-subscription" },
                { checkPermissionFn: checkPermissionMock }
            )
        ).resolves.toBe(true);
        expect(checkPermissionMock).toHaveBeenCalledWith({
            permissions: { billing: ["manage"] },
        });
    });

    test("protège billing-portal avec billing.manage", async () => {
        checkPermissionMock.mockResolvedValue(false);

        const { authorizeSubscriptionReference } = await authorizationModulePromise;

        await expect(
            authorizeSubscriptionReference(
                { action: "billing-portal" },
                { checkPermissionFn: checkPermissionMock }
            )
        ).resolves.toBe(false);
        expect(checkPermissionMock).toHaveBeenCalledWith({
            permissions: { billing: ["manage"] },
        });
    });

    test("laisse passer les autres actions sans vérification supplémentaire", async () => {
        const { authorizeSubscriptionReference } = await authorizationModulePromise;

        await expect(
            authorizeSubscriptionReference(
                { action: "other-action" },
                { checkPermissionFn: checkPermissionMock }
            )
        ).resolves.toBe(true);
        expect(checkPermissionMock).not.toHaveBeenCalled();
    });
});
