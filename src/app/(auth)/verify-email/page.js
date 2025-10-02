import Image from "next/image";
import FormResendVerification from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function Page() {
    const t = await getTranslations("auth.verify_email");

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
                    <CardTitle className="text-xl">
                        {t("page_title")}
                    </CardTitle>
                    <CardDescription>
                        {t("page_description")}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <FormResendVerification />
            </CardContent>
        </Card>
    );
}
