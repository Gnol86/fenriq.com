import ManageImageProfile from "@root/src/components/manage-image-profile";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { requirePermission } from "@/lib/access-control";
import ManageOrganizationForm from "./form";

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

                        <ManageImageProfile entity={organization} orga size="2xl" />
                    </div>
                    <ManageOrganizationForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
