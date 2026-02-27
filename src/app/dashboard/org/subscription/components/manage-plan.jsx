import { Download } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Fragment } from "react";
import { getSubscriptionDetails } from "@/actions/subscription.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item";
import { requirePermission } from "@/lib/access-control";
import { SiteConfig } from "@/site-config";
import QuantitySelector from "./quantity-selector";

export default async function ManagePlan({ activeSubscription }) {
    await requirePermission({
        permissions: { billing: ["manage"] },
    });

    const t = await getTranslations("organization.subscription");
    const locale = await getLocale();
    const isTeamPlan = activeSubscription.plan.toLowerCase() === "team";

    // Récupérer les détails complets depuis Stripe
    const stripeData = await getSubscriptionDetails(activeSubscription.stripeSubscriptionId);

    const formatDate = date => {
        if (!date) return "N/A";
        // Les timestamps Stripe sont en secondes, on les convertit en millisecondes
        const timestamp = typeof date === "number" ? date * 1000 : date;
        return new Date(timestamp).toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatAmount = (amount, currency) => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const getStatusVariant = status => {
        switch (status) {
            case "active":
                return "default";
            case "trialing":
                return "secondary";
            case "past_due":
            case "unpaid":
                return "destructive";
            default:
                return "outline";
        }
    };

    const { subscription, invoices, price, product } = stripeData;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("current_plan")}</CardTitle>
                    <CardDescription>{t("subscription_info")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("plan_title")}</span>
                            <span className="text-sm font-semibold">{product.name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Statut</span>
                            <Badge variant={getStatusVariant(subscription.status)}>
                                {t(`status_${subscription.status}`)}
                            </Badge>
                        </div>

                        {isTeamPlan && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t("seats_label")}</span>
                                <span className="text-sm">
                                    {subscription.items.data[0].quantity} {t("seats_unit")}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("amount_label")}</span>
                            <span className="text-sm font-semibold">
                                {formatAmount(price.unit_amount, price.currency)} /{" "}
                                {t(`interval_${price.recurring.interval}`)}
                            </span>
                        </div>

                        {product.description && (
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">Description</span>
                                <p className="text-sm text-muted-foreground">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {SiteConfig.quota?.enabled && !isTeamPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("quota_title")}</CardTitle>
                        <CardDescription>{t("quota_description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {t("quota_current", { count: activeSubscription.seats || 1 })}
                                </span>
                            </div>
                            <QuantitySelector
                                currentSeats={activeSubscription.seats || 1}
                                unitPrice={price.unit_amount}
                                currency={price.currency}
                                locale={locale}
                                minimum={SiteConfig.quota.minimum}
                                step={SiteConfig.quota.step}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t("billing_period")}</CardTitle>
                    <CardDescription>{t("subscription_details")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("period_start_label")}</span>
                            <span className="text-sm">
                                {formatDate(subscription.current_period_start)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {subscription.cancel_at_period_end
                                    ? t("period_end_cancel_label")
                                    : t("period_end_renew_label")}
                            </span>
                            <span className="text-sm">
                                {formatDate(subscription.current_period_end)}
                            </span>
                        </div>

                        {subscription.trial_end && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t("trial_end_label")}</span>
                                <span className="text-sm">
                                    {formatDate(subscription.trial_end)}
                                </span>
                            </div>
                        )}
                    </div>

                    {subscription.cancel_at_period_end && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm text-destructive">{t("cancel_notice")}</p>
                        </div>
                    )}

                    {subscription.status === "trialing" && (
                        <div className="bg-secondary/50 border border-secondary rounded-lg p-4">
                            <p className="text-sm">{t("trial_notice")}</p>
                        </div>
                    )}

                    <form
                        action={async () => {
                            "use server";
                            const session =
                                await require("@/lib/stripe").default.billingPortal.sessions.create(
                                    {
                                        customer: subscription.customer,
                                        return_url: `${require("@/lib/server-url").getServerUrl()}/dashboard/org/subscription`,
                                    }
                                );
                            require("next/navigation").redirect(session.url);
                        }}
                    >
                        <Button type="submit" className="w-full">
                            {t("manage_button")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {invoices.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("invoices_title")}</CardTitle>
                        <CardDescription>{t("invoices_description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ItemGroup>
                            {invoices.map((invoice, index) => (
                                <Fragment key={invoice.id}>
                                    <Item>
                                        <ItemContent>
                                            <ItemTitle>
                                                {t("invoice_number", { number: invoice.number })}
                                            </ItemTitle>
                                            <ItemDescription>
                                                {formatDate(invoice.created)}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <Badge variant="outline">
                                                {t(`invoice_status_${invoice.status}`)}
                                            </Badge>
                                            <span className="text-sm font-semibold">
                                                {formatAmount(
                                                    invoice.amount_paid,
                                                    invoice.currency
                                                )}
                                            </span>
                                            {invoice.invoice_pdf && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    render={
                                                        <Link
                                                            href={invoice.invoice_pdf}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        />
                                                    }
                                                >
                                                    <Download className="size-4" />
                                                    PDF
                                                </Button>
                                            )}
                                        </ItemActions>
                                    </Item>
                                    {index < invoices.length - 1 && <ItemSeparator />}
                                </Fragment>
                            ))}
                        </ItemGroup>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
