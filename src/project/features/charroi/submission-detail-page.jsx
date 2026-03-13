import { ChecklistPhotoGallery } from "@project/components/charroi/checklist-photo-gallery";
import {
    buildHistoricalChecklistPhotosByFieldId,
    CHECKLIST_PHOTO_ACTIVE_STATUS,
    getActiveChecklistPhotosByAssignment,
} from "@project/lib/charroi/checklist-photo-cleanup";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

function formatSubmittedAt(date) {
    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function buildTextListItems(fieldId, values) {
    const occurrences = new Map();

    return (Array.isArray(values) ? values : []).map(entry => {
        const resolvedValue = String(entry);
        const nextOccurrence = (occurrences.get(resolvedValue) ?? 0) + 1;

        occurrences.set(resolvedValue, nextOccurrence);

        return {
            key: `${fieldId}-${resolvedValue}-${nextOccurrence}`,
            value: resolvedValue,
        };
    });
}

function renderFieldValue(field, value, photosByFieldId, t) {
    if (field.type === "checkbox") {
        return value ? t("value_yes") : t("value_no");
    }

    if (field.type === "multi_select") {
        return Array.isArray(value) && value.length > 0 ? value.join(", ") : t("value_empty");
    }

    if (field.type === "photo") {
        const photos = photosByFieldId[field.id] ?? [];

        return (
            <ChecklistPhotoGallery
                emptyLabel={t("value_empty")}
                label={t("active_damage_photos_label")}
                photos={photos}
            />
        );
    }

    if (field.type === "text_list") {
        const items = buildTextListItems(field.id, value);

        return items.length > 0 ? (
            <div className="flex flex-col gap-2">
                <span className="text-foreground text-xs font-medium uppercase tracking-wide">
                    {t("text_list_entries_label")}
                </span>
                <ul className="ml-5 flex list-disc flex-col gap-1">
                    {items.map(item => (
                        <li key={item.key} className="whitespace-pre-wrap">
                            {item.value}
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            t("value_empty")
        );
    }

    if (value == null || value === "") {
        return t("value_empty");
    }

    return String(value);
}

export default async function CharroiSubmissionDetailPage({ submissionId }) {
    const [t, { organization }] = await Promise.all([
        getTranslations("project.charroi.submission_detail"),
        requirePermission({
            permissions: { checklistSubmission: ["read"] },
        }),
    ]);

    const submission = await prisma.checklistSubmission.findFirst({
        where: {
            id: submissionId,
            organizationId: organization.id,
        },
        include: {
            issues: {
                include: {
                    category: true,
                },
            },
            photos: {
                where: {
                    status: CHECKLIST_PHOTO_ACTIVE_STATUS,
                },
            },
        },
    });

    if (!submission) {
        notFound();
    }

    const schema = submission.schemaSnapshotJson;
    const responses = submission.responseJson;
    const historicalPhotos = submission.assignmentId
        ? await getActiveChecklistPhotosByAssignment({
              assignmentId: submission.assignmentId,
              prismaClient: prisma,
              schema,
          })
        : submission.photos;
    const photosByFieldId = buildHistoricalChecklistPhotosByFieldId({
        schema,
        photos: historicalPhotos,
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{submission.checklistNameSnapshot}</CardTitle>
                    <CardDescription>
                        {t("meta_line", {
                            vehicle: submission.vehiclePlateNumberSnapshot,
                            name: submission.submitterName,
                            date: formatSubmittedAt(submission.submittedAt),
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {submission.issues.length === 0 ? (
                            <span className="rounded-md border px-2 py-1 text-sm">
                                {t("no_issues")}
                            </span>
                        ) : (
                            submission.issues.map(issue => (
                                <span
                                    key={issue.id}
                                    className="rounded-md border px-2 py-1 text-sm"
                                >
                                    {issue.category?.name || t("uncategorized_issue")} -{" "}
                                    {issue.ruleTitle}
                                </span>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
            {schema.sections.map(section => (
                <Card key={section.id}>
                    <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>
                            {section.description || t("no_description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {section.fields.map(field => (
                            <div
                                key={field.id}
                                className="flex flex-col gap-1 rounded-lg border p-3"
                            >
                                <span className="text-sm font-medium">{field.label}</span>
                                <div className="text-muted-foreground text-sm">
                                    {renderFieldValue(
                                        field,
                                        responses[field.id],
                                        photosByFieldId,
                                        t
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
