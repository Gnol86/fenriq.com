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
import { redirect } from "next/navigation";
import { hasPermissionAction } from "@/actions/organization.action";

export default async function DangerZonePage() {
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
                    <DangerZoneForm organization={activeUserOrganization} />
                </CardContent>
            </Card>
        </div>
    );
}
