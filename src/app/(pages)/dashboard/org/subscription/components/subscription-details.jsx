import { getTranslations } from "next-intl/server";
import { Calendar, CreditCard, Users } from "lucide-react";
import { SiteConfig } from "@/site-config";

export default async function SubscriptionDetails({ subscription }) {
    const t = await getTranslations("organization.subscription");
    const tCommon = await getTranslations("common");
    const isSeatBased = SiteConfig.billing.type === "seat";
    const isPlanBased = SiteConfig.billing.type === "plan";

    const formatDate = date => {
        if (!date) return tCommon("n_a");
        return new Date(date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatAmount = (amount, currency) => {
        if (!amount || !currency) return tCommon("n_a");
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
                <div className="rounded-lg border p-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">
                        {t("period_start_label")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {formatDate(subscription.currentPeriodStart)}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="rounded-lg border p-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">
                        {subscription.cancelAtPeriodEnd
                            ? t("period_end_cancel_label")
                            : t("period_end_renew_label")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {formatDate(subscription.currentPeriodEnd)}
                    </div>
                </div>
            </div>

            {(isSeatBased || isPlanBased) && (
                <div className="flex items-start gap-3">
                    <div className="rounded-lg border p-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium">
                            {isPlanBased ? t("usage_limit_label") : t("seats_label")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {subscription.seats ?? tCommon("n_a")} {isPlanBased ? t("usage_limit_unit") : t("seats_unit")}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className="rounded-lg border p-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">
                        {t("amount_label")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {isSeatBased ? (
                            <>
                                {formatAmount(
                                    subscription.amount,
                                    subscription.currency
                                )}
                                {" x "}
                                {subscription.seats}
                                {" = "}
                                <span className="font-bold">
                                    {formatAmount(
                                        subscription.amount * subscription.seats,
                                        subscription.currency
                                    )}
                                    {" / "}
                                    {subscription.interval
                                        ? t(`interval_${subscription.interval}`)
                                        : tCommon("n_a")}
                                </span>
                            </>
                        ) : isPlanBased ? (
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">
                                    {formatAmount(
                                        subscription.amount,
                                        subscription.currency
                                    )}
                                    {" / "}
                                    {subscription.interval
                                        ? t(`interval_${subscription.interval}`)
                                        : tCommon("n_a")}
                                </span>
                                <span className="text-xs">
                                    {t("plan_base_price")}
                                </span>
                            </div>
                        ) : (
                            <span className="font-bold">
                                {formatAmount(
                                    subscription.amount,
                                    subscription.currency
                                )}
                                {" / "}
                                {subscription.interval
                                    ? t(`interval_${subscription.interval}`)
                                    : tCommon("n_a")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {subscription.trialEnd &&
                new Date(subscription.trialEnd) > new Date() && (
                    <div className="flex items-start gap-3 md:col-span-2">
                        <div className="rounded-lg border p-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium">
                                {t("trial_end_label")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {formatDate(subscription.trialEnd)}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
