import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import StripeLoader from "@root/src/components/stripe-loader";
import { Suspense } from "react";
import Plan from "./components/plan";

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
            <Suspense fallback={<StripeLoader />}>Manage Subscription</Suspense>
        );
    }

    // Show plan selection if no subscription or subscription is canceled
    return (
        <Suspense fallback={<StripeLoader />}>
            <Plan
                organization={organization}
                lengthTotalMembres={lengthTotalMembres}
            />
        </Suspense>
    );
}
