"use client";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { createPortalSessionAction } from "@/actions/stripe.action";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";

export default function ManageSubscriptionButton({ customerId }) {
    const t = useTranslations("organization.subscription");
    const { execute, isPending } = useServerAction();

    const handleManage = async () => {
        const result = await createPortalSessionAction({
            customerId,
            returnUrl: `${window.location.origin}/dashboard/org/subscription`,
        });

        if (result?.url) {
            window.location.href = result.url;
        }

        return result;
    };

    return (
        <Button onClick={handleManage} disabled={isPending} variant="outline">
            <Settings className="h-4 w-4" />
            {isPending ? t("manage_loading") : t("manage_button")}
        </Button>
    );
}
