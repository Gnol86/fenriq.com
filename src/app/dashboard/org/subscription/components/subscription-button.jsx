"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createCheckoutSession } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";

export default function SubscriptionButton({
    planId,
    annual = false,
    seats,
    freeTrialDays,
    subscribeDisabled = false,
}) {
    const { execute, isPending } = useServerAction();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const t = useTranslations("organization.subscription");

    const handleSubscribe = async () => {
        setIsRedirecting(true);

        const result = await execute(() => createCheckoutSession({ planId, annual, seats }), {
            refreshOnSuccess: false,
        });

        if (result.success && result.data?.url) {
            window.location.assign(result.data.url);
            return;
        }

        setIsRedirecting(false);
    };

    const label = freeTrialDays ? t("free_trial_subscribe") : t("subscribe_to_plan");

    return (
        <Button
            size="lg"
            className="w-full"
            onClick={handleSubscribe}
            disabled={isPending || isRedirecting || subscribeDisabled}
        >
            {isPending || isRedirecting ? t("processing_subscription") : label}
        </Button>
    );
}
