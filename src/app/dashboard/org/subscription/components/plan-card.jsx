import { MagicCard } from "@root/src/components/ui/magic-card";
import { calculateTieredPrice, formatPrice } from "@root/src/lib/utils";
import { SiteConfig } from "@root/src/site-config";
import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuantitySelector from "@/components/quantity-selector";
import SubscriptionButton from "./subscription-button";

// Retourne la quantité minimum pour un tarif échelonné (up_to du premier palier)
const getTieredMinimum = tiers => tiers?.[0]?.up_to ?? 1;

// Retourne le prix de base pour un tarif (flat ou échelonné)
const getBasePrice = price => {
    if (!price.tiersMode) return price.amount;
    return calculateTieredPrice(price.tiers, getTieredMinimum(price.tiers), price.tiersMode);
};

// Fonction pour calculer le pourcentage d'économie
const calculateSavings = (monthlyPrice, annualPrice) => {
    const monthlyAmount = getBasePrice(monthlyPrice);
    const annualAmount = getBasePrice(annualPrice);
    const monthlyYearlyCost = monthlyAmount * 12;
    if (monthlyYearlyCost === 0) return null;
    const savings = ((monthlyYearlyCost - annualAmount) / monthlyYearlyCost) * 100;
    return Math.round(savings);
};

export default async function PlanCard({ plan, annual = false, memberCount, locale }) {
    const t = await getTranslations("organization.subscription");

    const isTeamPlan = plan.name.toLowerCase() === "team";
    const currentPrice = annual && plan.annualPrice ? plan.annualPrice : plan.monthlyPrice;

    const isTiered = !!currentPrice.tiersMode;
    const tieredMinimum = isTiered ? getTieredMinimum(currentPrice.tiers) : null;
    const priceAmount = isTiered
        ? calculateTieredPrice(currentPrice.tiers, tieredMinimum, currentPrice.tiersMode)
        : currentPrice.amount;
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
                            {formatPrice(getBasePrice(plan.monthlyPrice) * 12, currency, locale)}
                        </span>
                        <span className="bg-success text-success-foreground px-1 rounded-sm font-bold">
                            {Intl.NumberFormat(locale, {
                                style: "percent",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            }).format(savings / 100)}
                        </span>
                    </span>
                )}
                {isTiered && (
                    <span className="text-xs text-muted-foreground">{t("starting_at")}</span>
                )}
                <span className="text-3xl font-black whitespace-nowrap">
                    {formatPrice(priceAmount, currency, locale)}
                </span>
                <span className="text-base font-normal -mt-5">
                    {annual ? t("price_per_year") : t("price_per_month")}
                    {isTeamPlan && <> {t("price_per_membre")}</>}
                </span>
                {isTiered && currentPrice.tiers && (
                    <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {currentPrice.tiers.map((tier, index) => {
                            const prevUpTo = index === 0 ? 0 : currentPrice.tiers[index - 1].up_to;
                            const from = prevUpTo + 1;
                            const hasFlatOnly =
                                (tier.flat_amount ?? 0) > 0 && (tier.unit_amount ?? 0) === 0;
                            const hasUnit = (tier.unit_amount ?? 0) > 0;
                            const isLast = tier.up_to === null;

                            return (
                                <li key={tier.up_to ?? "inf"}>
                                    {hasFlatOnly &&
                                        t("tier_base", {
                                            amount: formatPrice(tier.flat_amount, currency, locale),
                                            count: tier.up_to,
                                        })}
                                    {hasUnit &&
                                        !isLast &&
                                        t("tier_range", {
                                            amount: formatPrice(tier.unit_amount, currency, locale),
                                            from,
                                            to: tier.up_to,
                                        })}
                                    {hasUnit &&
                                        isLast &&
                                        t("tier_beyond", {
                                            amount: formatPrice(tier.unit_amount, currency, locale),
                                            from,
                                        })}
                                </li>
                            );
                        })}
                    </ul>
                )}
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
                        {formatPrice(
                            isTiered
                                ? calculateTieredPrice(
                                      currentPrice.tiers,
                                      memberCount,
                                      currentPrice.tiersMode
                                  )
                                : memberCount * priceAmount,
                            currency,
                            locale
                        )}{" "}
                        {annual ? t("price_per_year") : t("price_per_month")}
                    </div>
                )}
                {SiteConfig.quota?.enabled && !isTeamPlan ? (
                    <QuantitySelector
                        planId={plan.id}
                        annual={annual}
                        freeTrialDays={plan.freeTrialDays}
                        unitPrice={isTiered ? null : priceAmount}
                        tiers={isTiered ? currentPrice.tiers : null}
                        tiersMode={isTiered ? currentPrice.tiersMode : null}
                        currency={currency}
                        locale={locale}
                        minimum={
                            isTiered
                                ? Math.max(tieredMinimum, SiteConfig.quota.minimum)
                                : SiteConfig.quota.minimum
                        }
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
