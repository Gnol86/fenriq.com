import { CharroiQuotaAlert } from "@project/components/charroi/charroi-quota-alert";
import { getCharroiQuotaStatus } from "@project/lib/charroi/quota";
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
import { TemplatesManager } from "./components/templates-manager";

const TEMPLATES_PER_PAGE = 10;

export default async function Page({ searchParams }) {
    const [t, { organization }, resolvedSearchParams] = await Promise.all([
        getTranslations("project.charroi.checklists"),
        requirePermission({
            permissions: { checklist: ["read"] },
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

    const [quotaStatus, canCreate, canEdit, canDelete, totalTemplates] = await Promise.all([
        getCharroiQuotaStatus({
            organizationId: organization.id,
        }),
        checkPermission({
            permissions: { checklist: ["create"] },
        }),
        checkPermission({
            permissions: { checklist: ["update"] },
        }),
        checkPermission({
            permissions: { checklist: ["delete"] },
        }),
        prisma.checklistTemplate.count({
            where: whereClause,
        }),
    ]);
    const totalPages = Math.ceil(totalTemplates / TEMPLATES_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/project/charroi/checklists",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * TEMPLATES_PER_PAGE;
    const templates = await prisma.checklistTemplate.findMany({
        where: whereClause,
        orderBy: {
            name: "asc",
        },
        include: {
            assignments: {
                select: {
                    id: true,
                },
            },
        },
        skip: offset,
        take: TEMPLATES_PER_PAGE,
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
                {quotaStatus.isOverQuota ? <CharroiQuotaAlert quotaStatus={quotaStatus} /> : null}
                <TemplatesManager
                    canCreate={canCreate}
                    canDelete={canDelete}
                    canDuplicate={canCreate}
                    canEdit={canEdit}
                    createDisabled={quotaStatus.isOverQuota}
                    emptyMessage={searchValue ? t("no_search_results") : t("empty_state")}
                    mutationsDisabled={quotaStatus.isOverQuota}
                    templates={templates.map(template => ({
                        id: template.id,
                        name: template.name,
                        description: template.description ?? "",
                        version: template.version,
                        isActive: template.isActive,
                        fieldsCount: template.schemaJson.sections.reduce(
                            (total, section) => total + section.fields.length,
                            0
                        ),
                        rulesCount: template.schemaJson.rules.length,
                        assignmentsCount: template.assignments.length,
                    }))}
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
