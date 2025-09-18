import NewOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
    return (
        <div className="max-w-xl space-y-6">
            <Button variant="ghost" asChild className="gap-2 w-fit">
                <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au tableau de bord
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Créer une organisation</CardTitle>
                    <CardDescription>
                        Donnez un nom à votre organisation pour commencer à
                        collaborer avec votre équipe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewOrganizationForm />
                </CardContent>
            </Card>
        </div>
    );
}
