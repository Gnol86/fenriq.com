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
import { getTranslations } from "next-intl/server";
import { Label } from "@/components/ui/label";
import ImageUpload from "./image-upload-orgs";

export default async function OrganizationManagePage() {
    const t = await getTranslations("organization.manage");
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
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="font-bold">{t("logo_label")}</Label>

                        <ImageUpload organization={activeUserOrganization} />
                    </div>
                    <ManageOrganizationForm
                        organization={activeUserOrganization}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
