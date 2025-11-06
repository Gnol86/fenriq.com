import { Button } from "@root/src/components/ui/button";
import { checkAdmin } from "@root/src/lib/access-control";
import { Plus, ReceiptEuro } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getPlansWithStripeData } from "@/actions/subscription.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import PlanList from "./plan-list";

export default async function Plan({ organization: _organization, lengthTotalMembres }) {
    const t = await getTranslations("organization.subscription");

    // Récupérer les plans avec les données Stripe
    const plans = await getPlansWithStripeData();

    const locale = await getLocale();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {plans.length > 0 ? (
                    <PlanList plans={plans} memberCount={lengthTotalMembres} locale={locale} />
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
                                <Button size="icon" asChild>
                                    <Link href="/dashboard/admin/plans">
                                        <Plus />
                                    </Link>
                                </Button>
                            </EmptyContent>
                        )}
                    </Empty>
                )}

                <p className="text-muted-foreground text-center"></p>
            </CardContent>
        </Card>
    );
}
