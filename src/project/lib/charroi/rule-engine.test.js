import { describe, expect, test } from "bun:test";
import { evaluateChecklistRules } from "@project/lib/charroi/rule-engine";

const schemaJson = {
    sections: [
        {
            id: "general",
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
                    options: [],
                },
                {
                    id: "odometer",
                    type: "number",
                    label: "Odometer",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
                {
                    id: "fuel",
                    type: "single_select",
                    label: "Fuel",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [
                        { id: "fuel-full", label: "Full", value: "full" },
                        { id: "fuel-low", label: "Low", value: "low" },
                    ],
                },
                {
                    id: "equipment",
                    type: "multi_select",
                    label: "Equipment",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [
                        { id: "vest", label: "Vest", value: "vest" },
                        { id: "triangle", label: "Triangle", value: "triangle" },
                        { id: "kit", label: "Kit", value: "kit" },
                    ],
                },
                {
                    id: "validated",
                    type: "checkbox",
                    label: "Validated",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
                {
                    id: "damagePhotos",
                    type: "photo",
                    label: "Damage photos",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
                {
                    id: "persistentNotes",
                    type: "text_list",
                    label: "Persistent notes",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
            ],
        },
    ],
    rules: [],
};

function buildRule(overrides) {
    return {
        id: "rule-1",
        title: "Rule",
        description: "",
        categoryId: "category-1",
        combinator: "ALL",
        conditions: [],
        ...overrides,
    };
}

function buildCondition(overrides) {
    return {
        id: "condition-1",
        fieldId: "comment",
        operator: "isNotEmpty",
        value: "",
        secondValue: "",
        repeatOnTrueChange: false,
        ...overrides,
    };
}

describe("charroi rule engine", () => {
    test("notifies when a state condition becomes true for the first time", () => {
        const issues = evaluateChecklistRules({
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [buildCondition()],
                    }),
                ],
            },
            responses: {
                comment: "New problem",
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });

    test("keeps the issue history without notifying again when the state stays true", () => {
        const issues = evaluateChecklistRules({
            previousResponses: {
                comment: "First problem",
            },
            responses: {
                comment: "Updated problem",
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [buildCondition()],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(false);
    });

    test("notifies again when repeatOnTrueChange is enabled and the state stays true", () => {
        const issues = evaluateChecklistRules({
            previousResponses: {
                odometer: 7,
            },
            responses: {
                odometer: 9,
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [
                            buildCondition({
                                fieldId: "odometer",
                                operator: "gt",
                                repeatOnTrueChange: true,
                                value: "5",
                            }),
                        ],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });

    test("supports multi-select subsets with any change notifications", () => {
        const issues = evaluateChecklistRules({
            previousResponses: {
                equipment: ["vest"],
            },
            responses: {
                equipment: ["vest", "triangle"],
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [
                            buildCondition({
                                fieldId: "equipment",
                                operator: "allSelected",
                                value: ["vest", "triangle"],
                            }),
                        ],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });

    test("treats photo additions as differential triggers", () => {
        const issues = evaluateChecklistRules({
            currentFieldValuesByFieldId: {
                damagePhotos: ["photo-1", "photo-2"],
            },
            previousFieldValuesByFieldId: {
                damagePhotos: ["photo-1"],
            },
            responses: {
                damagePhotos: ["photo-2"],
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [
                            buildCondition({
                                fieldId: "damagePhotos",
                                operator: "addedEntries",
                            }),
                        ],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });

    test("treats text list removals as differential triggers", () => {
        const issues = evaluateChecklistRules({
            currentFieldValuesByFieldId: {
                persistentNotes: ["note-1"],
            },
            previousFieldValuesByFieldId: {
                persistentNotes: ["note-1", "note-2"],
            },
            responses: {
                persistentNotes: ["note-1"],
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [
                            buildCondition({
                                fieldId: "persistentNotes",
                                operator: "removedEntries",
                            }),
                        ],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });

    test("notifies on ALL rules when the rule becomes true even if only one condition changed", () => {
        const issues = evaluateChecklistRules({
            previousResponses: {
                comment: "",
                validated: true,
            },
            responses: {
                comment: "Needs review",
                validated: true,
            },
            schemaJson: {
                ...schemaJson,
                rules: [
                    buildRule({
                        conditions: [
                            buildCondition({
                                fieldId: "comment",
                                operator: "isNotEmpty",
                            }),
                            buildCondition({
                                id: "condition-2",
                                fieldId: "validated",
                                operator: "isTrue",
                            }),
                        ],
                    }),
                ],
            },
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].notificationTriggered).toBe(true);
    });
});
