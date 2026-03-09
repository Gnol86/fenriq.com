import { KeyRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormSignin from "./form";

export default async function Page({ searchParams }) {
    const t = await getTranslations("auth.signin");
    const resolvedSearchParams = await searchParams;
    const rawEmail = resolvedSearchParams?.email;
    const rawCallback = resolvedSearchParams?.callback;
    const email = Array.isArray(rawEmail)
        ? (rawEmail[rawEmail.length - 1] ?? "")
        : (rawEmail ?? "");
    const callbackURL = Array.isArray(rawCallback)
        ? (rawCallback[rawCallback.length - 1] ?? "/app")
        : (rawCallback ?? "/app");

    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <div>
                    <CardTitle className="text-xl">{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </div>
                <div>
                    <KeyRound size={42} className="text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <FormSignin initialEmail={email} callbackURL={callbackURL} />
            </CardContent>
        </Card>
    );
}
