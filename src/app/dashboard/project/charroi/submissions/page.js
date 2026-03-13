import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";

const SUBMISSIONS_PER_PAGE = 10;

function formatSubmittedAt(date) {
    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default async function Page({ searchParams }) {
    const [t, { organization }, resolvedSearchParams] = await Promise.all([
        getTranslations("project.charroi.submissions"),
        requirePermission({
            permissions: { checklistSubmission: ["read"] },
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
                          checklistNameSnapshot: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          vehiclePlateNumberSnapshot: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          vehicleNameSnapshot: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          submitterName: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),
    };

    const totalSubmissions = await prisma.checklistSubmission.count({
        where: whereClause,
    });
    const totalPages = Math.ceil(totalSubmissions / SUBMISSIONS_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/project/charroi/submissions",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * SUBMISSIONS_PER_PAGE;

    const submissions = await prisma.checklistSubmission.findMany({
        where: whereClause,
        orderBy: {
            submittedAt: "desc",
        },
        skip: offset,
        take: SUBMISSIONS_PER_PAGE,
        include: {
            issues: {
                include: {
                    category: true,
                },
            },
        },
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
                {submissions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {searchValue ? t("no_search_results") : t("empty_state")}
                    </p>
                ) : (
                    submissions.map(submission => (
                        <div
                            key={submission.id}
                            className="flex flex-col gap-3 rounded-lg border p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">
                                        {submission.checklistNameSnapshot}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {submission.vehicleNameSnapshot
                                            ? `${submission.vehicleNameSnapshot} - `
                                            : ""}
                                        {submission.vehiclePlateNumberSnapshot}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {t("submission_meta", {
                                            name: submission.submitterName,
                                            date: formatSubmittedAt(submission.submittedAt),
                                        })}
                                    </span>
                                </div>
                                <Link
                                    href={`/dashboard/project/charroi/submissions/${submission.id}`}
                                >
                                    <Button variant="outline" size="sm">
                                        {t("detail_button")}
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {submission.issues.length === 0 ? (
                                    <span className="rounded-md border px-2 py-1">
                                        {t("no_issues")}
                                    </span>
                                ) : (
                                    submission.issues.map(issue => (
                                        <span
                                            key={issue.id}
                                            className="rounded-md border px-2 py-1"
                                        >
                                            {issue.category?.name || t("uncategorized_issue")}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
                <Pagination
                    totalPages={totalPages}
                    page={safePage}
                    searchParams={resolvedSearchParams}
                />
            </CardContent>
        </Card>
    );
}
