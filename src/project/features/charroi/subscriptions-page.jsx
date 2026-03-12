import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { SubscriptionsManager } from "./subscriptions-manager";

export default async function CharroiSubscriptionsPage() {
    const t = await getTranslations("project.charroi.subscriptions");
    const { organization, user } = await requireActiveOrganization();

    await requirePermission({
        permissions: { checklistSubscription: ["read"] },
    });

    const member = await prisma.member.findFirst({
        where: {
            organizationId: organization.id,
            userId: user.id,
        },
        select: {
            id: true,
        },
    });

    const [categories, subscriptions] = await Promise.all([
        prisma.checklistCategory.findMany({
            where: {
                organizationId: organization.id,
                isActive: true,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                description: true,
                defaultDeliveryMode: true,
                defaultDigestCron: true,
            },
        }),
        member
            ? prisma.checklistMemberSubscription.findMany({
                  where: {
                      organizationId: organization.id,
                      memberId: member.id,
                  },
                  select: {
                      categoryId: true,
                      isActive: true,
                      deliveryModeOverride: true,
                  },
              })
            : [],
    ]);

    const subscriptionsByCategoryId = Object.fromEntries(
        subscriptions.map(subscription => [subscription.categoryId, subscription])
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <SubscriptionsManager
                    categories={categories}
                    subscriptionsByCategoryId={subscriptionsByCategoryId}
                />
            </CardContent>
        </Card>
    );
}
