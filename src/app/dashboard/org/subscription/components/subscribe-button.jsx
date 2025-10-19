"use client";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { createCheckoutSessionAction } from "@/actions/stripe.action";
import { useTranslations } from "next-intl";
import { SiteConfig } from "@/site-config";

export default function SubscribeButton({
    priceId,
    organization,
    lengthTotalMembres,
}) {
    const t = useTranslations("organization.subscription");
    const { isPending } = useServerAction();

    const handleSubscribe = async () => {
        // En mode "subscription", toujours passer quantity = 1
        const quantity =
            SiteConfig.billing.type === "subscription" ? 1 : lengthTotalMembres;

        const result = await createCheckoutSessionAction({
            priceId,
            organizationId: organization.id,
            quantity,
            successUrl: `${window.location.origin}/dashboard/org/subscription?success=true`,
            cancelUrl: `${window.location.origin}/dashboard/org/subscription?canceled=true`,
        });

        if (result?.url) {
            window.location.href = result.url;
        }

        return result;
    };

    return (
        <Button onClick={handleSubscribe} disabled={isPending} size="lg">
            {isPending ? t("subscribe_loading") : t("subscribe_button")}
        </Button>
    );
}
