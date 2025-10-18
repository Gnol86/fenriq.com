"use client";

import Breadcrumb from "@/components/breadcrumb";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function BreadcrumbSlot() {
    const pathname = usePathname();
    const t = useTranslations("breadcrumbs");

    // Extract segments from pathname, excluding empty strings
    const segments = pathname.split("/").filter(Boolean);

    // Need at least 2 segments to show breadcrumbs (e.g., /dashboard/something)
    if (segments.length < 2) return null;

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
