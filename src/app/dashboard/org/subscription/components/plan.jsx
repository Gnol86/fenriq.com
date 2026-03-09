import { Button } from "@root/src/components/ui/button";
import { checkAdmin } from "@root/src/lib/access-control";
import prisma from "@root/src/lib/prisma";
import { Plus, ReceiptEuro } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getPlansWithStripeData } from "@/actions/subscription.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateTieredPrice } from "@/lib/utils";
import PlanCard from "./plan-card";

const getSortableAmount = priceData => {
    if (priceData.amount !== null && priceData.amount !== undefined) return priceData.amount;
    if (priceData.tiers?.length > 0) {
        const minimum = priceData.tiers[0].up_to ?? 1;
        return calculateTieredPrice(priceData.tiers, minimum, priceData.tiersMode);
    }
    return 0;
};

export default async function Plan({ organization }) {
    const [t, plans, locale, lengthTotalMembres, isAdmin] = await Promise.all([
        getTranslations("organization.subscription"),
        getPlansWithStripeData(),
        getLocale(),
        prisma.member.count({
            where: {
                organizationId: organization.id,
            },
        }),
        checkAdmin(),
    ]);

    const hasAnnualPlans = plans.some(plan => plan.annualPrice !== null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {plans.length > 0 ? (
                    <Tabs
                        defaultValue="monthly"
                        className="w-full flex flex-col justify-center items-center"
                    >
                        {hasAnnualPlans && (
                            <TabsList className="mb-4">
                                <TabsTrigger value="monthly">
                                    {t("billing_toggle_monthly")}
                                </TabsTrigger>
                                <TabsTrigger value="annual">
                                    {t("billing_toggle_annual")}
                                </TabsTrigger>
                            </TabsList>
                        )}
                        <TabsContent value="monthly" className="flex flex-col lg:flex-row gap-4">
                            {plans
                                .filter(plan => plan.monthlyPrice !== null)
                                .sort(
                                    (a, b) =>
                                        getSortableAmount(a.monthlyPrice) -
                                        getSortableAmount(b.monthlyPrice)
                                )
                                .map(plan => (
                                    <PlanCard
                                        plan={plan}
                                        key={plan.id}
                                        memberCount={lengthTotalMembres}
                                        locale={locale}
                                    />
                                ))}
                        </TabsContent>
                        {hasAnnualPlans && (
                            <TabsContent value="annual" className="flex flex-col lg:flex-row gap-4">
                                {plans
                                    .filter(plan => plan.annualPrice !== null)
                                    .sort(
                                        (a, b) =>
                                            getSortableAmount(a.annualPrice) -
                                            getSortableAmount(b.annualPrice)
                                    )
                                    .map(plan => (
                                        <PlanCard
                                            plan={plan}
                                            key={plan.id}
                                            memberCount={lengthTotalMembres}
                                            locale={locale}
                                            annual
                                        />
                                    ))}
                            </TabsContent>
                        )}
                    </Tabs>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ReceiptEuro />
                            </EmptyMedia>
                            <EmptyTitle>{t("plan_not_configured")}</EmptyTitle>
                        </EmptyHeader>
                        {isAdmin && (
                            <EmptyContent>
                                <Button
                                    size="icon"
                                    nativeButton={false}
                                    render={<Link href="/dashboard/admin/plans" />}
                                >
                                    <Plus />
                                </Button>
                            </EmptyContent>
                        )}
                    </Empty>
                )}
            </CardContent>
        </Card>
    );
}
