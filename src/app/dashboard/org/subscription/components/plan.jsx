import { getPlansWithStripeData } from "@/actions/subscription.action";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import PlanList from "./plan-list";

export default async function Plan({ organization, lengthTotalMembres }) {
    const t = await getTranslations("organization.subscription");

    // Récupérer les plans avec les données Stripe
    const plans = await getPlansWithStripeData();

    // Si aucun plan n'est configuré
    if (plans.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("plan_title")}</CardTitle>
                    <CardDescription>{t("plan_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">
                        {t("plan_not_configured")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{t("plan_title")}</h2>
                <p className="text-muted-foreground">{t("plan_description")}</p>
            </div>

            <PlanList plans={plans} memberCount={lengthTotalMembres} />
        </div>
    );
}
