import { hasGlobalPermission, requireOrganization } from "@/lib/auth-access";
import ManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function OrganizationManagePage() {
    const organization = await requireOrganization();

    const can = await hasGlobalPermission({
        organization: ["update"],
    });
    if (!can) redirect("/dashboard");

    return (
        <div className="flex flex-col gap-6">
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
