"use client";

import { Fragment } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import FeedbackDetailsCollapse from "./feedback-details-collapse";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export default function FeedbackTableRow({ feedback, isExpanded, onToggle }) {
    const t = useTranslations("admin.feedbacks");
    const locale = useLocale();

    return (
        <Fragment>
            <TableRow
                className={cn(
                    "cursor-pointer",
                    !feedback.isRead && "bg-muted/50"
                )}
                onClick={onToggle}
            >
                {/* Utilisateur */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-4">
                            {isExpanded ? (
                                <ChevronDown className="text-muted-foreground" />
                            ) : (
                                <ChevronRight className="text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {feedback.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {feedback.userEmail}
                            </span>
                        </div>
                    </div>
                </TableCell>

                {/* Note */}
                <TableCell>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(value => (
                            <Star
                                key={value}
                                className={cn(
                                    "size-4",
                                    value <= feedback.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                )}
                            />
                        ))}
                    </div>
                </TableCell>

                {/* Statut */}
                <TableCell>
                    <div className="flex flex-col gap-1">
                        {!feedback.isRead && (
                            <Badge
                                variant="secondary"
                                className="text-xs w-fit"
                            >
                                {t("status_unread")}
                            </Badge>
                        )}
                        {feedback.isResolved ? (
                            <Badge variant="outline" className="text-xs w-fit">
                                {t("status_resolved")}
                            </Badge>
                        ) : (
                            <Badge
                                variant="destructive"
                                className="text-xs w-fit"
                            >
                                {t("status_pending")}
                            </Badge>
                        )}
                    </div>
                </TableCell>

                {/* Date */}
                <TableCell>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(feedback.createdAt, locale)}
                    </span>
                </TableCell>
            </TableRow>

            {/* Ligne de détails conditionnelle */}
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={5} className="p-0">
                        <FeedbackDetailsCollapse feedback={feedback} />
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
}
