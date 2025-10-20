import { hasPermissionAction } from "@/actions/organization.action";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@root/prisma/generated";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Plan from "./components/plan";
import StripeLoader from "./components/stripe-loader";
import SubscriptionManagement from "./components/subscription-management";

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
