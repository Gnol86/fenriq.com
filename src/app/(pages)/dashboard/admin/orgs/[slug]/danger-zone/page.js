import AdminDangerZoneForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { getOrganizationBySlugAsAdminAction } from "@/actions/admin.action";

export default async function AdminDangerZonePage({ params }) {
    const { slug } = params;

    const organizationResult = await getOrganizationBySlugAsAdminAction({ slug });

    if (!organizationResult || organizationResult.error) {
        notFound();
    }

    const organization = organizationResult;

    return (
        <div className="flex flex-col gap-6">
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Zone dangereuse (Admin)
                    </CardTitle>
                    <CardDescription>
                        En tant qu&apos;administrateur, vous pouvez supprimer l&apos;organisation
                        <strong> {organization.name}</strong>. Cette action est irréversible et aura
                        les conséquences suivantes :
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <h4 className="font-medium text-destructive mb-3">
                            Conséquences de la suppression :
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Tous les membres perdront l&apos;accès immédiatement</li>
                            <li>• Toutes les données de l&apos;organisation seront supprimées</li>
                            <li>• Les invitations en cours seront annulées</li>
                            <li>• Les sessions actives seront terminées</li>
                            <li>• Cette action ne peut pas être annulée</li>
                        </ul>
                    </div>

                    <AdminDangerZoneForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}