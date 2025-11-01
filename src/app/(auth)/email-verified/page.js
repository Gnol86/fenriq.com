import { MailCheck } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function Page() {
    const t = await getTranslations("auth.email_verified");

    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <div>
                    <CardTitle className="text-success text-xl">
                        {t("page_title")}
                    </CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </div>
                <div>
                    <MailCheck size={42} className="text-success" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button className="w-full" asChild>
                        <Link href="/app" className="flex-1">
                            {t("go_to_app_button")}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
