import Link from "next/link";
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

function renderFieldValue(field, value, photosByFieldId, t) {
    if (field.type === "checkbox") {
        return value ? t("value_yes") : t("value_no");
    }

    if (field.type === "multi_select") {
        return Array.isArray(value) && value.length > 0 ? value.join(", ") : t("value_empty");
    }

    if (field.type === "photo") {
        const photos = photosByFieldId[field.id] ?? [];

        if (photos.length === 0) {
            return t("value_empty");
        }

        return (
            <div className="flex flex-col gap-2">
                {photos.map(photo => (
                    <Link
                        key={photo.id}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                    >
                        {photo.originalName}
                    </Link>
                ))}
            </div>
        );
    }

    if (value == null || value === "") {
        return t("value_empty");
    }

    return String(value);
}

export default async function CharroiSubmissionDetailPage({ submissionId }) {
    const t = await getTranslations("project.charroi.submission_detail");
    const { organization } = await requirePermission({
        permissions: { checklistSubmission: ["read"] },
    });

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
            photos: true,
        },
    });

    if (!submission) {
        notFound();
    }

    const schema = submission.schemaSnapshotJson;
    const responses = submission.responseJson;
    const photosByFieldId = submission.photos.reduce((acc, photo) => {
        if (!acc[photo.fieldId]) {
            acc[photo.fieldId] = [];
        }

        acc[photo.fieldId].push(photo);
        return acc;
    }, {});

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
