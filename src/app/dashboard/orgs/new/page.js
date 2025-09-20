import NewOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function Page() {
    return (
        <div className="flex flex-col gap-6 p-10 max-w-4xl mx-auto">
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
