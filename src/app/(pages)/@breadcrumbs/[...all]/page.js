import Breadcrumb from "@/components/breadcrumb";
import { getTranslations } from "next-intl/server";

export default async function BreadcrumbSlot({ params }) {
    const resolvedParams = await params;
    const segments = resolvedParams.all || [];

    if (segments.length < 2) return null;

    const t = await getTranslations("breadcrumbs");

    let href = "";
    const items = segments.map(seg => {
        href += "/" + seg;
        const key = seg.replace(/-/g, "_");
        const name = t.has(key) ? t(key) : decodeURIComponent(seg);
        return {
            name,
            href: href,
        };
    });

    return <Breadcrumb items={items} />;
}
