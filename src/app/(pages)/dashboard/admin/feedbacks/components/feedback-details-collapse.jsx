"use client";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { useConfirm } from "@/hooks/use-confirm";
import {
    markFeedbackAsReadAction,
    markFeedbackAsResolvedAction,
    deleteFeedbackAction,
} from "@/actions/feedback.action";
import { MessageSquare, CheckCircle, Trash2, Eye, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function FeedbackDetailsCollapse({ feedback }) {
    const { execute } = useServerAction();
    const confirm = useConfirm();
    const t = useTranslations("admin.feedbacks");

    const handleMarkAsRead = async () => {
        await execute(
            () => markFeedbackAsReadAction({ feedbackId: feedback.id }),
            {
                successMessage: t("mark_read_success"),
                errorMessage: t("mark_read_error"),
            }
        );
    };

    const handleMarkAsResolved = async () => {
        await execute(
            () => markFeedbackAsResolvedAction({ feedbackId: feedback.id }),
            {
                successMessage: t("mark_resolved_success"),
                errorMessage: t("mark_resolved_error"),
            }
        );
    };

    const handleDelete = async () => {
        await confirm(
            {
                title: t("delete_confirm_title"),
                description: t("delete_confirm_description"),
                variant: "destructive",
            },
            async () => {
                await execute(
                    () => deleteFeedbackAction({ feedbackId: feedback.id }),
                    {
                        successMessage: t("delete_success"),
                        errorMessage: t("delete_error"),
                    }
                );
            }
        );
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-muted/30">
            {/* Commentaire */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                    <MessageSquare className="size-4" />
                    {t("comment_title")}
                </div>
                {feedback.comment ? (
                    <ScrollArea className="max-h-32">
                        <div className="text-sm whitespace-pre-wrap p-3 bg-background rounded-md border">
                            {feedback.comment}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-sm text-muted-foreground italic">
                        {t("no_comment")}
                    </div>
                )}
            </div>

            {/* Statut témoignage */}
            {feedback.allowUseAsTestimonial && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-3">
                    <Award className="size-5 text-green-600 dark:text-green-400" />
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                {t("testimonial_allowed_title")}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                {t("testimonial_allowed_badge")}
                            </Badge>
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAsRead}
                    >
                        <Eye className="size-4 mr-2" />
                        {t("action_mark_read")}
                    </Button>
                )}
                {!feedback.isResolved && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAsResolved}
                    >
                        <CheckCircle className="size-4 mr-2" />
                        {t("action_mark_resolved")}
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="size-4 mr-2" />
                    {t("action_delete")}
                </Button>
            </div>
        </div>
    );
}
