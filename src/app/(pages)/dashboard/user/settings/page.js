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
                <CardContent>
                    <UserSettingsForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
