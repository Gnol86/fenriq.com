import prisma from "@/lib/prisma";
import { getQuota } from "@/lib/quota";

export const CHARROI_QUOTA_LOCK_REASONS = {
    VEHICLE_QUOTA_REACHED: "vehicle_quota_reached",
    DASHBOARD_LOCKED: "dashboard_locked",
};

export function resolveCharroiQuotaStatus(quota) {
    const canCreateVehicle = quota.canAdd;
    const isAtLimit = quota.used === quota.limit;
    const isOverQuota = quota.used > quota.limit;
    const lockReason = isOverQuota
        ? CHARROI_QUOTA_LOCK_REASONS.DASHBOARD_LOCKED
        : canCreateVehicle
          ? null
          : CHARROI_QUOTA_LOCK_REASONS.VEHICLE_QUOTA_REACHED;

    return {
        ...quota,
        canCreateVehicle,
        isAtLimit,
        isOverQuota,
        lockReason,
    };
}

export async function getCharroiQuotaStatus({ organizationId } = {}) {
    const quota = await getQuota({
        organizationId,
        usageCountFn: async resolvedOrganizationId =>
            await prisma.vehicle.count({
                where: {
                    organizationId: resolvedOrganizationId,
                },
            }),
    });

    return resolveCharroiQuotaStatus(quota);
}

export function getCharroiQuotaMessage({ quotaStatus, t }) {
    if (!quotaStatus?.lockReason) {
        return "";
    }

    if (quotaStatus.lockReason === CHARROI_QUOTA_LOCK_REASONS.DASHBOARD_LOCKED) {
        return t("dashboard_locked_error", {
            limit: quotaStatus.limit,
            used: quotaStatus.used,
        });
    }

    return t("vehicle_quota_reached_error", {
        limit: quotaStatus.limit,
        used: quotaStatus.used,
    });
}

export async function assertCanCreateVehicle({ organizationId, t }) {
    const quotaStatus = await getCharroiQuotaStatus({
        organizationId,
    });

    if (!quotaStatus.canCreateVehicle) {
        throw new Error(getCharroiQuotaMessage({ quotaStatus, t }));
    }

    return quotaStatus;
}

export async function assertCharroiDashboardMutationAllowed({ organizationId, t }) {
    const quotaStatus = await getCharroiQuotaStatus({
        organizationId,
    });

    if (quotaStatus.isOverQuota) {
        throw new Error(getCharroiQuotaMessage({ quotaStatus, t }));
    }

    return quotaStatus;
}
