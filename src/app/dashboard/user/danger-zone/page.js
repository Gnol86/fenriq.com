import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/access-control";
import DangerZoneForm from "./form";

export default async function DangerZonePage() {
    const tBreadcrumbs = await getTranslations("breadcrumbs");
    const tDangerZone = await getTranslations("user.danger_zone");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

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
                    <DangerZoneForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
