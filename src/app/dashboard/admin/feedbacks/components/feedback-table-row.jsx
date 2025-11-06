"use client";

import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import FeedbackDetailsCollapse from "./feedback-details-collapse";

export default function FeedbackTableRow({ feedback, isExpanded, onToggle }) {
    const t = useTranslations("admin.feedbacks");
    const locale = useLocale();

    return (
        <Fragment>
            <TableRow
                className={cn("cursor-pointer", !feedback.isRead && "bg-muted/50")}
                onClick={onToggle}
            >
                {/* Utilisateur */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="flex w-4 items-center justify-center">
                            {isExpanded ? (
                                <ChevronDown className="text-muted-foreground" />
                            ) : (
                                <ChevronRight className="text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-foreground text-sm font-medium">
                                {feedback.userName}
                            </span>
                            <span className="text-muted-foreground text-xs">
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
                            <Badge variant="secondary" className="w-fit text-xs">
                                {t("status_unread")}
                            </Badge>
                        )}
                        {feedback.isResolved ? (
                            <Badge variant="outline" className="w-fit text-xs">
                                {t("status_resolved")}
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="w-fit text-xs">
                                {t("status_pending")}
                            </Badge>
                        )}
                    </div>
                </TableCell>

                {/* Date */}
                <TableCell>
                    <span className="text-muted-foreground text-sm">
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
