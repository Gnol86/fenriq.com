import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

function formatSubmittedAt(date) {
    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default async function CharroiSubmissionsPage() {
    const t = await getTranslations("project.charroi.submissions");
    const { organization } = await requirePermission({
        permissions: { checklistSubmission: ["read"] },
    });

    const submissions = await prisma.checklistSubmission.findMany({
        where: {
            organizationId: organization.id,
        },
        orderBy: {
            submittedAt: "desc",
        },
        take: 100,
        include: {
            issues: {
                include: {
                    category: true,
                },
            },
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {submissions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("empty_state")}</p>
                ) : (
                    submissions.map(submission => (
                        <div
                            key={submission.id}
                            className="flex flex-col gap-3 rounded-lg border p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">
                                        {submission.checklistNameSnapshot}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {submission.vehicleNameSnapshot
                                            ? `${submission.vehicleNameSnapshot} - `
                                            : ""}
                                        {submission.vehiclePlateNumberSnapshot}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {t("submission_meta", {
                                            name: submission.submitterName,
                                            date: formatSubmittedAt(submission.submittedAt),
                                        })}
                                    </span>
                                </div>
                                <Link
                                    href={`/dashboard/project/charroi/submissions/${submission.id}`}
                                >
                                    <Button variant="outline" size="sm">
                                        {t("detail_button")}
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {submission.issues.length === 0 ? (
                                    <span className="rounded-md border px-2 py-1">
                                        {t("no_issues")}
                                    </span>
                                ) : (
                                    submission.issues.map(issue => (
                                        <span
                                            key={issue.id}
                                            className="rounded-md border px-2 py-1"
                                        >
                                            {issue.category?.name || t("uncategorized_issue")}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
