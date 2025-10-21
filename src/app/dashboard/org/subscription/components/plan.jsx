import { stripe } from "@/lib/stripe";
import { getTranslations } from "next-intl/server";
import { checkPermission } from "@/lib/access-control";
import SubscribeButton from "./subscribe-button";
import PackSelector from "./pack-selector";
import { BorderBeam } from "@components/ui/border-beam";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SiteConfig } from "@/site-config";

export default async function PlanCard({ organization, lengthTotalMembres }) {
    const t = await getTranslations("organization.subscription");
    const isSeatBased = SiteConfig.billing.type === "seat";
    const isPlanBased = SiteConfig.billing.type === "plan";

    const canBillingUpdate = await checkPermission({
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

    // En mode "plan", récupérer aussi l'ID du pack additionnel
    let packPrice = null;
    if (isPlanBased && process.env.STRIPE_PACK_ID) {
        try {
            packPrice = await stripe.prices.retrieve(
                process.env.STRIPE_PACK_ID,
                {
                    expand: ["product"],
                }
            );
        } catch (error) {
            console.error("❌ Error retrieving pack price:", error);
        }
    }

    return (
        <div className="flex w-full justify-center gap-4">
            <div className="relative flex w-[350px] flex-col gap-4 rounded-2xl border p-5">
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
                {isSeatBased ? (
                    <>
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
                    </>
                ) : isPlanBased ? (
                    <>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">
                                {(price.unit_amount / 100).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                                {price.currency.toUpperCase()} /{" "}
                                {price.recurring?.interval ?? t("once")}
                            </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                            {t("plan_base_includes", {
                                limit: product.metadata?.usage_limit ?? "N/A",
                            })}
                        </div>
                        <div className="text-muted-foreground text-xs">
                            {t("plan_addons_available")}
                        </div>
                    </>
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                            {(price.unit_amount / 100).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                            {price.currency.toUpperCase()} /{" "}
                            {price.recurring?.interval ?? t("once")}
                        </span>
                    </div>
                )}
                <div>
                    {typeof product === "object" && product.metadata && (
                        <div className="flex flex-col gap-2">
                            {Object.entries(product.metadata)
                                .filter(
                                    ([key]) =>
                                        ![
                                            "is_base",
                                            "is_addon",
                                            "usage_limit",
                                        ].includes(key)
                                )
                                .map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-muted-foreground text-sm">
                                            {key}:
                                        </span>
                                        <span className="text-sm">{value}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
                {canBillingUpdate && (
                    <>
                        {isPlanBased && packPrice ? (
                            (() => {
                                const baseUsageLimit = parseInt(
                                    product.metadata?.usage_limit ?? 0
                                );

                                // Chercher usage_limit d'abord sur le product, puis sur le price en fallback
                                const packProductMetadata =
                                    packPrice.product?.metadata ?? {};
                                const packPriceMetadata =
                                    packPrice.metadata ?? {};
                                const packUsageLimitStr =
                                    packProductMetadata.usage_limit ??
                                    packPriceMetadata.usage_limit ??
                                    "0";
                                const packUsageLimit =
                                    parseInt(packUsageLimitStr);

                                return (
                                    <PackSelector
                                        basePriceId={priceId}
                                        packPriceId={process.env.STRIPE_PACK_ID}
                                        organization={organization}
                                        lengthTotalMembres={lengthTotalMembres}
                                        baseUsageLimit={baseUsageLimit}
                                        packUsageLimit={packUsageLimit}
                                        basePriceAmount={price.unit_amount}
                                        packPriceAmount={packPrice.unit_amount}
                                        currency={price.currency}
                                    />
                                );
                            })()
                        ) : (
                            <SubscribeButton
                                priceId={priceId}
                                organization={organization}
                                lengthTotalMembres={lengthTotalMembres}
                            />
                        )}
                    </>
                )}
                <BorderBeam
                    duration={6}
                    delay={3}
                    size={200}
                    borderWidth={2}
                    className="via-primary from-transparent to-transparent"
                />
            </div>
        </div>
    );
}
