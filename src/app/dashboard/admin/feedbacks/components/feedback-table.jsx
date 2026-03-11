"use client";

import { useState } from "react";
import FeedbackTableRow from "./feedback-table-row";

export default function FeedbackTable({ feedbacks }) {
    const [expandedId, setExpandedId] = useState(null);

    const handleToggle = feedbackId => {
        setExpandedId(prev => (prev === feedbackId ? null : feedbackId));
    };

    return (
        <>
            {feedbacks.map(feedback => (
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
