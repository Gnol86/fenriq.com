import AdminManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getOrganizationBySlugAsAdminAction } from "@/actions/admin.action";

export default async function AdminOrganizationManagePage({ params }) {
    const { slug } = params;

    const organizationResult = await getOrganizationBySlugAsAdminAction({
        slug,
    });

    if (!organizationResult || organizationResult.error) {
        notFound();
    }

    const organization = organizationResult;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gérer l&apos;organisation</CardTitle>
                    <CardDescription>
                        Modifiez les informations principales de
                        l&apos;organisation {organization.name}. En tant
                        qu&apos;administrateur, vous pouvez modifier toutes les
                        organisations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminManageOrganizationForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
