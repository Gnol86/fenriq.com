import { getOrganizationManagedSubscription } from "@project/lib/subscription-management";
import StripeLoader from "@root/src/components/stripe-loader";
import { Suspense } from "react";
import { requirePermission } from "@/lib/access-control";
import ManagePlan from "./components/manage-plan";
import Plan from "./components/plan";

export default async function OrganizationSubscriptionPage() {
    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    const activeSubscription = await getOrganizationManagedSubscription(organization.id);

    // Show subscription management if a manageable subscription exists
    if (activeSubscription) {
        return (
            <Suspense fallback={<StripeLoader />}>
                <ManagePlan activeSubscription={activeSubscription} />
            </Suspense>
        );
    }

    // Show plan selection if no subscription or subscription is canceled
    return (
        <Suspense fallback={<StripeLoader />}>
            <Plan organization={organization} />
        </Suspense>
    );
}
