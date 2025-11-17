"use client";

import { Award, CheckCircle, Eye, MessageSquare, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    deleteFeedbackAction,
    markFeedbackAsReadAction,
    markFeedbackAsResolvedAction,
} from "@/actions/feedback.action";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function FeedbackDetailsCollapse({ feedback }) {
    const { execute } = useServerAction();
    const t = useTranslations("admin.feedbacks");

    const handleMarkAsRead = async () => {
        await execute(() => markFeedbackAsReadAction({ feedbackId: feedback.id }), {
            successMessage: t("mark_read_success"),
            errorMessage: t("mark_read_error"),
        });
    };

    const handleMarkAsResolved = async () => {
        await execute(() => markFeedbackAsResolvedAction({ feedbackId: feedback.id }), {
            successMessage: t("mark_resolved_success"),
            errorMessage: t("mark_resolved_error"),
        });
    };

    const handleDelete = async () => {
        dialogManager.confirm({
            title: t("delete_confirm_title"),
            description: t("delete_confirm_description"),
            action: {
                label: t("delete_confirm_label"),
                variant: "destructive",
                onClick: async () => {
                    await execute(() => deleteFeedbackAction({ feedbackId: feedback.id }), {
                        successMessage: t("delete_success"),
                        errorMessage: t("delete_error"),
                    });
                },
            },
        });
    };

    return (
        <div className="bg-muted/30 flex flex-col gap-4 p-4">
            {/* Commentaire */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                    <MessageSquare className="size-4" />
                    {t("comment_title")}
                </div>
                {feedback.comment ? (
                    <ScrollArea className="max-h-32">
                        <div className="bg-background rounded-md border p-3 text-sm whitespace-pre-wrap">
                            {feedback.comment}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-muted-foreground text-sm italic">{t("no_comment")}</div>
                )}
            </div>

            {/* Statut témoignage */}
            {feedback.allowUseAsTestimonial && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                    <Award className="size-5 text-green-600 dark:text-green-400" />
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                {t("testimonial_allowed_title")}
                            </span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300">
                            {t("testimonial_allowed_description")}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                {!feedback.isRead && (
                    <Button variant="outline" size="sm" onClick={handleMarkAsRead}>
                        <Eye className="mr-2 size-4" />
                        {t("action_mark_read")}
                    </Button>
                )}
                {!feedback.isResolved && (
                    <Button variant="outline" size="sm" onClick={handleMarkAsResolved}>
                        <CheckCircle className="mr-2 size-4" />
                        {t("action_mark_resolved")}
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    {t("action_delete")}
                </Button>
            </div>
        </div>
    );
}
