import { hasPermissionAction } from "@/actions/organization.action";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@root/prisma/generated";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DangerZoneForm from "./form";

const prisma = new PrismaClient();

export default async function DangerZonePage() {
    const tBreadcrumbs = await getTranslations("breadcrumbs");
    const tDangerZone = await getTranslations("organization.danger_zone");
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canOrgsDelete = await hasPermissionAction({
        permissions: { organization: ["delete"] },
    });
    if (!canOrgsDelete) redirect("/dashboard");

    // Check if organization has active subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: activeUserOrganization.id,
            status: {
                in: ["active", "trialing", "past_due"],
            },
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {tBreadcrumbs("danger_zone")}
                    </CardTitle>
                    <CardDescription>
                        {tDangerZone("card_description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DangerZoneForm
                        organization={activeUserOrganization}
                        hasActiveSubscription={!!subscription}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
