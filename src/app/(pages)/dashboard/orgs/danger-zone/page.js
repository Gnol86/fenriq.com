import DangerZoneForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { hasGlobalPermission, requireOrganization } from "@/lib/auth-access";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DangerZonePage() {
    const organization = await requireOrganization();

    const can = await hasGlobalPermission({
        organization: ["delete"],
    });
    if (!can) redirect("/dashboard");

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Zone dangereuse
                    </CardTitle>
                    <CardDescription>
                        Supprimer une organisation est une action irréversible.
                        Tous les membres perdront l&apos;accès aux données
                        associées. Saisissez le nom de l&apos;organisation pour
                        confirmer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DangerZoneForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
