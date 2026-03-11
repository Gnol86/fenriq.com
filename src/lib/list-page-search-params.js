import { redirect } from "next/navigation";
import { createUrlSearchParams } from "@/lib/utils";

export function getLastSearchParamValue(value, fallback = "") {
    if (Array.isArray(value)) {
        return value[value.length - 1] ?? fallback;
    }

    return value ?? fallback;
}

export function getPageParamState(searchParams, { pageParam = "page", defaultPage = 1 } = {}) {
    const rawPageValue = getLastSearchParamValue(searchParams?.[pageParam], String(defaultPage));
    const parsedPage = Number.parseInt(rawPageValue, 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? defaultPage : parsedPage;

    return {
        page,
        shouldRedirect: rawPageValue !== String(page),
    };
}

export function ensureValidListPage({
    pathname,
    searchParams,
    page,
    totalPages,
    pageParam = "page",
    forceRedirect = false,
}) {
    const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

    if (!forceRedirect && safePage === page) {
        return safePage;
    }

    const params = createUrlSearchParams(searchParams);

    if (safePage === 1) {
        params.delete(pageParam);
    } else {
        params.set(pageParam, String(safePage));
    }

    const query = params.toString();
    redirect(`${pathname}${query ? `?${query}` : ""}`);
}
