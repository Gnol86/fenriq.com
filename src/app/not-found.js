import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
    const t = await getTranslations("errors.page_404");

    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <div className="flex gap-2 justify-center items-center">
                <div className="text-2xl font-bold">404</div>
                <div className="text-sm">{t("title")}</div>
            </div>
            <Link href="/">
                <Button>{t("button")}</Button>
            </Link>
        </main>
    );
}
