"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import SubscriptionButton from "./subscription-button";

export default function PlanQuantityPicker({
    planId,
    annual,
    unitPrice,
    currency,
    locale,
    minimum = 1,
    step = 1,
}) {
    const t = useTranslations("organization.subscription");
    const [quantity, setQuantity] = useState(minimum);

    const handleDecrement = () => {
        const newValue = quantity - step;
        if (newValue >= minimum) {
            setQuantity(newValue);
        }
    };

    const handleIncrement = () => {
        setQuantity(quantity + step);
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{t("quota_choose")}</p>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={quantity - step < minimum}
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
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            {step > 1 && (
                <p className="text-xs text-muted-foreground">
                    {t("quota_step", { step })}
                </p>
            )}

            <p className="text-sm font-bold">
                {t("quota_total", {
                    amount: formatPrice(quantity * unitPrice, currency, locale),
                })}
            </p>

            <SubscriptionButton planId={planId} annual={annual} seats={quantity} />
        </div>
    );
}
