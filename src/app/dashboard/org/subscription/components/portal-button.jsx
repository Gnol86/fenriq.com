"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createBillingPortalSession } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";

export default function PortalButton() {
    const [isPending, setIsPending] = useState(false);
    const t = useTranslations("organization.subscription");

    const handleSubscribe = async () => {
        setIsPending(true);
        const data = await createBillingPortalSession();

        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={isPending}>
            {isPending ? t("processing_subscription") : t("manage_plan")}
        </Button>
    );
}
