import { MailQuestionMark } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormResendVerification from "./form";

export default async function Page({ searchParams }) {
    const t = await getTranslations("auth.verify_email");
    const resolvedSearchParams = await searchParams;
    const rawEmail = resolvedSearchParams?.email;
    const email = Array.isArray(rawEmail)
        ? (rawEmail[rawEmail.length - 1] ?? "")
        : (rawEmail ?? "");

    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <div>
                    <CardTitle className="text-xl">{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </div>
                <div>
                    <MailQuestionMark size={42} className="text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <FormResendVerification initialEmail={email} />
            </CardContent>
        </Card>
    );
}
