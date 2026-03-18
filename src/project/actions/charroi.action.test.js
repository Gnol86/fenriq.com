import { beforeEach, describe, expect, mock, test } from "bun:test";

const requirePermissionMock = mock();
const requireActiveOrganizationMock = mock();
const getTranslationsMock = mock();
const assertCanCreateVehicleMock = mock();
const assertCharroiDashboardMutationAllowedMock = mock();
const revalidatePathMock = mock();

const parseVehicleInputMock = mock(values => values);
const parseTemplateInputMock = mock(values => values);
const parseCategoryInputMock = mock(values => values);
const parseAssignmentInputMock = mock(values => values);
const parseSubscriptionInputMock = mock(values => values);

const vehicleCreateMock = mock();
const vehicleUpdateMock = mock();
const vehicleDeleteMock = mock();
const vehicleFindFirstMock = mock();
const checklistTemplateCreateMock = mock();
const checklistTemplateUpdateMock = mock();
const checklistTemplateDeleteMock = mock();
const checklistTemplateFindFirstMock = mock();
const checklistCategoryCreateMock = mock();
const checklistCategoryFindFirstMock = mock();
const vehicleChecklistAssignmentCreateMock = mock();
const vehicleChecklistAssignmentFindFirstMock = mock();
const memberFindFirstMock = mock();
const checklistMemberSubscriptionUpsertMock = mock();

mock.module("@project/lib/charroi/template-schema", () => ({
    checklistAssignmentInputSchema: {
        parse: parseAssignmentInputMock,
    },
    checklistCategoryInputSchema: {
        parse: parseCategoryInputMock,
    },
    checklistSubscriptionInputSchema: {
        parse: parseSubscriptionInputMock,
    },
    checklistTemplateInputSchema: {
        parse: parseTemplateInputMock,
    },
    checklistVehicleInputSchema: {
        parse: parseVehicleInputMock,
    },
}));

mock.module("@project/lib/charroi/utils", () => ({
    generatePublicToken: () => "public-token",
    normalizeOptionalText: value => value?.trim?.() ?? value ?? null,
    normalizePlateNumber: value => value.trim().toUpperCase(),
}));

mock.module("@project/lib/charroi/quota", () => ({
    assertCanCreateVehicle: assertCanCreateVehicleMock,
    assertCharroiDashboardMutationAllowed: assertCharroiDashboardMutationAllowedMock,
}));

mock.module("@root/prisma/generated/client/client", () => ({
    Prisma: {
        PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
    },
}));

mock.module("next/cache", () => ({
    revalidatePath: revalidatePathMock,
}));

mock.module("next-intl/server", () => ({
    getTranslations: getTranslationsMock,
}));

mock.module("@/lib/access-control", () => ({
    requireActiveOrganization: requireActiveOrganizationMock,
    requirePermission: requirePermissionMock,
}));

mock.module("@/lib/prisma", () => ({
    default: {
        vehicle: {
            create: vehicleCreateMock,
            update: vehicleUpdateMock,
            delete: vehicleDeleteMock,
            findFirst: vehicleFindFirstMock,
        },
        checklistTemplate: {
            create: checklistTemplateCreateMock,
            update: checklistTemplateUpdateMock,
            delete: checklistTemplateDeleteMock,
            findFirst: checklistTemplateFindFirstMock,
        },
        checklistCategory: {
            create: checklistCategoryCreateMock,
            findFirst: checklistCategoryFindFirstMock,
        },
        vehicleChecklistAssignment: {
            create: vehicleChecklistAssignmentCreateMock,
            findFirst: vehicleChecklistAssignmentFindFirstMock,
        },
        member: {
            findFirst: memberFindFirstMock,
        },
        checklistMemberSubscription: {
            upsert: checklistMemberSubscriptionUpsertMock,
        },
    },
}));

const charroiActionsModulePromise = import("@project/actions/charroi.action");

describe("charroi quota guards in server actions", () => {
    beforeEach(() => {
        requirePermissionMock.mockReset();
        requireActiveOrganizationMock.mockReset();
        getTranslationsMock.mockReset();
        assertCanCreateVehicleMock.mockReset();
        assertCharroiDashboardMutationAllowedMock.mockReset();
        revalidatePathMock.mockReset();
        parseVehicleInputMock.mockReset();
        parseTemplateInputMock.mockReset();
        parseCategoryInputMock.mockReset();
        parseAssignmentInputMock.mockReset();
        parseSubscriptionInputMock.mockReset();
        vehicleCreateMock.mockReset();
        vehicleUpdateMock.mockReset();
        vehicleDeleteMock.mockReset();
        vehicleFindFirstMock.mockReset();
        checklistTemplateCreateMock.mockReset();
        checklistTemplateUpdateMock.mockReset();
        checklistTemplateDeleteMock.mockReset();
        checklistTemplateFindFirstMock.mockReset();
        checklistCategoryCreateMock.mockReset();
        checklistCategoryFindFirstMock.mockReset();
        vehicleChecklistAssignmentCreateMock.mockReset();
        vehicleChecklistAssignmentFindFirstMock.mockReset();
        memberFindFirstMock.mockReset();
        checklistMemberSubscriptionUpsertMock.mockReset();

        requirePermissionMock.mockResolvedValue({
            organization: {
                id: "org-1",
            },
            user: {
                id: "user-1",
            },
        });
        requireActiveOrganizationMock.mockResolvedValue({
            organization: {
                id: "org-1",
            },
            user: {
                id: "user-1",
            },
        });
        getTranslationsMock.mockResolvedValue((key, values) => {
            if (!values) {
                return key;
            }

            return `${key}:${JSON.stringify(values)}`;
        });
        assertCanCreateVehicleMock.mockResolvedValue({
            canCreateVehicle: true,
        });
        assertCharroiDashboardMutationAllowedMock.mockResolvedValue({
            isOverQuota: false,
        });
        parseVehicleInputMock.mockImplementation(values => values);
        parseTemplateInputMock.mockImplementation(values => values);
        parseCategoryInputMock.mockImplementation(values => values);
        parseAssignmentInputMock.mockImplementation(values => values);
        parseSubscriptionInputMock.mockImplementation(values => values);
        vehicleCreateMock.mockResolvedValue({
            id: "vehicle-1",
        });
        vehicleUpdateMock.mockResolvedValue({
            id: "vehicle-1",
        });
        vehicleDeleteMock.mockResolvedValue({
            id: "vehicle-1",
        });
        vehicleFindFirstMock.mockResolvedValue({
            id: "vehicle-1",
        });
        checklistTemplateCreateMock.mockResolvedValue({
            id: "template-1",
        });
        checklistTemplateUpdateMock.mockResolvedValue({
            id: "template-1",
            version: 2,
        });
        checklistTemplateDeleteMock.mockResolvedValue({
            id: "template-1",
        });
        checklistTemplateFindFirstMock.mockResolvedValue({
            id: "template-1",
            name: "Checklist",
            description: "",
            schemaJson: {
                sections: [],
                rules: [],
            },
            version: 1,
            isActive: true,
        });
        checklistCategoryCreateMock.mockResolvedValue({
            id: "category-1",
        });
        checklistCategoryFindFirstMock.mockResolvedValue({
            id: "category-1",
            defaultDigestCron: "0 7 * * 1-5",
        });
        vehicleChecklistAssignmentCreateMock.mockResolvedValue({
            id: "assignment-1",
        });
        vehicleChecklistAssignmentFindFirstMock.mockResolvedValue({
            id: "assignment-1",
        });
        memberFindFirstMock.mockResolvedValue({
            id: "member-1",
        });
        checklistMemberSubscriptionUpsertMock.mockResolvedValue({
            id: "subscription-1",
        });
    });

    test("refuse createVehicleAction quand le quota de véhicules est atteint", async () => {
        assertCanCreateVehicleMock.mockRejectedValue(new Error("quota reached"));
        const { createVehicleAction } = await charroiActionsModulePromise;

        await expect(
            createVehicleAction({
                plateNumber: "ab-123-cd",
                name: "Camion",
                brand: "Renault",
                model: "Master",
                isActive: true,
            })
        ).rejects.toThrow("quota reached");

        expect(vehicleCreateMock).not.toHaveBeenCalled();
    });

    test("autorise updateVehicleAction tant que l'organisation n'est pas au-dessus du quota", async () => {
        const { updateVehicleAction } = await charroiActionsModulePromise;

        await expect(
            updateVehicleAction({
                vehicleId: "vehicle-1",
                plateNumber: "ab-123-cd",
                name: "Camion",
                brand: "Renault",
                model: "Master",
                isActive: true,
            })
        ).resolves.toMatchObject({
            id: "vehicle-1",
        });

        expect(assertCharroiDashboardMutationAllowedMock).toHaveBeenCalledTimes(1);
        expect(vehicleUpdateMock).toHaveBeenCalledTimes(1);
    });

    test("refuse updateVehicleAction quand le quota est dépassé", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { updateVehicleAction } = await charroiActionsModulePromise;

        await expect(
            updateVehicleAction({
                vehicleId: "vehicle-1",
                plateNumber: "ab-123-cd",
                name: "Camion",
                brand: "Renault",
                model: "Master",
                isActive: true,
            })
        ).rejects.toThrow("dashboard locked");

        expect(vehicleUpdateMock).not.toHaveBeenCalled();
    });

    test("la suppression de véhicule reste autorisée même au-dessus du quota", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { deleteVehicleAction } = await charroiActionsModulePromise;

        await expect(
            deleteVehicleAction({
                vehicleId: "vehicle-1",
            })
        ).resolves.toMatchObject({
            id: "vehicle-1",
        });

        expect(assertCharroiDashboardMutationAllowedMock).not.toHaveBeenCalled();
        expect(vehicleDeleteMock).toHaveBeenCalledTimes(1);
    });

    test("refuse createChecklistTemplateAction quand le quota est dépassé", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { createChecklistTemplateAction } = await charroiActionsModulePromise;

        await expect(
            createChecklistTemplateAction({
                name: "Checklist",
                description: "",
                isActive: true,
                schemaJson: {
                    sections: [],
                    rules: [],
                },
            })
        ).rejects.toThrow("dashboard locked");

        expect(checklistTemplateCreateMock).not.toHaveBeenCalled();
    });

    test("refuse createChecklistAssignmentAction quand le quota est dépassé", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { createChecklistAssignmentAction } = await charroiActionsModulePromise;

        await expect(
            createChecklistAssignmentAction({
                vehicleId: "vehicle-1",
                checklistTemplateId: "template-1",
                isActive: true,
            })
        ).rejects.toThrow("dashboard locked");

        expect(vehicleChecklistAssignmentCreateMock).not.toHaveBeenCalled();
    });

    test("la création de catégorie reste autorisée même si le garde quota échouerait ailleurs", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { createChecklistCategoryAction } = await charroiActionsModulePromise;

        await expect(
            createChecklistCategoryAction({
                name: "Dégâts",
                description: "",
                defaultDeliveryMode: "IMMEDIATE",
                defaultDigestCron: "",
                timeZone: "Europe/Brussels",
                isActive: true,
            })
        ).resolves.toMatchObject({
            id: "category-1",
        });

        expect(checklistCategoryCreateMock).toHaveBeenCalledTimes(1);
    });

    test("les abonnements personnels restent modifiables même si le quota est dépassé", async () => {
        assertCharroiDashboardMutationAllowedMock.mockRejectedValue(new Error("dashboard locked"));
        const { updateMyChecklistSubscriptionAction } = await charroiActionsModulePromise;

        await expect(
            updateMyChecklistSubscriptionAction({
                categoryId: "category-1",
                isActive: true,
                deliveryModeOverride: null,
            })
        ).resolves.toMatchObject({
            id: "subscription-1",
        });

        expect(checklistMemberSubscriptionUpsertMock).toHaveBeenCalledTimes(1);
    });
});
