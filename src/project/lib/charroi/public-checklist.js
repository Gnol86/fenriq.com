import prisma from "@/lib/prisma";
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
        include: {
            photos: {
                select: {
                    id: true,
                    fieldId: true,
                    originalName: true,
                    url: true,
                },
            },
        },
        orderBy: {
            submittedAt: "desc",
        },
    });
}
