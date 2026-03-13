import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    CHECKLIST_PHOTO_ACTIVE_STATUS,
    CHECKLIST_PHOTO_PENDING_DELETE_STATUS,
    getChecklistPhotoFieldIds,
    runChecklistPhotoDeletionCleanup,
} from "@project/lib/charroi/checklist-photo-cleanup";
import { validateChecklistPhotoComments } from "@project/lib/charroi/checklist-photo-comments";
import { dispatchChecklistSubmissionNotifications } from "@project/lib/charroi/notifications";
import {
    PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE,
    PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE_MAX_AGE,
} from "@project/lib/charroi/public-checklist-prefill";
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
        const removedHistoricalPhotoIds = [...new Set(payload.removedHistoricalPhotoIds)];
        const photoFieldIds = getChecklistPhotoFieldIds(assignment.parsedSchema);
        const uploadedPhotos =
            payload.draftUploadKey.trim() === ""
                ? []
                : await prisma.checklistPhoto.findMany({
                      where: {
                          assignmentId: assignment.id,
                          status: CHECKLIST_PHOTO_ACTIVE_STATUS,
                          tempUploadKey: payload.draftUploadKey.trim(),
                      },
                  });
        const removableHistoricalPhotos =
            removedHistoricalPhotoIds.length === 0
                ? []
                : await prisma.checklistPhoto.findMany({
                      where: {
                          id: {
                              in: removedHistoricalPhotoIds,
                          },
                          assignmentId: assignment.id,
                          fieldId: {
                              in: photoFieldIds,
                          },
                          status: CHECKLIST_PHOTO_ACTIVE_STATUS,
                          tempUploadKey: null,
                      },
                      select: {
                          id: true,
                      },
                  });
        const uploadedPhotoMap = new Map(uploadedPhotos.map(photo => [photo.id, photo]));
        const removableHistoricalPhotoIdSet = new Set(
            removableHistoricalPhotos.map(photo => photo.id)
        );
        const { normalizedPhotoComments, referencedPhotoIds } =
            validateChecklistPhotoComments({
                fieldMap,
                photoComments: payload.photoComments,
                sanitizedResponses,
                uploadedPhotoMap,
            });

        if (removableHistoricalPhotoIdSet.size !== removedHistoricalPhotoIds.length) {
            return NextResponse.json(
                {
                    error: "Une photo historique à supprimer est invalide",
                },
                { status: 400 }
            );
        }

        const issues = evaluateChecklistRules({
            schemaJson: assignment.parsedSchema,
            responses: sanitizedResponses,
        });
        const deletionRequestedAt = new Date();

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
                for (const photoId of referencedPhotoIds) {
                    await tx.checklistPhoto.update({
                        where: {
                            id: photoId,
                        },
                        data: {
                            comment: normalizedPhotoComments[photoId] || null,
                            submissionId: createdSubmission.id,
                            tempUploadKey: null,
                            status: CHECKLIST_PHOTO_ACTIVE_STATUS,
                            deleteRequestedAt: null,
                            deleteErrorMessage: null,
                        },
                    });
                }
            }

            if (removedHistoricalPhotoIds.length > 0) {
                await tx.checklistPhoto.updateMany({
                    where: {
                        id: {
                            in: removedHistoricalPhotoIds,
                        },
                    },
                    data: {
                        status: CHECKLIST_PHOTO_PENDING_DELETE_STATUS,
                        deleteRequestedAt: deletionRequestedAt,
                        deleteErrorMessage: null,
                    },
                });
            }

            return createdSubmission;
        });
        const photoCleanup = await runChecklistPhotoDeletionCleanup({
            photoIds: removedHistoricalPhotoIds,
        });

        const notificationResult = await dispatchChecklistSubmissionNotifications({
            submissionId: submission.id,
        });

        const response = NextResponse.json({
            issuesCount: issues.length,
            notifications: notificationResult,
            photoCleanup,
            submissionId: submission.id,
            success: true,
        });

        if (payload.rememberSubmitterName) {
            response.cookies.set(PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE, payload.submitterName.trim(), {
                maxAge: PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE_MAX_AGE,
                path: "/",
            });
        } else {
            response.cookies.set(PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE, "", {
                maxAge: 0,
                path: "/",
            });
        }

        return response;
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
