import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Page() {
    const t = await getTranslations("auth.email_verified");

    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={75}
                    height={75}
                />
                <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl text-green-600">
                        {t("page_title")}
                    </CardTitle>
                    <CardDescription>
                        {t("page_description")}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Link href="/app" className="flex-1">
                        <Button className="w-full">
                            {t("go_to_app_button")}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
