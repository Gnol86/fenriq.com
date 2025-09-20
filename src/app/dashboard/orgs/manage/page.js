import { requireOrganization } from "@/lib/auth-access";
import ManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Breadcrumb from "@/components/breadcrumb";

export default async function OrganizationManagePage() {
    const organization = await requireOrganization();

    return (
        <div className="flex flex-col gap-6 p-10 max-w-4xl mx-auto">
            <Breadcrumb
                items={[
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Organisation" },
                    {
                        name: "Gérer l'organisation",
                        href: "/dashboard/orgs/manage",
                    },
                ]}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Gérer l&apos;organisation</CardTitle>
                    <CardDescription>
                        Modifiez les informations principales de votre
                        organisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ManageOrganizationForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
