import { MagicCard } from "@root/src/components/ui/magic-card";
import { formatPrice } from "@root/src/lib/utils";
import { SiteConfig } from "@root/src/site-config";
import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuantitySelector from "@/components/quantity-selector";
import SubscriptionButton from "./subscription-button";

// Fonction pour calculer le pourcentage d'économie
const calculateSavings = (monthlyPrice, annualPrice) => {
    const monthlyYearlyCost = monthlyPrice.amount * 12;
    const savings = ((monthlyYearlyCost - annualPrice.amount) / monthlyYearlyCost) * 100;
    return Math.round(savings);
};

export default async function PlanCard({ plan, annual = false, memberCount, locale }) {
    const t = await getTranslations("organization.subscription");

    const isTeamPlan = plan.name.toLowerCase() === "team";
    const currentPrice = annual && plan.annualPrice ? plan.annualPrice : plan.monthlyPrice;

    const priceAmount = currentPrice.amount;
    const currency = currentPrice.currency;

    const savings =
        annual && plan.annualPrice && plan.monthlyPrice
            ? calculateSavings(plan.monthlyPrice, plan.annualPrice)
            : null;

    return (
        <MagicCard className="w-64 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform">
            <div className="flex flex-col gap-4 h-full">
                <span className="text-lg w-fit bg-primary text-primary-foreground px-2 font-bold rounded-sm self-center -translate-y-6 group-hover:translate-y-0 transition-transform">
                    {currentPrice.product.name}
                </span>
                {savings && (
                    <span className="relative -mb-4">
                        <span className="line-through text-sm text-muted-foreground mr-2">
                            {formatPrice(plan.monthlyPrice.amount * 12, currency, locale)}
                        </span>
                        <span className="bg-success text-success-foreground px-1 rounded-sm font-bold">
                            -{savings}%
                        </span>
                    </span>
                )}
                <span className="text-3xl font-black whitespace-nowrap">
                    {formatPrice(priceAmount, currency, locale)}
                </span>
                <span className="text-base font-normal -mt-5">
                    {annual ? t("price_per_year") : t("price_per_month")}
                    {isTeamPlan && <> {t("price_per_membre")}</>}
                </span>
                {isTeamPlan && (
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <span>
                            {t("team_plan_notice", {
                                count: memberCount,
                            })}
                        </span>
                        <span>
                            {t("team_plan_price_info", {
                                price: formatPrice(priceAmount, currency, locale),
                            })}
                        </span>
                        <span>{t("team_plan_proration_notice")}</span>
                    </div>
                )}
                {plan.description && (
                    <div className="text-left prose prose-sm dark:prose-invert text-muted-foreground border-t pt-2 flex-1">
                        {plan.description ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {plan.description}
                            </ReactMarkdown>
                        ) : (
                            currentPrice.product.description
                        )}
                    </div>
                )}
                <div className="flex-1 -mb-4" />
                {isTeamPlan && (
                    <div className="font-bold">
                        {t("team_plan_total")}{" "}
                        {formatPrice(memberCount * priceAmount, currency, locale)}{" "}
                        {annual ? t("price_per_year") : t("price_per_month")}
                    </div>
                )}
                {SiteConfig.quota?.enabled && !isTeamPlan ? (
                    <QuantitySelector
                        planId={plan.id}
                        annual={annual}
                        freeTrialDays={plan.freeTrialDays}
                        unitPrice={priceAmount}
                        currency={currency}
                        locale={locale}
                        minimum={SiteConfig.quota.minimum}
                        step={SiteConfig.quota.step}
                    />
                ) : (
                    <SubscriptionButton
                        planId={plan.id}
                        annual={annual}
                        freeTrialDays={plan.freeTrialDays}
                    />
                )}
            </div>
        </MagicCard>
    );
}
