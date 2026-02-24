import { getTranslations } from "next-intl/server";
import { getAllFeedbacksAction } from "@/actions/feedback.action";
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
import FeedbackTable from "./components/feedback-table";

export default async function AdminFeedbacksPage() {
    const t = await getTranslations("admin.feedbacks");

    // Vérifie que l'utilisateur est admin
    await requireAdmin();

    const feedbacks = await getAllFeedbacksAction();

    const unreadCount = feedbacks.filter(f => !f.isRead).length;
    const unresolvedCount = feedbacks.filter(f => !f.isResolved).length;
    const resolvedCount = feedbacks.filter(f => f.isResolved).length;

    // Calculer la moyenne
    const averageRating =
        feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>
                        {t("page_description", {
                            total: feedbacks.length,
                            unread: unreadCount,
                            unresolved: unresolvedCount,
                            average: averageRating,
                        })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex w-full flex-col gap-4">
                    <Table>
                        {!feedbacks.length && <TableCaption>{t("no_feedbacks")}</TableCaption>}
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
                            <FeedbackTable feedbacks={feedbacks} resolvedCount={resolvedCount} />
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
