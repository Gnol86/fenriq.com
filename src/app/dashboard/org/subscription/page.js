import StripeLoader from "@root/src/components/stripe-loader";
import { auth } from "@root/src/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import Plan from "./components/plan";
import PortalButton from "./components/portal-button";

export default async function OrganizationSubscriptionPage() {
    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { billing: ["read"] },
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

    console.log("Active Subscription:", activeSubscription);

    const lengthTotalMembres = await prisma.member.count({
        where: {
            organizationId: organization.id,
        },
    });

    // Show subscription management if subscription exists and is active
    if (activeSubscription) {
        return (
            <Suspense fallback={<StripeLoader />}>
                Manage Subscription
                <PortalButton />
            </Suspense>
        );
    }

    // Show plan selection if no subscription or subscription is canceled
    return (
        <Suspense fallback={<StripeLoader />}>
            <Plan organization={organization} lengthTotalMembres={lengthTotalMembres} />
        </Suspense>
    );
}
