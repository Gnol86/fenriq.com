import { getTranslations } from "next-intl/server";
import { getAllFeedbacksAction } from "@/actions/feedback.action";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";
import FeedbackTable from "./components/feedback-table";
import ToggleResolvedFeedbacksButton from "./components/toggle-resolved-feedbacks-button";

const FEEDBACKS_PER_PAGE = 10;

export default async function AdminFeedbacksPage({ searchParams }) {
    const t = await getTranslations("admin.feedbacks");

    // Vérifie que l'utilisateur est admin
    await requireAdmin();

    const resolvedSearchParams = await searchParams;
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "");
    const statusValue = getLastSearchParamValue(resolvedSearchParams?.status, "");
    const includeResolved = statusValue === "all";
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const offset = (page - 1) * FEEDBACKS_PER_PAGE;

    const [
        { feedbacks, total },
        [totalFeedbacks, unreadCount, unresolvedCount, resolvedCount, averageRatingAggregate],
    ] = await Promise.all([
        getAllFeedbacksAction({
            searchValue,
            includeResolved,
            limit: FEEDBACKS_PER_PAGE,
            offset,
        }),
        prisma.$transaction([
            prisma.feedback.count(),
            prisma.feedback.count({ where: { isRead: false } }),
            prisma.feedback.count({ where: { isResolved: false } }),
            prisma.feedback.count({ where: { isResolved: true } }),
            prisma.feedback.aggregate({
                _avg: {
                    rating: true,
                },
            }),
        ]),
    ]);
    const totalPages = Math.ceil(total / FEEDBACKS_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/admin/feedbacks",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });

    // Calculer la moyenne
    const averageRating = (averageRatingAggregate._avg.rating ?? 0).toFixed(1);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>
                        {t("page_description", {
                            total: totalFeedbacks,
                            unread: unreadCount,
                            unresolved: unresolvedCount,
                            average: averageRating,
                        })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex w-full flex-col gap-4">
                    <ButtonGroup className="w-full">
                        <SearchInput
                            placeholder={t("search_placeholder")}
                            initialValue={searchValue}
                            searchParams={resolvedSearchParams}
                        />
                        <ToggleResolvedFeedbacksButton
                            searchParams={resolvedSearchParams}
                            isShowingAll={includeResolved}
                            resolvedCount={resolvedCount}
                        />
                    </ButtonGroup>

                    <Table>
                        {!feedbacks.length && (
                            <TableCaption>
                                {searchValue
                                    ? t("no_search_results")
                                    : totalFeedbacks === 0
                                      ? t("no_feedbacks")
                                      : includeResolved || unresolvedCount > 0
                                        ? t("no_feedbacks")
                                        : t("no_pending_feedbacks")}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_user")}</TableHead>
                                <TableHead>{t("table_rating")}</TableHead>
                                <TableHead>{t("table_comment")}</TableHead>
                                <TableHead>{t("table_status")}</TableHead>
                                <TableHead>{t("table_date")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <FeedbackTable feedbacks={feedbacks} />
                        </TableBody>
                    </Table>

                    <Pagination
                        totalPages={totalPages}
                        page={safePage}
                        searchParams={resolvedSearchParams}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
