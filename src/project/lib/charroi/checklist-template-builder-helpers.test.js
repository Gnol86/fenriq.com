import { describe, expect, test } from "bun:test";
import {
    buildChecklistBuilderFieldOptions,
    duplicateField,
    normalizeFieldForType,
    normalizeRuleConditionForField,
    normalizeRuleConditionForOperator,
} from "@project/lib/charroi/checklist-template-builder-helpers";

describe("checklist template builder helpers", () => {
    test("duplicates the photoCommentRequired option", () => {
        const duplicatedField = duplicateField({
            id: "damage-photos",
            type: "photo",
            label: "Photos des degats",
            description: "",
            placeholder: "",
            required: false,
            photoCommentRequired: true,
            options: [],
        });

        expect(duplicatedField.id).not.toBe("damage-photos");
        expect(duplicatedField.photoCommentRequired).toBe(true);
    });

    test("resets photoCommentRequired when switching from photo to text_list", () => {
        expect(
            normalizeFieldForType(
                {
                    id: "damage-photos",
                    type: "photo",
                    label: "Photos des degats",
                    description: "",
                    placeholder: "",
                    required: false,
                    photoCommentRequired: true,
                    options: [],
                },
                "text_list"
            )
        ).toMatchObject({
            type: "text_list",
            photoCommentRequired: false,
            options: [],
        });
    });

    test("resets an incompatible operator when the condition field changes", () => {
        const fieldOptions = buildChecklistBuilderFieldOptions({
            sections: [
                {
                    id: "section-1",
                    title: "Section",
                    fields: [
                        {
                            id: "comment",
                            type: "text",
                            label: "Comment",
                            description: "",
                            placeholder: "",
                            required: false,
                            photoCommentRequired: false,
                            options: [],
                        },
                    ],
                },
            ],
        });

        expect(
            normalizeRuleConditionForField({
                condition: {
                    id: "condition-1",
                    fieldId: "comment",
                    operator: "gt",
                    repeatOnTrueChange: true,
                    value: "5",
                    secondValue: "",
                },
                fieldOption: fieldOptions[0],
            })
        ).toMatchObject({
            operator: "isEmpty",
            repeatOnTrueChange: false,
            value: "",
        });
    });

    test("clears the value and repeat flag when the operator changes", () => {
        expect(
            normalizeRuleConditionForOperator({
                condition: {
                    id: "condition-1",
                    fieldId: "equipment",
                    operator: "allSelected",
                    repeatOnTrueChange: true,
                    value: ["vest"],
                    secondValue: "",
                },
                fieldOption: {
                    id: "equipment",
                    type: "multi_select",
                    label: "Equipment",
                    options: [
                        {
                            id: "vest-option",
                            label: "Vest",
                            value: "vest",
                        },
                    ],
                },
                operator: "changed",
            })
        ).toMatchObject({
            operator: "changed",
            repeatOnTrueChange: false,
            value: "",
        });
    });
});
