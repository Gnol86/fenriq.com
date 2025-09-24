import ManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermissionAction } from "@/actions/organization.action";

export default async function OrganizationManagePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canOrgsUpdate = await hasPermissionAction({
        permissions: { organization: ["update"] },
    });
    if (!canOrgsUpdate) redirect("/dashboard");

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
                    <ManageOrganizationForm
                        organization={activeUserOrganization}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
