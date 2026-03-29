"use client";

import {
    cancelSubscriptionAtPeriodEnd,
    changeSubscriptionPlan,
    createPaymentMethodUpdateSession,
    restoreSubscription,
    toggleSubscriptionInterval,
} from "@project/actions/subscription-management.action";
import { AlertTriangle, CreditCard, RefreshCcw, ShieldAlert, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";
import { calculateTieredPrice, formatPrice } from "@/lib/utils";

function getPlanAmount(price) {
    if (!price) {
        return null;
    }

    if (!price.tiersMode) {
        return price.amount;
    }

    const minimumQuantity = price.tiers?.[0]?.up_to ?? 1;
    return calculateTieredPrice(price.tiers, minimumQuantity, price.tiersMode);
}

function isPaymentIssueStatus(status) {
    return status === "past_due" || status === "unpaid";
}

export default function SubscriptionManagementPanel({
    currentPlanName,
    currentInterval,
    subscriptionStatus,
    cancelAtPeriodEnd = false,
    plans,
    locale,
}) {
    const t = useTranslations("organization.subscription");
    const { execute, isPending } = useServerAction();
    const hasPaymentIssue = isPaymentIssueStatus(subscriptionStatus);

    const handlePlanSelection = async ({ targetPlanId, annual, isCurrentPlan }) => {
        const action = isCurrentPlan
            ? () => toggleSubscriptionInterval({ annual })
            : () => changeSubscriptionPlan({ targetPlanId, annual });

        await execute(action, {
            loadingMessage: t("change_plan_loading"),
            successMessage: t("change_plan_success"),
        });
    };

    const handleUpdatePaymentMethod = async () => {
        const result = await execute(() => createPaymentMethodUpdateSession(), {
            loadingMessage: t("payment_method_update_loading"),
            refreshOnSuccess: false,
        });

        if (result.success && result.data?.url) {
            window.location.assign(result.data.url);
        }
    };

    const handleCancelSubscription = () => {
        dialogManager.confirm({
            title: t("cancel_subscription_confirm_title"),
            description: t("cancel_subscription_confirm_description"),
            action: {
                label: t("cancel_subscription"),
                variant: "destructive",
                onClick: async () => {
                    await cancelSubscriptionAtPeriodEnd();
                },
                successMessage: t("cancel_subscription_success"),
            },
        });
    };

    const handleRestoreSubscription = () => {
        dialogManager.confirm({
            title: t("restore_subscription_confirm_title"),
            description: t("restore_subscription_confirm_description"),
            action: {
                label: t("restore_subscription"),
                onClick: async () => {
                    await restoreSubscription();
                },
                successMessage: t("restore_subscription_success"),
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("management_actions_title")}</CardTitle>
                    <CardDescription>{t("management_actions_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {hasPaymentIssue && (
                        <Alert>
                            <ShieldAlert className="size-4" />
                            <AlertTitle>{t(`status_${subscriptionStatus}`)}</AlertTitle>
                            <AlertDescription>{t("payment_issue_notice")}</AlertDescription>
                        </Alert>
                    )}

                    {cancelAtPeriodEnd && (
                        <Alert>
                            <AlertTriangle className="size-4" />
                            <AlertTitle>{t("cancel_subscription")}</AlertTitle>
                            <AlertDescription>{t("change_plan_restore_first")}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            className="sm:flex-1"
                            onClick={handleUpdatePaymentMethod}
                            disabled={isPending}
                        >
                            <CreditCard className="size-4" />
                            {t("update_payment_method")}
                        </Button>

                        {cancelAtPeriodEnd ? (
                            <Button
                                variant="outline"
                                className="sm:flex-1"
                                onClick={handleRestoreSubscription}
                                disabled={isPending}
                            >
                                <RefreshCcw className="size-4" />
                                {t("restore_subscription")}
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                className="sm:flex-1"
                                onClick={handleCancelSubscription}
                                disabled={isPending}
                            >
                                <XCircle className="size-4" />
                                {t("cancel_subscription")}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("change_plan_title")}</CardTitle>
                    <CardDescription>{t("change_plan_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {plans.map(plan => {
                        const isCurrentPlan =
                            plan.name.toLowerCase() === currentPlanName.toLowerCase();
                        const monthlyIsCurrent = isCurrentPlan && currentInterval === "month";
                        const annualIsCurrent = isCurrentPlan && currentInterval === "year";
                        const monthlyAmount = getPlanAmount(plan.monthlyPrice);
                        const annualAmount = getPlanAmount(plan.annualPrice);
                        const disablePlanChanges =
                            isPending || cancelAtPeriodEnd || hasPaymentIssue;

                        return (
                            <div
                                key={plan.id}
                                className="flex flex-col gap-3 rounded-lg border p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium">{plan.name}</div>
                                        {plan.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        )}
                                    </div>
                                    {isCurrentPlan && (
                                        <Badge variant="secondary">
                                            {t("change_plan_current_badge")}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        variant={monthlyIsCurrent ? "secondary" : "outline"}
                                        className="sm:flex-1"
                                        disabled={disablePlanChanges || monthlyIsCurrent}
                                        onClick={() =>
                                            handlePlanSelection({
                                                targetPlanId: plan.id,
                                                annual: false,
                                                isCurrentPlan,
                                            })
                                        }
                                    >
                                        {t("billing_toggle_monthly")}
                                        {monthlyAmount != null && (
                                            <>
                                                {" "}
                                                ·{" "}
                                                {formatPrice(
                                                    monthlyAmount,
                                                    plan.monthlyPrice.currency,
                                                    locale
                                                )}
                                            </>
                                        )}
                                    </Button>

                                    {plan.annualPrice && annualAmount != null && (
                                        <Button
                                            variant={annualIsCurrent ? "secondary" : "outline"}
                                            className="sm:flex-1"
                                            disabled={disablePlanChanges || annualIsCurrent}
                                            onClick={() =>
                                                handlePlanSelection({
                                                    targetPlanId: plan.id,
                                                    annual: true,
                                                    isCurrentPlan,
                                                })
                                            }
                                        >
                                            {t("billing_toggle_annual")}
                                            {" · "}
                                            {formatPrice(
                                                annualAmount,
                                                plan.annualPrice.currency,
                                                locale
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
