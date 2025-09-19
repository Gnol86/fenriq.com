import { requireUser, requireOrganization } from "@/lib/data-access";
import ManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function OrganizationManagePage() {
    await requireUser();
    const organization = await requireOrganization();
    return (
        <div className="min-h-dvh flex flex-col gap-6 justify-center items-center">
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
