"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateSubscriptionQuantityAction } from "@/actions/quota.action";
import { createCheckoutSession } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { calculateTieredPrice, formatPrice } from "@/lib/utils";

export default function QuantitySelector({
    unitPrice,
    tiers,
    tiersMode,
    currency,
    locale,
    minimum = 1,
    step = 1,
    // Subscribe mode (new subscription)
    planId,
    annual = false,
    freeTrialDays,
    // Update mode (existing subscription)
    currentSeats,
    currentUsage = 0,
}) {
    const t = useTranslations("organization.subscription");
    const { execute, isPending } = useServerAction();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const isSubscribeMode = !!planId;
    const effectiveMinimum = Math.max(minimum, currentUsage);
    const [quantity, setQuantity] = useState(
        isSubscribeMode ? minimum : Math.max(currentSeats ?? minimum, effectiveMinimum)
    );

    const handleDecrement = () => {
        setQuantity(currentQuantity => Math.max(effectiveMinimum, currentQuantity - step));
    };

    const handleIncrement = () => {
        setQuantity(currentQuantity => Math.max(effectiveMinimum, currentQuantity + step));
    };

    const handleInputChange = value => {
        if (value === "") {
            setQuantity(0);
            return;
        }
        // si value n'est pas un nombre, ne rien faire
        if (Number.isNaN(value)) {
            return;
        }
        const newValue = parseInt(value, 10);
        setQuantity(newValue);
    };

    const handleSubscribe = async () => {
        setIsRedirecting(true);
        const data = await createCheckoutSession({ planId, annual, seats: quantity });
        if (data?.url) {
            window.location.href = data.url;
        }
    };

    const handleUpdate = async () => {
        await execute(() => updateSubscriptionQuantityAction({ quantity }), {
            successMessage: t("quota_updated"),
        });
    };

    const hasChanged = currentSeats != null && quantity !== currentSeats;
    const isDisabled = isPending || isRedirecting;

    return (
        <div className="flex flex-col gap-3">
            {isSubscribeMode && <p className="text-sm font-medium">{t("quota_choose")}</p>}
            <ButtonGroup>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={isDisabled || quantity - step < effectiveMinimum}
                >
                    <Minus className="size-4" />
                </Button>
                <Input
                    value={quantity}
                    className="text-center"
                    onChange={e => handleInputChange(e.target.value)}
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={isDisabled}
                >
                    <Plus className="size-4" />
                </Button>
            </ButtonGroup>
            {step > 1 && (
                <p className="text-xs text-muted-foreground">{t("quota_step", { step })}</p>
            )}
            {(() => {
                const isTiered = !!tiersMode && !!tiers;
                const totalAmount = isTiered
                    ? calculateTieredPrice(tiers, quantity, tiersMode)
                    : quantity * unitPrice;
                return totalAmount > 0 ? (
                    <p
                        className={
                            isSubscribeMode ? "text-sm font-bold" : "text-sm text-muted-foreground"
                        }
                    >
                        {t("quota_total", {
                            amount: formatPrice(totalAmount, currency, locale),
                        })}
                    </p>
                ) : null;
            })()}
            {quantity < effectiveMinimum && (
                <p className="text-xs text-red-500">
                    {t("quota_minimum", { min: effectiveMinimum })}
                </p>
            )}
            {isSubscribeMode && (
                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isRedirecting || quantity < effectiveMinimum}
                >
                    {isRedirecting
                        ? t("processing_subscription")
                        : freeTrialDays
                          ? t("free_trial_subscribe")
                          : t("subscribe_to_plan")}
                </Button>
            )}
            {!isSubscribeMode && hasChanged && (
                <Button
                    onClick={handleUpdate}
                    disabled={isPending || quantity < effectiveMinimum}
                    size="sm"
                    className="w-fit"
                >
                    {" "}
                    {isPending ? t("quota_updating") : t("quota_update_button")}
                </Button>
            )}
        </div>
    );
}
