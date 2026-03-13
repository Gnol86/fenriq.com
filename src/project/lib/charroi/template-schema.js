import { z } from "zod";
import {
    CHECKLIST_DELIVERY_MODES,
    CHECKLIST_FIELD_TYPES,
    CHECKLIST_RULE_COMBINATORS,
    CHECKLIST_RULE_OPERATORS,
} from "./constants";
import { isValidCronExpression } from "./cron";

const nonEmptyText = z.string().trim().min(1);

export const checklistOptionSchema = z.object({
    id: nonEmptyText,
    label: nonEmptyText,
    value: nonEmptyText,
});

export const checklistFieldSchema = z
    .object({
        id: nonEmptyText,
        type: z.enum(CHECKLIST_FIELD_TYPES),
        label: nonEmptyText,
        description: z.string().trim().optional().default(""),
        placeholder: z.string().trim().optional().default(""),
        required: z.boolean().default(false),
        options: z.array(checklistOptionSchema).default([]),
    })
    .superRefine((field, context) => {
        const needsOptions = ["single_select", "multi_select"].includes(field.type);

        if (needsOptions && field.options.length === 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one option is required",
                path: ["options"],
            });
        }
    });

export const checklistSectionSchema = z.object({
    id: nonEmptyText,
    title: nonEmptyText,
    description: z.string().trim().optional().default(""),
    fields: z.array(checklistFieldSchema).min(1),
});

export const checklistRuleConditionSchema = z.object({
    fieldId: nonEmptyText,
    operator: z.enum(CHECKLIST_RULE_OPERATORS),
    value: z.any().optional(),
    secondValue: z.any().optional(),
});

export const checklistRuleSchema = z.object({
    id: nonEmptyText,
    title: nonEmptyText,
    description: z.string().trim().optional().default(""),
    categoryId: z.string().trim().optional().nullable().default(null),
    combinator: z.enum(CHECKLIST_RULE_COMBINATORS),
    conditions: z.array(checklistRuleConditionSchema).min(1),
});

export const checklistTemplateSchemaJsonSchema = z.object({
    sections: z.array(checklistSectionSchema).min(1),
    rules: z.array(checklistRuleSchema).default([]),
});

export const checklistTemplateInputSchema = z.object({
    name: nonEmptyText.max(120),
    description: z.string().trim().optional().default(""),
    isActive: z.boolean().default(true),
    schemaJson: checklistTemplateSchemaJsonSchema,
});

export const checklistCategoryInputSchema = z
    .object({
        name: nonEmptyText.max(80),
        description: z.string().trim().optional().default(""),
        defaultDeliveryMode: z.enum(CHECKLIST_DELIVERY_MODES),
        defaultDigestCron: z.string().trim().optional().default(""),
        timeZone: nonEmptyText.default("Europe/Brussels"),
        isActive: z.boolean().default(true),
    })
    .superRefine((category, context) => {
        if (category.defaultDigestCron && !isValidCronExpression(category.defaultDigestCron)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "The cron expression is invalid",
                path: ["defaultDigestCron"],
            });
        }

        if (
            category.defaultDeliveryMode === "DIGEST" &&
            !isValidCronExpression(category.defaultDigestCron)
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A valid cron expression is required for digest categories",
                path: ["defaultDigestCron"],
            });
        }
    });

export const checklistVehicleInputSchema = z.object({
    plateNumber: nonEmptyText.max(30),
    name: z.string().trim().optional().default(""),
    brand: z.string().trim().optional().default(""),
    model: z.string().trim().optional().default(""),
    isActive: z.boolean().default(true),
});

export const checklistAssignmentInputSchema = z.object({
    vehicleId: nonEmptyText,
    checklistTemplateId: nonEmptyText,
    isActive: z.boolean().default(true),
});

export const checklistSubscriptionInputSchema = z.object({
    categoryId: nonEmptyText,
    isActive: z.boolean().default(true),
    deliveryModeOverride: z.enum(CHECKLIST_DELIVERY_MODES).nullable().optional().default(null),
});

export const publicChecklistSubmitSchema = z.object({
    submitterName: nonEmptyText.max(120),
    rememberSubmitterName: z.boolean().optional().default(false),
    draftUploadKey: z.string().trim().optional().default(""),
    removedHistoricalPhotoIds: z.array(nonEmptyText).optional().default([]),
    responses: z.record(z.string(), z.any()),
});
