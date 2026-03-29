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

function parseQuantityInput(value) {
    if (value === "" || !/^\d+$/.test(value)) {
        return null;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue)) {
        return null;
    }

    return parsedValue;
}

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
    subscribeDisabled = false,
    // Update mode (existing subscription)
    currentSeats,
    currentUsage = 0,
}) {
    const t = useTranslations("organization.subscription");
    const { execute, isPending } = useServerAction();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const isSubscribeMode = !!planId;
    const effectiveMinimum = Math.max(minimum, currentUsage);
    const initialQuantity = isSubscribeMode
        ? minimum
        : Math.max(currentSeats ?? minimum, effectiveMinimum);
    const [quantity, setQuantity] = useState(initialQuantity);
    const [inputValue, setInputValue] = useState(String(initialQuantity));
    const parsedInputQuantity = parseQuantityInput(inputValue);
    const isValidQuantity =
        parsedInputQuantity != null &&
        parsedInputQuantity >= effectiveMinimum &&
        (!step || step <= 1 || parsedInputQuantity % step === 0);
    const showMinimumError = parsedInputQuantity != null && parsedInputQuantity < effectiveMinimum;
    const shouldShowTotal = parsedInputQuantity != null && parsedInputQuantity >= effectiveMinimum;

    const handleDecrement = () => {
        const nextQuantity = Math.max(effectiveMinimum, quantity - step);
        setQuantity(nextQuantity);
        setInputValue(String(nextQuantity));
    };

    const handleIncrement = () => {
        const nextQuantity = Math.max(effectiveMinimum, quantity + step);
        setQuantity(nextQuantity);
        setInputValue(String(nextQuantity));
    };

    const handleInputChange = value => {
        if (value !== "" && !/^\d+$/.test(value)) {
            return;
        }

        setInputValue(value);

        if (value === "") {
            return;
        }

        const newValue = parseQuantityInput(value);

        if (newValue == null) {
            return;
        }

        setQuantity(newValue);
    };

    const handleInputBlur = () => {
        if (parsedInputQuantity == null) {
            setInputValue(String(quantity));
            return;
        }

        setInputValue(String(parsedInputQuantity));
    };

    const handleSubscribe = async () => {
        if (!isValidQuantity || parsedInputQuantity == null) {
            return;
        }

        setIsRedirecting(true);
        const result = await execute(
            () => createCheckoutSession({ planId, annual, seats: parsedInputQuantity }),
            {
                refreshOnSuccess: false,
            }
        );

        if (result.success && result.data?.url) {
            window.location.assign(result.data.url);
            return;
        }

        setIsRedirecting(false);
    };

    const handleUpdate = async () => {
        if (!isValidQuantity || parsedInputQuantity == null) {
            return;
        }

        await execute(() => updateSubscriptionQuantityAction({ quantity: parsedInputQuantity }), {
            successMessage: t("quota_updated"),
        });
    };

    const hasChanged =
        currentSeats != null && parsedInputQuantity != null && parsedInputQuantity !== currentSeats;
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
                    value={inputValue}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="text-center"
                    onChange={e => handleInputChange(e.target.value)}
                    onBlur={handleInputBlur}
                    aria-invalid={
                        inputValue !== "" && (parsedInputQuantity == null || !isValidQuantity)
                    }
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
                    ? calculateTieredPrice(tiers, parsedInputQuantity, tiersMode)
                    : parsedInputQuantity * unitPrice;
                return shouldShowTotal ? (
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
            {showMinimumError && (
                <p className="text-xs text-red-500">
                    {t("quota_minimum", { min: effectiveMinimum })}
                </p>
            )}
            {isSubscribeMode && (
                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isRedirecting || isPending || !isValidQuantity || subscribeDisabled}
                >
                    {isRedirecting || isPending
                        ? t("processing_subscription")
                        : freeTrialDays
                          ? t("free_trial_subscribe")
                          : t("subscribe_to_plan")}
                </Button>
            )}
            {!isSubscribeMode && hasChanged && isValidQuantity && (
                <Button
                    onClick={handleUpdate}
                    disabled={isPending || !isValidQuantity}
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
