import { getTranslations } from "next-intl/server";

export default async function AppPage() {
    const t = await getTranslations("app.index");

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">{t("page_title")}</h1>
        </div>
    );
}
