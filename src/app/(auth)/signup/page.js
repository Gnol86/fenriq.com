import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import FormSignup from "./form";

export default async function Page() {
    const t = await getTranslations("auth.signup");

    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <div>
                    <CardTitle className="text-xl">{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </div>
                <div>
                    <ScrollText size={42} className="text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <FormSignup />
            </CardContent>
        </Card>
    );
}
