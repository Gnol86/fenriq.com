"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
    CHECKLIST_PHOTO_ACTIVE_STATUS,
    CHECKLIST_PHOTO_PENDING_DELETE_STATUS,
    deleteTemporaryChecklistPhoto,
    getChecklistPhotoFieldIds,
    runChecklistPhotoDeletionCleanup,
} from "@project/lib/charroi/checklist-photo-cleanup";
import { validateChecklistPhotoComments } from "@project/lib/charroi/checklist-photo-comments";
import {
    buildChecklistTextListResponseValue,
    getChecklistTextListFieldIds,
    normalizeDraftTextEntriesByFieldId,
} from "@project/lib/charroi/checklist-text-entry";
import {
    CHECKLIST_MAX_UPLOAD_SIZE,
    CHECKLIST_UPLOAD_ALLOWED_TYPES,
} from "@project/lib/charroi/constants";
import { dispatchChecklistSubmissionNotifications } from "@project/lib/charroi/notifications";
import { getPublicChecklistAssignment } from "@project/lib/charroi/public-checklist";
import {
    PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE,
    PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE_MAX_AGE,
} from "@project/lib/charroi/public-checklist-prefill";
import { validateChecklistResponses } from "@project/lib/charroi/response-validation";
import { evaluateChecklistRules } from "@project/lib/charroi/rule-engine";
import {
    publicChecklistDeleteUploadSchema,
    publicChecklistSubmitSchema,
} from "@project/lib/charroi/template-schema";
import { buildChecklistPhotoStorageKey, buildChecklistPhotoUrl } from "@project/lib/charroi/utils";
import { cookies } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { s3Client } from "@/lib/s3";

const nonEmptyText = z.string().trim().min(1);

const publicChecklistSubmitActionSchema = publicChecklistSubmitSchema.extend({
    token: nonEmptyText,
});

const publicChecklistUploadActionSchema = z.object({
    token: nonEmptyText,
    draftUploadKey: nonEmptyText,
    fieldId: nonEmptyText,
});

const publicChecklistDeleteUploadActionSchema = publicChecklistDeleteUploadSchema.extend({
    token: nonEmptyText,
    photoId: nonEmptyText,
});

async function getRequiredPublicChecklistAssignment(token) {
    const assignment = await getPublicChecklistAssignment(token);

    if (!assignment) {
        throw new Error("Checklist introuvable");
    }

    return assignment;
}

export async function submitPublicChecklistAction(values) {
    try {
        const payload = publicChecklistSubmitActionSchema.parse(values);
        const assignment = await getRequiredPublicChecklistAssignment(payload.token);
        const { fieldMap, sanitizedResponses } = validateChecklistResponses({
            schemaJson: assignment.parsedSchema,
            responses: payload.responses,
        });
        const removedHistoricalPhotoIds = [...new Set(payload.removedHistoricalPhotoIds)];
        const removedHistoricalTextEntryIds = [...new Set(payload.removedHistoricalTextEntryIds)];
        const photoFieldIds = getChecklistPhotoFieldIds(assignment.parsedSchema);
        const textListFieldIds = getChecklistTextListFieldIds(assignment.parsedSchema);
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
        const activeTextEntries =
            textListFieldIds.length === 0
                ? []
                : await prisma.checklistTextEntry.findMany({
                      where: {
                          assignmentId: assignment.id,
                          fieldId: {
                              in: textListFieldIds,
                          },
                      },
                      select: {
                          id: true,
                          fieldId: true,
                          text: true,
                          createdAt: true,
                      },
                      orderBy: {
                          createdAt: "asc",
                      },
                  });
        const activeTextEntryMap = new Map(activeTextEntries.map(entry => [entry.id, entry]));
        const activeTextEntriesByFieldId = activeTextEntries.reduce((accumulator, entry) => {
            if (!accumulator[entry.fieldId]) {
                accumulator[entry.fieldId] = [];
            }

            accumulator[entry.fieldId].push(entry);
            return accumulator;
        }, {});
        const { normalizedPhotoComments, referencedPhotoIds } = validateChecklistPhotoComments({
            fieldMap,
            photoComments: payload.photoComments,
            sanitizedResponses,
            uploadedPhotoMap,
        });
        const normalizedDraftTextEntriesByFieldId = normalizeDraftTextEntriesByFieldId({
            draftTextEntriesByFieldId: payload.draftTextEntriesByFieldId,
            fieldMap,
        });

        if (removableHistoricalPhotoIdSet.size !== removedHistoricalPhotoIds.length) {
            throw new Error("Une photo historique à supprimer est invalide");
        }

        if (activeTextEntryMap.size < removedHistoricalTextEntryIds.length) {
            throw new Error("Une liste de texte à supprimer est invalide");
        }

        for (const textEntryId of removedHistoricalTextEntryIds) {
            if (!activeTextEntryMap.has(textEntryId)) {
                throw new Error("Une liste de texte à supprimer est invalide");
            }
        }

        for (const fieldId of textListFieldIds) {
            const field = fieldMap.get(fieldId);
            const value = buildChecklistTextListResponseValue({
                historicalTextEntries: activeTextEntriesByFieldId[fieldId] ?? [],
                removedHistoricalTextEntryIds,
                draftTextEntries: normalizedDraftTextEntriesByFieldId[fieldId] ?? [],
            });

            if (field?.required && value.length === 0) {
                throw new Error(`Le champ "${field.label}" est requis`);
            }

            sanitizedResponses[fieldId] = value;
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

            if (removedHistoricalTextEntryIds.length > 0) {
                await tx.checklistTextEntry.deleteMany({
                    where: {
                        id: {
                            in: removedHistoricalTextEntryIds,
                        },
                    },
                });
            }

            const createdTextEntries = textListFieldIds.flatMap(fieldId =>
                (normalizedDraftTextEntriesByFieldId[fieldId] ?? []).map(text => ({
                    organizationId: assignment.organizationId,
                    assignmentId: assignment.id,
                    submissionId: createdSubmission.id,
                    fieldId,
                    text,
                }))
            );

            if (createdTextEntries.length > 0) {
                await tx.checklistTextEntry.createMany({
                    data: createdTextEntries,
                });
            }

            return createdSubmission;
        });
        const photoCleanup = await runChecklistPhotoDeletionCleanup({
            photoIds: removedHistoricalPhotoIds,
        });
        const notifications = await dispatchChecklistSubmissionNotifications({
            submissionId: submission.id,
        });
        const cookieStore = await cookies();

        if (payload.rememberSubmitterName) {
            cookieStore.set(PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE, payload.submitterName.trim(), {
                maxAge: PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE_MAX_AGE,
                path: "/",
            });
        } else {
            cookieStore.set(PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE, "", {
                maxAge: 0,
                path: "/",
            });
        }

        return {
            success: true,
            submissionId: submission.id,
            issuesCount: issues.length,
            notifications,
            photoCleanup,
        };
    } catch (error) {
        console.error("[charroi] Public checklist submission failed", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        throw new Error(error?.message ?? "Impossible de soumettre la checklist");
    }
}

export async function uploadPublicChecklistPhotosAction(formData) {
    let payload;

    try {
        payload = publicChecklistUploadActionSchema.parse({
            token: String(formData.get("token") ?? ""),
            draftUploadKey: String(formData.get("draftUploadKey") ?? ""),
            fieldId: String(formData.get("fieldId") ?? ""),
        });
    } catch {
        throw new Error("Upload invalide");
    }

    const assignment = await getRequiredPublicChecklistAssignment(payload.token);
    const files = formData.getAll("files").filter(file => typeof file?.arrayBuffer === "function");
    const photoField = assignment.parsedSchema.sections
        .flatMap(section => section.fields)
        .find(field => field.id === payload.fieldId && field.type === "photo");

    if (!photoField || files.length === 0) {
        throw new Error("Upload invalide");
    }

    const uploadedPhotos = [];

    try {
        for (const file of files) {
            if (file.size > CHECKLIST_MAX_UPLOAD_SIZE) {
                throw new Error("Le fichier dépasse la taille maximale autorisée");
            }

            if (!CHECKLIST_UPLOAD_ALLOWED_TYPES.includes(file.type)) {
                throw new Error("Le type de fichier n'est pas supporté");
            }

            const storageKey = buildChecklistPhotoStorageKey({
                assignmentId: assignment.id,
                originalName: file.name,
            });
            const buffer = Buffer.from(await file.arrayBuffer());

            await s3Client.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: storageKey,
                    Body: buffer,
                    ContentType: file.type,
                })
            );

            const photo = await prisma.checklistPhoto.create({
                data: {
                    organizationId: assignment.organizationId,
                    assignmentId: assignment.id,
                    fieldId: payload.fieldId,
                    tempUploadKey: payload.draftUploadKey,
                    url: buildChecklistPhotoUrl(storageKey),
                    storageKey,
                    originalName: file.name,
                    mimeType: file.type,
                    size: file.size,
                },
                select: {
                    id: true,
                    fieldId: true,
                    comment: true,
                    originalName: true,
                    url: true,
                },
            });

            uploadedPhotos.push(photo);
        }
    } catch (error) {
        const isValidationError =
            error?.message === "Le fichier dépasse la taille maximale autorisée" ||
            error?.message === "Le type de fichier n'est pas supporté";

        if (!isValidationError) {
            console.error("[charroi] Upload public checklist failed", {
                errorMessage: error?.message,
                errorName: error?.name,
            });

            throw new Error("Impossible d'envoyer les photos");
        }

        throw error;
    }

    return {
        photos: uploadedPhotos,
    };
}

export async function deletePublicChecklistUploadAction(values) {
    let payload;

    try {
        payload = publicChecklistDeleteUploadActionSchema.parse(values);
    } catch {
        throw new Error("Suppression invalide");
    }

    const assignment = await getRequiredPublicChecklistAssignment(payload.token);

    try {
        const deletedPhoto = await deleteTemporaryChecklistPhoto({
            assignmentId: assignment.id,
            draftUploadKey: payload.draftUploadKey,
            photoId: payload.photoId,
        });

        if (!deletedPhoto) {
            throw new Error("Photo introuvable");
        }

        return {
            success: true,
            photoId: deletedPhoto.id,
        };
    } catch (error) {
        if (error?.message === "Photo introuvable") {
            throw error;
        }

        console.error("[charroi] Delete public checklist upload failed", {
            errorMessage: error?.message,
            errorName: error?.name,
            photoId: payload.photoId,
        });

        throw new Error("Impossible d'annuler la photo");
    }
}
