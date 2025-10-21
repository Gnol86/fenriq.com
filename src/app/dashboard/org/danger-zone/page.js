import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import { PrismaClient } from "@root/prisma/generated";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import DangerZoneForm from "./form";

const prisma = new PrismaClient();

export default async function DangerZonePage() {
    const tBreadcrumbs = await getTranslations("breadcrumbs");
    const tDangerZone = await getTranslations("organization.danger_zone");

    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { organization: ["delete"] },
    });

    // Check if organization has active subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organization.id,
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
                        organization={organization}
                        hasActiveSubscription={!!subscription}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
