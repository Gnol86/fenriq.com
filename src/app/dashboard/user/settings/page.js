import UserSettingsForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ImageUploadUser from "./image-upload-user";
import { Label } from "@/components/ui/label";

export default async function UserSettingsPage() {
    const t = await getTranslations("user.settings");
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;

    if (!user) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="font-bold">
                            {t("profile_image_label")}
                        </Label>
                        <ImageUploadUser user={user} />
                    </div>
                    <UserSettingsForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
