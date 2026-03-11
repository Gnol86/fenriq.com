import ManageImageProfile from "@root/src/components/manage-image-profile";
import { MailCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { requireAuth } from "@/lib/access-control";
import ChangeEmailForm from "./components/change-email-form";
import ChangePasswordForm from "./components/change-password-form";
import UserSettingsForm from "./form";

export default async function UserSettingsPage({ searchParams }) {
    const t = await getTranslations("user.settings");
    const tEmail = await getTranslations("user.settings.change_email");
    const tPassword = await getTranslations("user.settings.change_password");
    const resolvedSearchParams = await searchParams;
    const rawChangeEmailNotice = resolvedSearchParams?.changeEmailNotice;
    const changeEmailNotice = Array.isArray(rawChangeEmailNotice)
        ? (rawChangeEmailNotice[rawChangeEmailNotice.length - 1] ?? "")
        : (rawChangeEmailNotice ?? "");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

    return (
        <div className="flex flex-col gap-6">
            {changeEmailNotice === "verification-sent" && (
                <Alert className="bg-success text-success-foreground">
                    <MailCheck className="size-4" />
                    <AlertTitle>{tEmail("verification_sent_title")}</AlertTitle>
                    <AlertDescription className="text-success-foreground">
                        {tEmail("verification_sent_description")}
                    </AlertDescription>
                </Alert>
            )}

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

            <Card>
                <CardHeader>
                    <CardTitle>{tEmail("card_title")}</CardTitle>
                    <CardDescription>{tEmail("card_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangeEmailForm currentEmail={user.email} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{tPassword("card_title")}</CardTitle>
                    <CardDescription>{tPassword("card_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
