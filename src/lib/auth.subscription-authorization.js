const BILLING_MANAGE_ACTIONS = new Set([
    "upgrade-subscription",
    "list-subscription",
    "cancel-subscription",
    "restore-subscription",
    "billing-portal",
]);

/**
 * Vérifie si une action d'abonnement requiert billing.manage.
 *
 * @param {{action?: string}} params
 * @param {{checkPermissionFn: Function}} dependencies
 * @returns {Promise<boolean>}
 */
export async function authorizeSubscriptionReference({ action }, { checkPermissionFn }) {
    if (!BILLING_MANAGE_ACTIONS.has(action)) {
        return true;
    }

    return await checkPermissionFn({
        permissions: { billing: ["manage"] },
    });
}
