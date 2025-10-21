import { requirePermission } from "@/lib/access-control";
import { prisma } from "@/lib/prisma-client";
import { Suspense } from "react";
import Plan from "./components/plan";
import StripeLoader from "./components/stripe-loader";
import SubscriptionManagement from "./components/subscription-management";

export default async function OrganizationSubscriptionPage() {
    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { billing: ["read"] },
    });

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organization.id,
        },
    });

    const lengthTotalMembres = await prisma.member.count({
        where: {
            organizationId: organization.id,
        },
    });

    // Show subscription management if subscription exists and is active
    if (
        subscription &&
        ["active", "trialing", "past_due"].includes(subscription.status)
    ) {
        return (
            <Suspense fallback={<StripeLoader />}>
                <SubscriptionManagement organization={organization} />
            </Suspense>
        );
    }

    // Show plan selection if no subscription or subscription is canceled
    return (
        <Plan organization={organization} lengthTotalMembres={lengthTotalMembres} />
    );
}
