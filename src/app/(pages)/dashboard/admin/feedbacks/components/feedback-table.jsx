"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import FeedbackTableRow from "./feedback-table-row";

export default function FeedbackTable({ feedbacks, resolvedCount }) {
    const [expandedId, setExpandedId] = useState(null);
    const [showResolved, setShowResolved] = useState(false);
    const t = useTranslations("admin.feedbacks");

    const handleToggle = feedbackId => {
        setExpandedId(prev => (prev === feedbackId ? null : feedbackId));
    };

    const filteredFeedbacks = showResolved
        ? feedbacks
        : feedbacks.filter(f => !f.isResolved);

    return (
        <>
            {resolvedCount > 0 && (
                <tr>
                    <td colSpan={4} className="p-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResolved(!showResolved)}
                            className="w-full"
                        >
                            {showResolved ? (
                                <>
                                    <EyeOff className="size-4 mr-2" />
                                    {t("hide_resolved", {
                                        count: resolvedCount,
                                    })}
                                </>
                            ) : (
                                <>
                                    <Eye className="size-4 mr-2" />
                                    {t("show_resolved", {
                                        count: resolvedCount,
                                    })}
                                </>
                            )}
                        </Button>
                    </td>
                </tr>
            )}
            {filteredFeedbacks.map(feedback => (
                <FeedbackTableRow
                    key={feedback.id}
                    feedback={feedback}
                    isExpanded={expandedId === feedback.id}
                    onToggle={() => handleToggle(feedback.id)}
                />
            ))}
        </>
    );
}
