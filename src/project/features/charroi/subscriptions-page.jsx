import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";
import { SubscriptionsManager } from "./subscriptions-manager";

const SUBSCRIPTIONS_PER_PAGE = 10;

export default async function CharroiSubscriptionsPage({ searchParams }) {
    const [t, { organization, user }, resolvedSearchParams] = await Promise.all([
        getTranslations("project.charroi.subscriptions"),
        requireActiveOrganization(),
        searchParams,
    ]);
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "").trim();
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const categoriesWhereClause = {
        organizationId: organization.id,
        isActive: true,
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

    await requirePermission({
        permissions: { checklistSubscription: ["read"] },
    });

    const [member, totalCategories] = await Promise.all([
        prisma.member.findFirst({
            where: {
                organizationId: organization.id,
                userId: user.id,
            },
            select: {
                id: true,
            },
        }),
        prisma.checklistCategory.count({
            where: categoriesWhereClause,
        }),
    ]);
    const totalPages = Math.ceil(totalCategories / SUBSCRIPTIONS_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/project/charroi/subscriptions",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * SUBSCRIPTIONS_PER_PAGE;

    const categories = await prisma.checklistCategory.findMany({
        where: categoriesWhereClause,
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            description: true,
            defaultDeliveryMode: true,
            defaultDigestCron: true,
        },
        skip: offset,
        take: SUBSCRIPTIONS_PER_PAGE,
    });
    const subscriptions =
        member && categories.length > 0
            ? await prisma.checklistMemberSubscription.findMany({
                  where: {
                      organizationId: organization.id,
                      memberId: member.id,
                      categoryId: {
                          in: categories.map(category => category.id),
                      },
                  },
                  select: {
                      categoryId: true,
                      isActive: true,
                      deliveryModeOverride: true,
                  },
              })
            : [];

    const subscriptionsByCategoryId = Object.fromEntries(
        subscriptions.map(subscription => [subscription.categoryId, subscription])
    );

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
                <SubscriptionsManager
                    categories={categories}
                    emptyMessage={searchValue ? t("no_search_results") : t("empty_state")}
                    subscriptionsByCategoryId={subscriptionsByCategoryId}
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
