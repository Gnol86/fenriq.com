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
import { getTranslations } from "next-intl/server";

export default async function AdminOrganizationManagePage({ params }) {
    const { slug } = params;
    const tAdminManage = await getTranslations("admin.org_manage");
    const tOrgManage = await getTranslations("organization.manage");

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
                    <CardTitle>{tAdminManage("page_title")}</CardTitle>
                    <CardDescription className="flex flex-col gap-2">
                        {tAdminManage("page_description", {
                            name: organization.name,
                        })}
                        <span className="text-muted-foreground">
                            {tAdminManage("page_note")}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminManageOrganizationForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
