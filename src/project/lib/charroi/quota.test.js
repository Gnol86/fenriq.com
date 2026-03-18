import { beforeEach, describe, expect, mock, test } from "bun:test";

const getQuotaMock = mock();
const countVehiclesMock = mock();

mock.module("@/lib/quota", () => ({
    getQuota: getQuotaMock,
}));

mock.module("@/lib/prisma", () => ({
    default: {
        vehicle: {
            count: countVehiclesMock,
        },
    },
}));

async function loadQuotaModule() {
    return await import(`./quota.js?test=${Date.now()}-${Math.random()}`);
}

describe("charroi quota helpers", () => {
    beforeEach(() => {
        getQuotaMock.mockReset();
        countVehiclesMock.mockReset();
    });

    test("résout un statut sans verrou quand l'organisation est sous la limite", async () => {
        getQuotaMock.mockImplementation(async ({ usageCountFn }) => {
            const used = await usageCountFn("org-1");

            return {
                limit: 10,
                used,
                remaining: 10 - used,
                canAdd: true,
                ok: true,
                hasActiveSubscription: true,
                isFallback: false,
            };
        });
        countVehiclesMock.mockResolvedValue(7);

        const { getCharroiQuotaStatus, resolveCharroiQuotaStatus } = await loadQuotaModule();
        const status = await getCharroiQuotaStatus({
            organizationId: "org-1",
        });

        expect(countVehiclesMock).toHaveBeenCalledWith({
            where: {
                organizationId: "org-1",
            },
        });
        expect(status).toEqual(
            resolveCharroiQuotaStatus({
                limit: 10,
                used: 7,
                remaining: 3,
                canAdd: true,
                ok: true,
                hasActiveSubscription: true,
                isFallback: false,
            })
        );
    });

    test("marque le quota comme atteint quand le dernier véhicule disponible est utilisé", async () => {
        const { resolveCharroiQuotaStatus, CHARROI_QUOTA_LOCK_REASONS } = await loadQuotaModule();

        expect(
            resolveCharroiQuotaStatus({
                limit: 5,
                used: 5,
                remaining: 0,
                canAdd: false,
                ok: true,
                hasActiveSubscription: true,
                isFallback: false,
            })
        ).toMatchObject({
            canCreateVehicle: false,
            isAtLimit: true,
            isOverQuota: false,
            lockReason: CHARROI_QUOTA_LOCK_REASONS.VEHICLE_QUOTA_REACHED,
        });
    });

    test("verrouille le dashboard métier quand le quota est dépassé", async () => {
        const { resolveCharroiQuotaStatus, CHARROI_QUOTA_LOCK_REASONS } = await loadQuotaModule();

        expect(
            resolveCharroiQuotaStatus({
                limit: 5,
                used: 6,
                remaining: 0,
                canAdd: false,
                ok: false,
                hasActiveSubscription: true,
                isFallback: false,
            })
        ).toMatchObject({
            canCreateVehicle: false,
            isAtLimit: false,
            isOverQuota: true,
            lockReason: CHARROI_QUOTA_LOCK_REASONS.DASHBOARD_LOCKED,
        });
    });

    test("produit des messages adaptés selon la raison de verrouillage", async () => {
        const { getCharroiQuotaMessage, CHARROI_QUOTA_LOCK_REASONS } = await loadQuotaModule();
        const t = (key, values) => `${key}:${values.used}/${values.limit}`;

        expect(
            getCharroiQuotaMessage({
                quotaStatus: {
                    used: 10,
                    limit: 10,
                    lockReason: CHARROI_QUOTA_LOCK_REASONS.VEHICLE_QUOTA_REACHED,
                },
                t,
            })
        ).toBe("vehicle_quota_reached_error:10/10");

        expect(
            getCharroiQuotaMessage({
                quotaStatus: {
                    used: 12,
                    limit: 10,
                    lockReason: CHARROI_QUOTA_LOCK_REASONS.DASHBOARD_LOCKED,
                },
                t,
            })
        ).toBe("dashboard_locked_error:12/10");
    });
});
