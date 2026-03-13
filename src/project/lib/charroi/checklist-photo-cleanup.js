import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { s3Client } from "@/lib/s3";

export const CHECKLIST_PHOTO_ACTIVE_STATUS = "ACTIVE";
export const CHECKLIST_PHOTO_PENDING_DELETE_STATUS = "PENDING_DELETE";
export const CHECKLIST_PHOTO_DELETE_FAILED_STATUS = "DELETE_FAILED";

export const CHECKLIST_PHOTO_PUBLIC_SELECT = {
    id: true,
    fieldId: true,
    originalName: true,
    url: true,
    createdAt: true,
};

function getChecklistPhotoCleanupErrorMessage(error) {
    const message = error?.message ?? "Checklist photo cleanup failed";

    return String(message).slice(0, 1000);
}

export function getChecklistPhotoFieldIds(schema) {
    return schema.sections.flatMap(section =>
        section.fields.filter(field => field.type === "photo").map(field => field.id)
    );
}

export function buildHistoricalChecklistPhotosByFieldId({ schema, photos }) {
    const allowedFieldIds = new Set(getChecklistPhotoFieldIds(schema));

    return (photos ?? []).reduce((accumulator, photo) => {
        if (!allowedFieldIds.has(photo.fieldId)) {
            return accumulator;
        }

        if (!accumulator[photo.fieldId]) {
            accumulator[photo.fieldId] = [];
        }

        accumulator[photo.fieldId].push(photo);
        return accumulator;
    }, {});
}

export async function getActiveChecklistPhotosByAssignment({
    assignmentId,
    prismaClient = prisma,
    schema,
    select = CHECKLIST_PHOTO_PUBLIC_SELECT,
}) {
    const photoFieldIds = getChecklistPhotoFieldIds(schema);

    if (!assignmentId || photoFieldIds.length === 0) {
        return [];
    }

    return await prismaClient.checklistPhoto.findMany({
        where: {
            assignmentId,
            fieldId: {
                in: photoFieldIds,
            },
            status: CHECKLIST_PHOTO_ACTIVE_STATUS,
            tempUploadKey: null,
        },
        select,
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function processChecklistPhotoDeletionBatch({
    photos,
    deleteFromStorage,
    deletePhotoRecord,
    markPhotoDeleteFailed,
}) {
    const cleanup = {
        attemptedCount: photos.length,
        deletedCount: 0,
        pendingRetryCount: 0,
    };

    for (const photo of photos) {
        try {
            await deleteFromStorage(photo);
            await deletePhotoRecord(photo);
            cleanup.deletedCount += 1;
        } catch (error) {
            await markPhotoDeleteFailed(photo, getChecklistPhotoCleanupErrorMessage(error));
            cleanup.pendingRetryCount += 1;
        }
    }

    return cleanup;
}

export async function runChecklistPhotoDeletionCleanup({
    photoIds,
    prismaClient = prisma,
    storageClient = s3Client,
} = {}) {
    if (Array.isArray(photoIds) && photoIds.length === 0) {
        return {
            attemptedCount: 0,
            deletedCount: 0,
            pendingRetryCount: 0,
        };
    }

    const where = {
        status: {
            in: [CHECKLIST_PHOTO_PENDING_DELETE_STATUS, CHECKLIST_PHOTO_DELETE_FAILED_STATUS],
        },
    };

    if (Array.isArray(photoIds)) {
        where.id = {
            in: photoIds,
        };
    }

    const photos = await prismaClient.checklistPhoto.findMany({
        where,
        select: {
            id: true,
            storageKey: true,
        },
        orderBy: [{ deleteRequestedAt: "asc" }, { createdAt: "asc" }],
    });

    return await processChecklistPhotoDeletionBatch({
        photos,
        deleteFromStorage: async photo => {
            await storageClient.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: photo.storageKey,
                })
            );
        },
        deletePhotoRecord: async photo => {
            await prismaClient.checklistPhoto.deleteMany({
                where: {
                    id: photo.id,
                },
            });
        },
        markPhotoDeleteFailed: async (photo, errorMessage) => {
            await prismaClient.checklistPhoto.updateMany({
                where: {
                    id: photo.id,
                },
                data: {
                    status: CHECKLIST_PHOTO_DELETE_FAILED_STATUS,
                    deleteErrorMessage: errorMessage,
                },
            });
        },
    });
}
