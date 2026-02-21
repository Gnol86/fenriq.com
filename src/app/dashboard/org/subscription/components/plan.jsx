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
import PlanCard from "./plan-card";

export default async function Plan({ organization }) {
    const t = await getTranslations("organization.subscription");

    // Récupérer les plans avec les données Stripe
    const plans = await getPlansWithStripeData();

    const locale = await getLocale();

    const lengthTotalMembres = await prisma.member.count({
        where: {
            organizationId: organization.id,
        },
    });

    const hasAnnualPlans = plans.some(plan => plan.annualPrice !== null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {plans.length > 0 ? (
                    <Tabs defaultValue="monthly" className="w-full justify-center items-center">
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
                                .sort((a, b) => a.monthlyPrice.amount - b.monthlyPrice.amount)
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
                                    .sort((a, b) => a.annualPrice.amount - b.annualPrice.amount)
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
                        {checkAdmin() && (
                            <EmptyContent>
                                <Button size="icon" render={<Link href="/dashboard/admin/plans" />}>
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
