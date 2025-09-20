import Breadcrumb from "@/components/breadcrumb";
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
            <Breadcrumb
                items={[
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Organisation" },
                    {
                        name: "Créer une organisation",
                        href: "/dashboard/orgs/new",
                    },
                ]}
            />
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
