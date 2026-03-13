import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPermission, requirePermission } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";
import { CategoriesManager } from "./components/categories-manager";

const CATEGORIES_PER_PAGE = 10;

export default async function Page({ searchParams }) {
    const [t, { organization }, resolvedSearchParams] = await Promise.all([
        getTranslations("project.charroi.categories"),
        requirePermission({
            permissions: { checklistCategory: ["read"] },
        }),
        searchParams,
    ]);
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "").trim();
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const whereClause = {
        organizationId: organization.id,
        ...(searchValue
            ? {
                  OR: [
                      {
                          name: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          description: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),
    };

    const [canManage, totalCategories] = await Promise.all([
        checkPermission({
            permissions: { checklistCategory: ["update"] },
        }),
        prisma.checklistCategory.count({
            where: whereClause,
        }),
    ]);
    const totalPages = Math.ceil(totalCategories / CATEGORIES_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/project/charroi/categories",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * CATEGORIES_PER_PAGE;
    const categories = await prisma.checklistCategory.findMany({
        where: whereClause,
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            description: true,
            defaultDeliveryMode: true,
            defaultDigestCron: true,
            timeZone: true,
            isActive: true,
        },
        skip: offset,
        take: CATEGORIES_PER_PAGE,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <SearchInput
                    placeholder={t("search_placeholder")}
                    initialValue={searchValue}
                    searchParams={resolvedSearchParams}
                />
                <CategoriesManager
                    canManage={canManage}
                    categories={categories}
                    emptyMessage={searchValue ? t("no_search_results") : t("empty_state")}
                />
                <Pagination
                    totalPages={totalPages}
                    page={safePage}
                    searchParams={resolvedSearchParams}
                />
            </CardContent>
        </Card>
    );
}
