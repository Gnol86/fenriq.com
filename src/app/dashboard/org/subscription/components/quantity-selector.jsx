"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateSubscriptionQuantityAction } from "@/actions/quota.action";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { formatPrice } from "@/lib/utils";

export default function QuantitySelector({
    currentSeats,
    unitPrice,
    currency,
    currentUsage = 0,
    locale,
    minimum = 1,
    step = 1,
}) {
    const t = useTranslations("organization.subscription");
    const { execute, isPending } = useServerAction();
    const effectiveMinimum = Math.max(minimum, currentUsage);
    const [quantity, setQuantity] = useState(
        Math.max(currentSeats, effectiveMinimum)
    );

    const handleDecrement = () => {
        const newValue = quantity - step;
        if (newValue >= effectiveMinimum) {
            setQuantity(newValue);
        }
    };

    const handleIncrement = () => {
        setQuantity(quantity + step);
    };

    const handleUpdate = async () => {
        await execute(() => updateSubscriptionQuantityAction({ quantity }), {
            successMessage: t("quota_updated"),
        });
    };

    const hasChanged = quantity !== currentSeats;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={isPending || quantity - step < effectiveMinimum}
                >
                    <Minus className="size-4" />
                </Button>
                <span className="text-lg font-semibold tabular-nums w-12 text-center">
                    {quantity}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={isPending}
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            {step > 1 && (
                <p className="text-xs text-muted-foreground">
                    {t("quota_step", { step })}
                </p>
            )}

            {unitPrice > 0 && (
                <p className="text-sm text-muted-foreground">
                    {t("quota_total", {
                        amount: formatPrice(quantity * unitPrice, currency, locale),
                    })}
                </p>
            )}

            {hasChanged && (
                <Button
                    onClick={handleUpdate}
                    disabled={isPending}
                    size="sm"
                    className="w-fit"
                >
                    {isPending ? t("quota_updating") : t("quota_update_button")}
                </Button>
            )}
        </div>
    );
}
