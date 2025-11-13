import StripeLoader from "@root/src/components/stripe-loader";
import { auth } from "@root/src/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { requirePermission } from "@/lib/access-control";
import ManagePlan from "./components/manage-plan";
import Plan from "./components/plan";

export default async function OrganizationSubscriptionPage() {
    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    const subscriptions = await auth.api.listActiveSubscriptions({
        query: {
            referenceId: organization.id,
        },
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    // get the active subscription
    const activeSubscription = subscriptions.find(
        sub => sub.status === "active" || sub.status === "trialing"
    );

    // Show subscription management if subscription exists and is active
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
