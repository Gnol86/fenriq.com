import AdminDangerZoneForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { getOrganizationBySlugAsAdminAction } from "@/actions/admin.action";
import { getTranslations } from "next-intl/server";

export default async function AdminDangerZonePage({ params }) {
    const t = await getTranslations("admin.organizations");
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
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t("admin_danger_zone_title")}
                    </CardTitle>
                    <CardDescription>
                        {t("admin_danger_zone_description", {
                            name: organization.name,
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <h4 className="font-medium text-destructive mb-3">
                            {t("admin_danger_zone_consequences_title")}
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>{t("admin_danger_zone_consequence_1")}</li>
                            <li>{t("admin_danger_zone_consequence_2")}</li>
                            <li>{t("admin_danger_zone_consequence_3")}</li>
                            <li>{t("admin_danger_zone_consequence_4")}</li>
                            <li>{t("admin_danger_zone_consequence_5")}</li>
                        </ul>
                    </div>

                    <AdminDangerZoneForm organization={organization} />
                </CardContent>
            </Card>
        </div>
    );
}
