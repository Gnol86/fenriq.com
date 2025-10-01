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

export default async function DangerZonePage() {
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
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Zone dangereuse
                    </CardTitle>
                    <CardDescription>
                        Supprimer votre compte est une action irréversible.
                        Vous perdrez l&apos;accès à toutes vos données et à
                        toutes les organisations. Saisissez votre adresse email
                        pour confirmer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DangerZoneForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
