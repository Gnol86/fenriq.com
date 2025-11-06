"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createCheckoutSession } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";

export default function SubscriptionButton({ planId, billingInterval = "monthly" }) {
    const [isPending, setIsPending] = useState(false);
    const t = useTranslations("organization.subscription");

    const handleSubscribe = async () => {
        setIsPending(true);
        const data = await createCheckoutSession({ planId, billingInterval });

        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={isPending}>
            {isPending ? t("processing_subscription") : t("subscribe_to_plan")}
        </Button>
    );
}
