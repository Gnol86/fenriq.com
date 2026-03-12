import {
    getLatestPublicChecklistSubmission,
    getPublicChecklistAssignment,
} from "@project/lib/charroi/public-checklist";
import {
    buildPublicChecklistPrefill,
    getRememberedPublicChecklistSubmitterName,
} from "@project/lib/charroi/public-checklist-prefill";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicChecklistForm } from "./public-checklist-form";

export default async function PublicChecklistPage({ token }) {
    const [t, assignment, cookieStore] = await Promise.all([
        getTranslations("project.charroi.public"),
        getPublicChecklistAssignment(token),
        cookies(),
    ]);

    if (!assignment) {
        notFound();
    }

    const latestSubmission = await getLatestPublicChecklistSubmission(assignment.id);
    const { initialResponses, previousPhotosByFieldId } = buildPublicChecklistPrefill({
        schema: assignment.parsedSchema,
        latestSubmission,
    });
    const initialSubmitterName = getRememberedPublicChecklistSubmitterName(cookieStore);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
            <Card>
                <CardHeader>
                    <CardTitle>{assignment.checklistTemplate.name}</CardTitle>
                    <CardDescription>
                        {t("page_description", {
                            organization: assignment.organization.name,
                            plate: assignment.vehicle.plateNumber,
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PublicChecklistForm
                        assignment={{
                            publicToken: assignment.publicToken,
                            parsedSchema: assignment.parsedSchema,
                            initialResponses,
                            previousPhotosByFieldId,
                            initialSubmitterName,
                            hasRememberedSubmitterName: initialSubmitterName !== "",
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
