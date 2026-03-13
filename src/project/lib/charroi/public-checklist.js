import prisma from "@/lib/prisma";
import {
    CHECKLIST_PHOTO_PUBLIC_SELECT,
    getActiveChecklistPhotosByAssignment,
} from "./checklist-photo-cleanup";
import {
    CHECKLIST_TEXT_ENTRY_PUBLIC_SELECT,
    getChecklistTextListFieldIds,
} from "./checklist-text-entry";
import { checklistTemplateSchemaJsonSchema } from "./template-schema";

export async function getPublicChecklistAssignment(token) {
    if (!token) {
        return null;
    }

    const assignment = await prisma.vehicleChecklistAssignment.findUnique({
        where: {
            publicToken: token,
        },
        include: {
            vehicle: true,
            checklistTemplate: true,
        },
    });

    if (
        !assignment ||
        !assignment.isActive ||
        !assignment.vehicle?.isActive ||
        !assignment.checklistTemplate?.isActive
    ) {
        return null;
    }

    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: assignment.organizationId,
            },
        });

        return {
            ...assignment,
            organization,
            parsedSchema: checklistTemplateSchemaJsonSchema.parse(
                assignment.checklistTemplate.schemaJson
            ),
        };
    } catch (error) {
        console.error("[charroi] Invalid checklist schema for public assignment", {
            assignmentId: assignment.id,
            errorMessage: error?.message,
        });

        return null;
    }
}

export async function getLatestPublicChecklistSubmission(assignmentId) {
    if (!assignmentId) {
        return null;
    }

    return await prisma.checklistSubmission.findFirst({
        where: {
            assignmentId,
        },
        orderBy: {
            submittedAt: "desc",
        },
    });
}

export async function getHistoricalPublicChecklistPhotos({ assignmentId, schema }) {
    return await getActiveChecklistPhotosByAssignment({
        assignmentId,
        prismaClient: prisma,
        schema,
        select: CHECKLIST_PHOTO_PUBLIC_SELECT,
    });
}

export async function getHistoricalPublicChecklistTextEntries({ assignmentId, schema }) {
    const textListFieldIds = getChecklistTextListFieldIds(schema);

    if (!assignmentId || textListFieldIds.length === 0) {
        return [];
    }

    return await prisma.checklistTextEntry.findMany({
        where: {
            assignmentId,
            fieldId: {
                in: textListFieldIds,
            },
        },
        select: CHECKLIST_TEXT_ENTRY_PUBLIC_SELECT,
        orderBy: {
            createdAt: "asc",
        },
    });
}
