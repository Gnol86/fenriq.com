"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function PlanList({ plans, memberCount }) {
    const t = useTranslations("organization.subscription");
    const [billingInterval, setBillingInterval] = useState("monthly");

    // Vérifier si au moins un plan a un prix annuel
    const hasAnnualPlans = plans.some(plan => plan.annualPrice !== null);

    // Filtrer les plans selon l'intervalle de facturation
    const displayedPlans =
        billingInterval === "annual"
            ? plans.filter(plan => plan.annualPrice !== null)
            : plans;

    // Fonction pour formater le prix
    const formatPrice = (amount, currency) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    // Fonction pour calculer le pourcentage d'économie
    const calculateSavings = (monthlyPrice, annualPrice) => {
        const monthlyYearlyCost = monthlyPrice.amount * 12;
        const savings =
            ((monthlyYearlyCost - annualPrice.amount) / monthlyYearlyCost) *
            100;
        return Math.round(savings);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Toggle mensuel/annuel */}
            {hasAnnualPlans && (
                <div className="flex justify-center">
                    <div className="bg-muted inline-flex gap-1 rounded-lg p-1">
                        <Button
                            variant={
                                billingInterval === "monthly"
                                    ? "default"
                                    : "ghost"
                            }
                            size="sm"
                            onClick={() => setBillingInterval("monthly")}
                        >
                            {t("billing_toggle_monthly")}
                        </Button>
                        <Button
                            variant={
                                billingInterval === "annual"
                                    ? "default"
                                    : "ghost"
                            }
                            size="sm"
                            onClick={() => setBillingInterval("annual")}
                        >
                            {t("billing_toggle_annual")}
                        </Button>
                    </div>
                </div>
            )}

            {/* Liste des plans */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedPlans.map(plan => {
                    const isTeamPlan = plan.name.toLowerCase() === "team";

                    const currentPrice =
                        billingInterval === "annual" && plan.annualPrice
                            ? plan.annualPrice
                            : plan.monthlyPrice;

                    const priceAmount = currentPrice.amount;
                    const currency = currentPrice.currency;

                    // Pour le plan team, calculer le total
                    const teamTotal = isTeamPlan
                        ? priceAmount * memberCount
                        : null;

                    // Calculer les économies si on affiche le prix annuel
                    const savings =
                        billingInterval === "annual" &&
                        plan.annualPrice &&
                        plan.monthlyPrice
                            ? calculateSavings(
                                  plan.monthlyPrice,
                                  plan.annualPrice
                              )
                            : null;

                    // Parser les features depuis les métadonnées du produit
                    const features = currentPrice.product.metadata?.features
                        ? JSON.parse(currentPrice.product.metadata.features)
                        : [];

                    return (
                        <Card key={plan.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>
                                            {currentPrice.product.name}
                                        </CardTitle>
                                        {currentPrice.product.description && (
                                            <CardDescription className="mt-2">
                                                {
                                                    currentPrice.product
                                                        .description
                                                }
                                            </CardDescription>
                                        )}
                                    </div>
                                    {plan.freeTrialDays && (
                                        <Badge variant="secondary">
                                            {t("free_trial_badge", {
                                                days: plan.freeTrialDays,
                                            })}
                                        </Badge>
                                    )}
                                </div>

                                {/* Prix */}
                                <div className="mt-4">
                                    {isTeamPlan ? (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-muted-foreground text-sm">
                                                {t("team_plan_notice", {
                                                    count: memberCount,
                                                })}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {t("team_plan_price_info", {
                                                    price: formatPrice(
                                                        priceAmount,
                                                        currency
                                                    ),
                                                })}
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-muted-foreground text-sm">
                                                    {t("team_plan_total")}
                                                </span>
                                                <span className="text-3xl font-bold">
                                                    {formatPrice(
                                                        teamTotal,
                                                        currency
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    {billingInterval ===
                                                    "annual"
                                                        ? t("price_per_year")
                                                        : t("price_per_month")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold">
                                                {formatPrice(
                                                    priceAmount,
                                                    currency
                                                )}
                                            </span>
                                            <span className="text-muted-foreground text-sm">
                                                {billingInterval === "annual"
                                                    ? t("price_per_year")
                                                    : t("price_per_month")}
                                            </span>
                                        </div>
                                    )}

                                    {/* Badge d'économie */}
                                    {savings && (
                                        <Badge
                                            variant="secondary"
                                            className="mt-2"
                                        >
                                            {t("annual_savings", {
                                                percentage: savings,
                                            })}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col gap-4">
                                {/* Features */}
                                {features.length > 0 && (
                                    <ul className="flex flex-col gap-2">
                                        {features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="text-muted-foreground flex items-start gap-2 text-sm"
                                            >
                                                <span>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Bouton de souscription */}
                                <Button className="mt-auto w-full" size="lg">
                                    {t("subscribe_to_plan")}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
