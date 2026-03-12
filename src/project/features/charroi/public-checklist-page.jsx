import { getPublicChecklistAssignment } from "@project/lib/charroi/public-checklist";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicChecklistForm } from "./public-checklist-form";

export default async function PublicChecklistPage({ token }) {
    const t = await getTranslations("project.charroi.public");
    const assignment = await getPublicChecklistAssignment(token);

    if (!assignment) {
        notFound();
    }

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
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
