import ManageOrganizationForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import { getTranslations } from "next-intl/server";
import { Label } from "@/components/ui/label";
import ImageUpload from "./image-upload-orgs";

export default async function OrganizationManagePage() {
    const t = await getTranslations("organization.manage");

    // Vérifie les permissions et récupère les données nécessaires
    const { organization } = await requirePermission({
        permissions: { organization: ["update"] },
    });

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

                        <ImageUpload organization={organization} />
                    </div>
                    <ManageOrganizationForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
