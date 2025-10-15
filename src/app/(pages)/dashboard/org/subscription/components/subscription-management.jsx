import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { hasPermissionAction } from "@/actions/organization.action";
import {
    getOrganizationSubscriptionAction,
    getOrganizationInvoicesAction,
    getLicenseMovementsSinceLastInvoiceAction,
} from "@/actions/stripe.action";
import SubscriptionDetails from "./subscription-details";
import InvoicesList from "./invoices-list";
import LicenseMovements from "./license-movements";
import ManageSubscriptionButton from "./manage-subscription-button";
import { Badge } from "@/components/ui/badge";
import { SiteConfig } from "@/site-config";

export default async function SubscriptionManagement({ organization }) {
    const t = await getTranslations("organization.subscription");
    const isSeatBased = SiteConfig.billing.type === "seat";

    const canBillingUpdate = await hasPermissionAction({
        permissions: { billing: ["update"] },
    });

    const subscription = await getOrganizationSubscriptionAction({
        organizationId: organization.id,
    });

    if (!subscription) {
        return null;
    }

    const invoices = await getOrganizationInvoicesAction({
        organizationId: organization.id,
        limit: 10,
    });

    // Récupérer les mouvements de licences uniquement en mode "seat"
    const movements = isSeatBased
        ? await getLicenseMovementsSinceLastInvoiceAction({
              organizationId: organization.id,
          })
        : null;

    const statusColorMap = {
        active: "bg-green-500",
        trialing: "bg-blue-500",
        past_due: "bg-yellow-500",
        canceled: "bg-red-500",
        unpaid: "bg-red-500",
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>{t("management_title")}</CardTitle>
                            {subscription.status && (
                                <Badge
                                    className={
                                        statusColorMap[subscription.status] ??
                                        "bg-gray-500"
                                    }
                                >
                                    {t(`status_${subscription.status}`)}
                                </Badge>
                            )}
                        </div>
                        {canBillingUpdate && subscription.stripeCustomerId && (
                            <ManageSubscriptionButton
                                customerId={subscription.stripeCustomerId}
                            />
                        )}
                    </div>
                    <CardDescription>{t("management_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <SubscriptionDetails subscription={subscription} />
                </CardContent>
            </Card>

            {movements && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("movements_title")}</CardTitle>
                        <CardDescription>{t("movements_description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LicenseMovements movements={movements} />
                    </CardContent>
                </Card>
            )}

            {invoices && invoices.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("invoices_title")}</CardTitle>
                        <CardDescription>{t("invoices_description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InvoicesList invoices={invoices} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
