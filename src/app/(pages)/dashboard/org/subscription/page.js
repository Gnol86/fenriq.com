import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermissionAction } from "@/actions/organization.action";
import { PrismaClient } from "@/generated/prisma";
import Plan from "./components/plan";
import SubscriptionManagement from "./components/subscription-management";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StripeLoader from "./components/stripe-loader";

const prisma = new PrismaClient();

export default async function OrganizationSubscriptionPage() {
    const canBillingRead = await hasPermissionAction({
        permissions: { billing: ["read"] },
    });
    if (!canBillingRead) notFound();

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: activeUserOrganization.id,
        },
    });

    const lengthTotalMembres = await prisma.member.count({
        where: {
            organizationId: activeUserOrganization.id,
        },
    });

    // Show subscription management if subscription exists and is active
    if (
        subscription &&
        ["active", "trialing", "past_due"].includes(subscription.status)
    ) {
        return (
            <Suspense fallback={<StripeLoader />}>
                <SubscriptionManagement organization={activeUserOrganization} />
            </Suspense>
        );
    }

    // Show plan selection if no subscription or subscription is canceled
    return (
        <Plan
            organization={activeUserOrganization}
            lengthTotalMembres={lengthTotalMembres}
        />
    );
}
