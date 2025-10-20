import DangerZoneForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function DangerZonePage() {
    const tBreadcrumbs = await getTranslations("breadcrumbs");
    const tDangerZone = await getTranslations("user.danger_zone");
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;

    if (!user) {
        notFound();
    }

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
