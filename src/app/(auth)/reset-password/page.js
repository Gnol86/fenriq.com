import { CircleAlert, KeyRound } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormResetPassword from "./form";

export default async function Page({ searchParams }) {
    const t = await getTranslations("auth.reset_password");
    const resolvedSearchParams = await searchParams;
    const rawToken = resolvedSearchParams?.token;
    const rawEmail = resolvedSearchParams?.email;
    const rawError = resolvedSearchParams?.error;
    const token = Array.isArray(rawToken)
        ? (rawToken[rawToken.length - 1] ?? "")
        : (rawToken ?? "");
    const email = Array.isArray(rawEmail)
        ? (rawEmail[rawEmail.length - 1] ?? "")
        : (rawEmail ?? "");
    const error = Array.isArray(rawError)
        ? (rawError[rawError.length - 1] ?? "")
        : (rawError ?? "");
    const forgotPasswordHref = email
        ? `/forgot-password?email=${encodeURIComponent(email)}`
        : "/forgot-password";

    if (!token || error === "INVALID_TOKEN") {
        return (
            <Card className="w-sm">
                <CardHeader className="flex items-start gap-4">
                    <div>
                        <CardTitle className="text-xl">{t("page_title")}</CardTitle>
                        <CardDescription>{t("page_description")}</CardDescription>
                    </div>
                    <div>
                        <CircleAlert size={42} className="text-primary" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Alert variant="destructive">
                        <CircleAlert className="size-4" />
                        <AlertTitle>{t("invalid_token_title")}</AlertTitle>
                        <AlertDescription>{t("invalid_token_description")}</AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                        <Link href={forgotPasswordHref} className="flex-1">
                            <Button className="w-full">{t("request_new_link_button")}</Button>
                        </Link>
                        <Link href="/signin">
                            <Button variant="ghost">{t("back_to_signin_button")}</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                <FormResetPassword token={token} initialEmail={email} />
            </CardContent>
        </Card>
    );
}
