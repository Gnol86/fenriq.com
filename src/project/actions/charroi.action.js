"use server";

import {
    checklistAssignmentInputSchema,
    checklistCategoryInputSchema,
    checklistSubscriptionInputSchema,
    checklistTemplateInputSchema,
    checklistVehicleInputSchema,
} from "@project/lib/charroi/template-schema";
import {
    generatePublicToken,
    normalizeOptionalText,
    normalizePlateNumber,
} from "@project/lib/charroi/utils";
import { Prisma } from "@root/prisma/generated/client/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireActiveOrganization, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

function revalidateCharroiPaths() {
    revalidatePath("/dashboard/project/charroi");
    revalidatePath("/dashboard/project/charroi/vehicles");
    revalidatePath("/dashboard/project/charroi/checklists");
    revalidatePath("/dashboard/project/charroi/categories");
    revalidatePath("/dashboard/project/charroi/subscriptions");
    revalidatePath("/dashboard/project/charroi/submissions");
}

function getUniqueConstraintTarget(error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        return null;
    }

    const target = error.meta?.target;

    if (Array.isArray(target)) {
        return target.find(entry => typeof entry === "string") ?? null;
    }

    return typeof target === "string" ? target : null;
}

function withFriendlyPrismaError(error, _t, mapping) {
    const target = getUniqueConstraintTarget(error);
    const message = target ? mapping[target] : null;

    if (message) {
        throw new Error(message);
    }

    throw error;
}

async function getCurrentOrganizationMember(organizationId, userId) {
    return await prisma.member.findFirst({
        where: {
            organizationId,
            userId,
        },
    });
}

async function ensureOrganizationVehicle(vehicleId, organizationId) {
    const vehicle = await prisma.vehicle.findFirst({
        where: {
            id: vehicleId,
            organizationId,
        },
        select: {
            id: true,
        },
    });

    if (!vehicle) {
        throw new Error("Véhicule introuvable");
    }

    return vehicle;
}

async function ensureOrganizationTemplate(templateId, organizationId) {
    const template = await prisma.checklistTemplate.findFirst({
        where: {
            id: templateId,
            organizationId,
        },
        select: {
            id: true,
            name: true,
            description: true,
            schemaJson: true,
            version: true,
            isActive: true,
        },
    });

    if (!template) {
        throw new Error("Checklist introuvable");
    }

    return template;
}

async function ensureOrganizationCategory(categoryId, organizationId) {
    const category = await prisma.checklistCategory.findFirst({
        where: {
            id: categoryId,
            organizationId,
        },
        select: {
            id: true,
        },
    });

    if (!category) {
        throw new Error("Catégorie introuvable");
    }

    return category;
}

async function ensureOrganizationAssignment(assignmentId, organizationId) {
    const assignment = await prisma.vehicleChecklistAssignment.findFirst({
        where: {
            id: assignmentId,
            organizationId,
        },
        select: {
            id: true,
        },
    });

    if (!assignment) {
        throw new Error("Lien public introuvable");
    }

    return assignment;
}

async function getTemplateCopyName({ organizationId, templateName }) {
    const baseName = `${templateName} (copie)`;
    let candidate = baseName;
    let index = 2;

    while (
        await prisma.checklistTemplate.findFirst({
            where: {
                organizationId,
                name: candidate,
            },
            select: {
                id: true,
            },
        })
    ) {
        candidate = `${baseName} ${index}`;
        index += 1;
    }

    return candidate;
}

export async function createVehicleAction(values) {
    const { organization } = await requirePermission({
        permissions: { vehicle: ["create"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistVehicleInputSchema.parse(values);

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                organizationId: organization.id,
                plateNumber: payload.plateNumber.trim().toUpperCase(),
                plateNumberNormalized: normalizePlateNumber(payload.plateNumber),
                name: normalizeOptionalText(payload.name),
                brand: normalizeOptionalText(payload.brand),
                model: normalizeOptionalText(payload.model),
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return vehicle;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            plateNumberNormalized: t("vehicle_plate_taken"),
            "organizationId,plateNumberNormalized": t("vehicle_plate_taken"),
        });
    }
}

export async function updateVehicleAction({ vehicleId, ...values }) {
    const { organization } = await requirePermission({
        permissions: { vehicle: ["update"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistVehicleInputSchema.parse(values);
    await ensureOrganizationVehicle(vehicleId, organization.id);

    try {
        const vehicle = await prisma.vehicle.update({
            where: {
                id: vehicleId,
            },
            data: {
                plateNumber: payload.plateNumber.trim().toUpperCase(),
                plateNumberNormalized: normalizePlateNumber(payload.plateNumber),
                name: normalizeOptionalText(payload.name),
                brand: normalizeOptionalText(payload.brand),
                model: normalizeOptionalText(payload.model),
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return vehicle;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            plateNumberNormalized: t("vehicle_plate_taken"),
            "organizationId,plateNumberNormalized": t("vehicle_plate_taken"),
        });
    }
}

export async function deleteVehicleAction({ vehicleId }) {
    const { organization } = await requirePermission({
        permissions: { vehicle: ["delete"] },
    });
    await ensureOrganizationVehicle(vehicleId, organization.id);

    const vehicle = await prisma.vehicle.delete({
        where: {
            id: vehicleId,
        },
    });

    revalidateCharroiPaths();
    return vehicle;
}

export async function createChecklistTemplateAction(values) {
    const { organization } = await requirePermission({
        permissions: { checklist: ["create"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistTemplateInputSchema.parse(values);

    try {
        const template = await prisma.checklistTemplate.create({
            data: {
                organizationId: organization.id,
                name: payload.name.trim(),
                description: normalizeOptionalText(payload.description),
                schemaJson: payload.schemaJson,
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return template;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            name: t("template_name_taken"),
            "organizationId,name": t("template_name_taken"),
        });
    }
}

export async function updateChecklistTemplateAction({ templateId, ...values }) {
    const { organization } = await requirePermission({
        permissions: { checklist: ["update"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistTemplateInputSchema.parse(values);
    await ensureOrganizationTemplate(templateId, organization.id);

    try {
        const template = await prisma.checklistTemplate.update({
            where: {
                id: templateId,
            },
            data: {
                name: payload.name.trim(),
                description: normalizeOptionalText(payload.description),
                schemaJson: payload.schemaJson,
                isActive: payload.isActive,
                version: {
                    increment: 1,
                },
            },
        });

        revalidateCharroiPaths();
        return template;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            name: t("template_name_taken"),
            "organizationId,name": t("template_name_taken"),
        });
    }
}

export async function duplicateChecklistTemplateAction({ templateId }) {
    const { organization } = await requirePermission({
        permissions: { checklist: ["create"] },
    });
    const template = await ensureOrganizationTemplate(templateId, organization.id);

    const duplicate = await prisma.checklistTemplate.create({
        data: {
            organizationId: organization.id,
            name: await getTemplateCopyName({
                organizationId: organization.id,
                templateName: template.name,
            }),
            description: template.description,
            schemaJson: template.schemaJson,
            version: 1,
            isActive: template.isActive,
        },
    });

    revalidateCharroiPaths();
    return duplicate;
}

export async function deleteChecklistTemplateAction({ templateId }) {
    const { organization } = await requirePermission({
        permissions: { checklist: ["delete"] },
    });
    await ensureOrganizationTemplate(templateId, organization.id);

    const template = await prisma.checklistTemplate.delete({
        where: {
            id: templateId,
        },
    });

    revalidateCharroiPaths();
    return template;
}

export async function createChecklistCategoryAction(values) {
    const { organization } = await requirePermission({
        permissions: { checklistCategory: ["create"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistCategoryInputSchema.parse(values);

    try {
        const category = await prisma.checklistCategory.create({
            data: {
                organizationId: organization.id,
                name: payload.name.trim(),
                description: normalizeOptionalText(payload.description),
                defaultDeliveryMode: payload.defaultDeliveryMode,
                defaultDigestCron:
                    payload.defaultDeliveryMode === "DIGEST"
                        ? payload.defaultDigestCron.trim()
                        : null,
                timeZone: payload.timeZone.trim(),
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return category;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            name: t("category_name_taken"),
            "organizationId,name": t("category_name_taken"),
        });
    }
}

export async function updateChecklistCategoryAction({ categoryId, ...values }) {
    const { organization } = await requirePermission({
        permissions: { checklistCategory: ["update"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistCategoryInputSchema.parse(values);
    await ensureOrganizationCategory(categoryId, organization.id);

    try {
        const category = await prisma.checklistCategory.update({
            where: {
                id: categoryId,
            },
            data: {
                name: payload.name.trim(),
                description: normalizeOptionalText(payload.description),
                defaultDeliveryMode: payload.defaultDeliveryMode,
                defaultDigestCron:
                    payload.defaultDeliveryMode === "DIGEST"
                        ? payload.defaultDigestCron.trim()
                        : null,
                timeZone: payload.timeZone.trim(),
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return category;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            name: t("category_name_taken"),
            "organizationId,name": t("category_name_taken"),
        });
    }
}

export async function deleteChecklistCategoryAction({ categoryId }) {
    const { organization } = await requirePermission({
        permissions: { checklistCategory: ["delete"] },
    });
    await ensureOrganizationCategory(categoryId, organization.id);

    const category = await prisma.checklistCategory.delete({
        where: {
            id: categoryId,
        },
    });

    revalidateCharroiPaths();
    return category;
}

export async function createChecklistAssignmentAction(values) {
    const { organization } = await requirePermission({
        permissions: { checklistAssignment: ["create"] },
    });
    const t = await getTranslations("project.charroi.actions");
    const payload = checklistAssignmentInputSchema.parse(values);

    const [vehicle, template] = await Promise.all([
        prisma.vehicle.findFirst({
            where: {
                id: payload.vehicleId,
                organizationId: organization.id,
            },
            select: {
                id: true,
            },
        }),
        prisma.checklistTemplate.findFirst({
            where: {
                id: payload.checklistTemplateId,
                organizationId: organization.id,
            },
            select: {
                id: true,
            },
        }),
    ]);

    if (!vehicle || !template) {
        throw new Error(t("assignment_entity_not_found"));
    }

    try {
        const assignment = await prisma.vehicleChecklistAssignment.create({
            data: {
                organizationId: organization.id,
                vehicleId: payload.vehicleId,
                checklistTemplateId: payload.checklistTemplateId,
                publicToken: generatePublicToken(),
                isActive: payload.isActive,
            },
        });

        revalidateCharroiPaths();
        return assignment;
    } catch (error) {
        withFriendlyPrismaError(error, t, {
            "vehicleId,checklistTemplateId": t("assignment_exists"),
        });
    }
}

export async function updateChecklistAssignmentAction({ assignmentId, isActive }) {
    const { organization } = await requirePermission({
        permissions: { checklistAssignment: ["update"] },
    });
    await ensureOrganizationAssignment(assignmentId, organization.id);

    const assignment = await prisma.vehicleChecklistAssignment.update({
        where: {
            id: assignmentId,
        },
        data: {
            isActive,
        },
    });

    revalidateCharroiPaths();
    return assignment;
}

export async function regenerateChecklistAssignmentTokenAction({ assignmentId }) {
    const { organization } = await requirePermission({
        permissions: { checklistAssignment: ["update"] },
    });
    await ensureOrganizationAssignment(assignmentId, organization.id);

    const assignment = await prisma.vehicleChecklistAssignment.update({
        where: {
            id: assignmentId,
        },
        data: {
            publicToken: generatePublicToken(),
        },
    });

    revalidateCharroiPaths();
    return assignment;
}

export async function deleteChecklistAssignmentAction({ assignmentId }) {
    const { organization } = await requirePermission({
        permissions: { checklistAssignment: ["delete"] },
    });
    await ensureOrganizationAssignment(assignmentId, organization.id);

    const assignment = await prisma.vehicleChecklistAssignment.delete({
        where: {
            id: assignmentId,
        },
    });

    revalidateCharroiPaths();
    return assignment;
}

export async function updateMyChecklistSubscriptionAction(values) {
    const { organization, user } = await requireActiveOrganization();

    await requirePermission({
        permissions: { checklistSubscription: ["update"] },
    });

    const payload = checklistSubscriptionInputSchema.parse(values);
    const member = await getCurrentOrganizationMember(organization.id, user.id);

    if (!member) {
        throw new Error("Membre introuvable");
    }

    const category = await prisma.checklistCategory.findFirst({
        where: {
            id: payload.categoryId,
            organizationId: organization.id,
        },
        select: {
            id: true,
            defaultDigestCron: true,
        },
    });

    if (!category) {
        throw new Error("Catégorie introuvable");
    }

    if (payload.deliveryModeOverride === "DIGEST" && !category.defaultDigestCron) {
        throw new Error("Cette catégorie ne dispose pas encore d'un cron digest");
    }

    const subscription = await prisma.checklistMemberSubscription.upsert({
        where: {
            categoryId_memberId: {
                categoryId: payload.categoryId,
                memberId: member.id,
            },
        },
        create: {
            organizationId: organization.id,
            categoryId: payload.categoryId,
            memberId: member.id,
            isActive: payload.isActive,
            deliveryModeOverride: payload.deliveryModeOverride,
        },
        update: {
            isActive: payload.isActive,
            deliveryModeOverride: payload.deliveryModeOverride,
        },
    });

    revalidateCharroiPaths();
    return subscription;
}
