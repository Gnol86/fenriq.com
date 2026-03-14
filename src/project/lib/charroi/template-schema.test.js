import { describe, expect, test } from "bun:test";
import { checklistTemplateSchemaJsonSchema } from "@project/lib/charroi/template-schema";

function createBaseSchema() {
    return {
        sections: [
            {
                id: "section-1",
                title: "General",
                description: "",
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
                    {
                        id: "equipment",
                        type: "multi_select",
                        label: "Equipment",
                        description: "",
                        placeholder: "",
                        required: false,
                        photoCommentRequired: false,
                        options: [
                            {
                                id: "vest-option",
                                label: "Vest",
                                value: "vest",
                            },
                        ],
                    },
                ],
            },
        ],
        rules: [],
    };
}

describe("checklist template schema", () => {
    test("rejects operators that do not match the field type", () => {
        expect(() =>
            checklistTemplateSchemaJsonSchema.parse({
                ...createBaseSchema(),
                rules: [
                    {
                        id: "rule-1",
                        title: "Invalid",
                        description: "",
                        categoryId: null,
                        combinator: "ALL",
                        conditions: [
                            {
                                id: "condition-1",
                                fieldId: "comment",
                                operator: "gt",
                                value: "5",
                                secondValue: "",
                                repeatOnTrueChange: false,
                            },
                        ],
                    },
                ],
            })
        ).toThrow();
    });

    test("requires an array value for modern multi-select operators", () => {
        expect(() =>
            checklistTemplateSchemaJsonSchema.parse({
                ...createBaseSchema(),
                rules: [
                    {
                        id: "rule-1",
                        title: "Invalid",
                        description: "",
                        categoryId: null,
                        combinator: "ALL",
                        conditions: [
                            {
                                id: "condition-1",
                                fieldId: "equipment",
                                operator: "allSelected",
                                value: "vest",
                                secondValue: "",
                                repeatOnTrueChange: false,
                            },
                        ],
                    },
                ],
            })
        ).toThrow();
    });
});
