"use client";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { createCheckoutSessionAction } from "@/actions/stripe.action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export default function PackSelector({
    basePriceId,
    packPriceId,
    organization,
    lengthTotalMembres,
    baseUsageLimit,
    packUsageLimit,
    basePriceAmount,
    packPriceAmount,
    currency,
}) {
    const t = useTranslations("organization.subscription");
    const { isPending } = useServerAction();
    const [packQuantity, setPackQuantity] = useState(0);

    const totalUsageLimit = baseUsageLimit + packQuantity * packUsageLimit;
    const totalAmount = basePriceAmount + packQuantity * packPriceAmount;

    const handleSubscribe = async () => {
        const result = await createCheckoutSessionAction({
            basePriceId,
            packPriceId: packQuantity > 0 ? packPriceId : null,
            packQuantity,
            organizationId: organization.id,
            quantity: lengthTotalMembres, // Sera ignoré en mode plan
            successUrl: `${window.location.origin}/dashboard/org/subscription?success=true`,
            cancelUrl: `${window.location.origin}/dashboard/org/subscription?canceled=true`,
        });

        if (result?.url) {
            window.location.href = result.url;
        }

        return result;
    };

    const incrementPacks = () => {
        setPackQuantity(prev => prev + 1);
    };

    const decrementPacks = () => {
        setPackQuantity(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Pack selection */}
            <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                            {t("pack_selector_label")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {t("pack_selector_description", {
                                limit: packUsageLimit,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ButtonGroup>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={decrementPacks}
                                disabled={packQuantity === 0 || isPending}
                            >
                                <Minus />
                            </Button>
                            <Input
                                value={packQuantity}
                                onChange={e => {
                                    const value = Math.max(
                                        0,
                                        parseInt(e.target.value) || 0
                                    );
                                    setPackQuantity(value);
                                }}
                                className="font-bold w-12 text-center px-0"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={incrementPacks}
                                disabled={isPending}
                            >
                                <Plus />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                {packQuantity > 0 && (
                    <div className="text-xs text-muted-foreground">
                        {t("pack_price_info", {
                            count: packQuantity,
                            amount: (packPriceAmount / 100).toFixed(2),
                            total: (
                                (packQuantity * packPriceAmount) /
                                100
                            ).toFixed(2),
                            currency: currency.toUpperCase(),
                        })}
                    </div>
                )}
            </div>

            {/* Total summary */}
            <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {t("total_usage_limit")}
                    </span>
                    <span className="text-sm font-bold">
                        {totalUsageLimit} {t("usage_limit_unit")}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {t("total_price_label")}
                    </span>
                    <span className="text-lg font-bold">
                        {(totalAmount / 100).toFixed(2)}{" "}
                        {currency.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Subscribe button */}
            <Button onClick={handleSubscribe} disabled={isPending} size="lg">
                {isPending ? t("subscribe_loading") : t("subscribe_button")}
            </Button>
        </div>
    );
}
