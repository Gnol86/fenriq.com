import { stripe } from "@/lib/stripe";
import { getTranslations } from "next-intl/server";
import { hasPermissionAction } from "@/actions/organization.action";
import SubscribeButton from "./subscribe-button";
import { BorderBeam } from "@components/ui/border-beam";

export default async function PlanCard({ organization, lengthTotalMembres }) {
    const t = await getTranslations("organization.subscription");

    const canBillingUpdate = await hasPermissionAction({
        permissions: { billing: ["update"] },
    });

    const priceId = process.env.STRIPE_MONTHLY_PLAN_ID;

    if (!priceId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("plan_title")}</CardTitle>
                    <CardDescription>
                        {t("plan_not_configured")}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const price = await stripe.prices.retrieve(priceId, {
        expand: ["product"],
    });

    const product = price.product;

    return (
        <div className="flex gap-4 w-full justify-center">
            <div className="relative border rounded-2xl w-[350px] p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold">
                        {typeof product === "object"
                            ? product.name
                            : t("plan_title")}
                    </div>
                    <div>
                        {typeof product === "object" && product.description
                            ? product.description
                            : t("plan_description")}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                        {(price.unit_amount / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                        {price.currency.toUpperCase()} /{" "}
                        {price.recurring?.interval ?? t("once")}
                    </span>
                </div>
                <div className="text-sm">
                    {t("members_total_notice", {
                        count: lengthTotalMembres,
                    })}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                        {(
                            (price.unit_amount / 100) *
                            lengthTotalMembres
                        ).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                        {price.currency.toUpperCase()} /{" "}
                        {price.recurring?.interval ?? t("once")}
                    </span>
                </div>
                <div>
                    {typeof product === "object" && product.metadata && (
                        <div className="flex flex-col gap-2">
                            {Object.entries(product.metadata).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-sm text-muted-foreground">
                                            {key}:
                                        </span>
                                        <span className="text-sm">{value}</span>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
                {canBillingUpdate && (
                    <SubscribeButton
                        priceId={priceId}
                        organization={organization}
                        lengthTotalMembres={lengthTotalMembres}
                    />
                )}
                <BorderBeam
                    duration={6}
                    delay={3}
                    size={200}
                    borderWidth={2}
                    className="from-transparent via-primary to-transparent"
                />
            </div>
        </div>
    );
}
