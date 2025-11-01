"use client";

import { AlertTriangle, Copy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function extractErrorInfo(error, t) {
    let statusCode = 500;
    let status = "INTERNAL_SERVER_ERROR";
    let message = t("title");
    let name = error.name || "Error";

    if (error.message?.includes("APIError")) {
        const apiErrorMatch = error.message.match(
            /\[Error \[APIError\]: (.*?)\]/
        );
        if (apiErrorMatch) {
            message = apiErrorMatch[1] || t("auth_error");
        }

        if (error.digest) {
            statusCode = 401;
            status = "UNAUTHORIZED";
            message = t("unauthorized");
            name = "APIError";
        }
    } else if (error.message) {
        message = error.message;
    }

    return {
        statusCode,
        status,
        message,
        name,
        digest: error.digest,
    };
}

export default function ErrorPage({ error, reset }) {
    const t = useTranslations("errors.page_error");
    const errorInfo = extractErrorInfo(error, t);

    return (
        <main className="flex h-dvh w-full flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-bold">{errorInfo.statusCode}</div>
                <div className="text-sm">{t("title")}</div>
            </div>
            <div className="flex gap-4">
                <Button variant="" onClick={() => reset()}>
                    {t("retry_button")}
                </Button>
                <Link href="/">
                    <Button variant="outline">{t("home_button")}</Button>
                </Link>
            </div>
            {process.env.VERCEL_ENV !== "production" && (
                <Alert variant="destructive" className={"w-md"}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground absolute top-0 right-0"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                JSON.stringify(
                                    {
                                        message: error.message,
                                        name: error.name,
                                        digest: error.digest,
                                        stack: error.stack,
                                    },
                                    null,
                                    2
                                )
                            );
                            toast.success(t("copy_success"));
                        }}
                    >
                        <Copy />
                    </Button>
                    <AlertTriangle />
                    <AlertTitle>{errorInfo.name}</AlertTitle>
                    <AlertDescription>
                        <div>Message: {error.message}</div>
                        {error.digest && <div>Digest: {error.digest}</div>}
                    </AlertDescription>
                </Alert>
            )}
        </main>
    );
}
