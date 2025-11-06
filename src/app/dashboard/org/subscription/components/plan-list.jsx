"use client";

import { ButtonGroup } from "@root/src/components/ui/button-group";
import { formatPrice } from "@root/src/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanList({ plans, memberCount, locale }) {
    const t = useTranslations("organization.subscription");
    const [billingInterval, setBillingInterval] = useState("monthly");

    // Vérifier si au moins un plan a un prix annuel
    const hasAnnualPlans = plans.some(plan => plan.annualPrice !== null);

    // Filtrer les plans selon l'intervalle de facturation
    const filteredPlans =
        billingInterval === "annual" ? plans.filter(plan => plan.annualPrice !== null) : plans;

    // Trier les plans par prix croissant
    const displayedPlans = [...filteredPlans].sort((a, b) => {
        const priceA =
            billingInterval === "annual" && a.annualPrice
                ? a.annualPrice.amount
                : a.monthlyPrice.amount;
        const priceB =
            billingInterval === "annual" && b.annualPrice
                ? b.annualPrice.amount
                : b.monthlyPrice.amount;
        return priceA - priceB;
    });

    // Fonction pour calculer le pourcentage d'économie
    const calculateSavings = (monthlyPrice, annualPrice) => {
        const monthlyYearlyCost = monthlyPrice.amount * 12;
        const savings = ((monthlyYearlyCost - annualPrice.amount) / monthlyYearlyCost) * 100;
        return Math.round(savings);
    };

    // Calculer les économies maximales pour les plans annuels
    const maxSavings = Math.max(
        ...plans
            .filter(plan => plan.annualPrice)
            .map(plan => calculateSavings(plan.monthlyPrice, plan.annualPrice))
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Toggle mensuel/annuel */}
            {hasAnnualPlans && (
                <div className="flex justify-center">
                    <ButtonGroup className="bg-muted rounded-xl p-2">
                        <Button
                            variant={billingInterval === "monthly" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBillingInterval("monthly")}
                        >
                            {t("billing_toggle_monthly")}
                        </Button>
                        <Button
                            variant={billingInterval === "annual" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBillingInterval("annual")}
                        >
                            {t("billing_toggle_annual")}
                            {maxSavings > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {t("up_to_savings", {
                                        percentage: maxSavings,
                                    })}
                                </Badge>
                            )}
                        </Button>
                    </ButtonGroup>
                </div>
            )}

            {/* Liste des plans */}
            <div className="flex flex-wrap justify-center gap-4">
                {displayedPlans.map(plan => {
                    const isTeamPlan = plan.name.toLowerCase() === "team";

                    const currentPrice =
                        billingInterval === "annual" && plan.annualPrice
                            ? plan.annualPrice
                            : plan.monthlyPrice;

                    const priceAmount = currentPrice.amount;
                    const currency = currentPrice.currency;

                    // Pour le plan team, calculer le total
                    const teamTotal = isTeamPlan ? priceAmount * memberCount : null;

                    // Calculer les économies si on affiche le prix annuel
                    const savings =
                        billingInterval === "annual" && plan.annualPrice && plan.monthlyPrice
                            ? calculateSavings(plan.monthlyPrice, plan.annualPrice)
                            : null;

                    console.log("marketing_features", currentPrice.product.marketing_features);

                    return (
                        <Card key={plan.id} className="flex w-80 flex-col">
                            <CardHeader>
                                <CardTitle className="text-center">
                                    <Badge className="text-sm">{currentPrice.product.name}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {/* Prix */}
                                <div className="flex flex-col items-center">
                                    {/* Badge d'économie */}
                                    {savings && (
                                        <Badge variant="destructive" className="mb-1">
                                            {t("annual_savings", {
                                                percentage: savings,
                                            })}
                                        </Badge>
                                    )}
                                    {isTeamPlan ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-muted-foreground mb-2 text-center text-sm">
                                                {t("team_plan_notice", {
                                                    count: memberCount,
                                                })}{" "}
                                                {t("team_plan_price_info", {
                                                    price: formatPrice(
                                                        priceAmount,
                                                        currency,
                                                        locale
                                                    ),
                                                })}
                                            </span>

                                            <div className="flex flex-col items-center">
                                                <span className="text-muted-foreground text-sm">
                                                    {t("team_plan_total")}
                                                </span>
                                                <span className="text-4xl font-bold">
                                                    {formatPrice(teamTotal, currency, locale)}
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    {billingInterval === "annual"
                                                        ? t("price_per_year")
                                                        : t("price_per_month")}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-col items-center">
                                                <span className="text-muted-foreground bg-muted rounded-lg border p-2 text-xs">
                                                    {t("team_plan_proration_notice")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl font-bold">
                                                {formatPrice(priceAmount, currency, locale)}
                                            </span>
                                            <span className="text-muted-foreground text-sm">
                                                {billingInterval === "annual"
                                                    ? t("price_per_year")
                                                    : t("price_per_month")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                {(plan.description || currentPrice.product.description) && (
                                    <div className="text-left prose prose-sm dark:prose-invert max-w-none mt-4">
                                        {plan.description ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {plan.description}
                                            </ReactMarkdown>
                                        ) : (
                                            currentPrice.product.description
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {/* Bouton de souscription */}
                                <Button className="mt-auto w-full" size="lg">
                                    {t("subscribe_to_plan")}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
