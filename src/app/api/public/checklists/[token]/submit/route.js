import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dispatchChecklistSubmissionNotifications } from "@project/lib/charroi/notifications";
import { getPublicChecklistAssignment } from "@project/lib/charroi/public-checklist";
import { validateChecklistResponses } from "@project/lib/charroi/response-validation";
import { evaluateChecklistRules } from "@project/lib/charroi/rule-engine";
import { publicChecklistSubmitSchema } from "@project/lib/charroi/template-schema";

export async function POST(request, { params }) {
    try {
        const { token } = await params;
        const assignment = await getPublicChecklistAssignment(token);

        if (!assignment) {
            return NextResponse.json({ error: "Checklist introuvable" }, { status: 404 });
        }

        const payload = publicChecklistSubmitSchema.parse(await request.json());
        const { fieldMap, sanitizedResponses } = validateChecklistResponses({
            schemaJson: assignment.parsedSchema,
            responses: payload.responses,
        });
        const uploadedPhotos =
            payload.draftUploadKey.trim() === ""
                ? []
                : await prisma.checklistPhoto.findMany({
                      where: {
                          assignmentId: assignment.id,
                          tempUploadKey: payload.draftUploadKey.trim(),
                      },
                  });
        const uploadedPhotoMap = new Map(uploadedPhotos.map(photo => [photo.id, photo]));
        const referencedPhotoIds = Object.entries(sanitizedResponses).flatMap(([fieldId, value]) => {
            if (fieldMap.get(fieldId)?.type !== "photo") {
                return [];
            }

            return Array.isArray(value) ? value : [];
        });

        for (const [fieldId, value] of Object.entries(sanitizedResponses)) {
            if (fieldMap.get(fieldId)?.type !== "photo") {
                continue;
            }

            for (const photoId of Array.isArray(value) ? value : []) {
                const photo = uploadedPhotoMap.get(photoId);

                if (!photo || photo.fieldId !== fieldId) {
                    return NextResponse.json(
                        {
                            error: "Une photo associée à la checklist est invalide",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        for (const photoId of referencedPhotoIds) {
            if (!uploadedPhotoMap.has(photoId)) {
                return NextResponse.json(
                    {
                        error: "Une photo associée à la checklist est invalide",
                    },
                    { status: 400 }
                );
            }
        }

        const issues = evaluateChecklistRules({
            schemaJson: assignment.parsedSchema,
            responses: sanitizedResponses,
        });

        const submission = await prisma.$transaction(async tx => {
            const createdSubmission = await tx.checklistSubmission.create({
                data: {
                    organizationId: assignment.organizationId,
                    assignmentId: assignment.id,
                    vehicleId: assignment.vehicleId,
                    checklistTemplateId: assignment.checklistTemplateId,
                    submitterName: payload.submitterName.trim(),
                    responseJson: sanitizedResponses,
                    schemaSnapshotJson: assignment.parsedSchema,
                    vehiclePlateNumberSnapshot: assignment.vehicle.plateNumber,
                    vehicleNameSnapshot: assignment.vehicle.name,
                    checklistNameSnapshot: assignment.checklistTemplate.name,
                    checklistVersionSnapshot: assignment.checklistTemplate.version,
                },
            });

            if (issues.length > 0) {
                await tx.checklistIssue.createMany({
                    data: issues.map(issue => ({
                        organizationId: assignment.organizationId,
                        submissionId: createdSubmission.id,
                        categoryId: issue.categoryId,
                        ruleId: issue.ruleId,
                        ruleTitle: issue.ruleTitle,
                        description: issue.description,
                        triggeredFieldIdsJson: issue.triggeredFieldIds,
                    })),
                });
            }

            if (referencedPhotoIds.length > 0) {
                await tx.checklistPhoto.updateMany({
                    where: {
                        id: {
                            in: referencedPhotoIds,
                        },
                    },
                    data: {
                        submissionId: createdSubmission.id,
                        tempUploadKey: null,
                    },
                });
            }

            return createdSubmission;
        });

        const notificationResult = await dispatchChecklistSubmissionNotifications({
            submissionId: submission.id,
        });

        return NextResponse.json({
            issuesCount: issues.length,
            notifications: notificationResult,
            submissionId: submission.id,
            success: true,
        });
    } catch (error) {
        console.error("[charroi] Public checklist submission failed", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        return NextResponse.json(
            {
                error: error?.message ?? "Impossible de soumettre la checklist",
            },
            { status: 400 }
        );
    }
}
