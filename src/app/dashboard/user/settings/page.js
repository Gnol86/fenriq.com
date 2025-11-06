import ManageImageProfile from "@root/src/components/manage-image-profile";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { requireAuth } from "@/lib/access-control";
import UserSettingsForm from "./form";

export default async function UserSettingsPage() {
    const t = await getTranslations("user.settings");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="font-bold">{t("profile_image_label")}</Label>
                        <ManageImageProfile entity={user} user size="2xl" />
                    </div>
                    <UserSettingsForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
