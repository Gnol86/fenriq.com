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
                    id: "fuel",
                    type: "single_select",
                    label: "Fuel",
                    description: "",
                    placeholder: "",
                    required: true,
                    options: [
                        { id: "fuel-ok", label: "Full", value: "full" },
                        { id: "fuel-ko", label: "Low", value: "low" },
                    ],
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
            ],
        },
    ],
    rules: [
        {
            id: "fuel-alert",
            title: "Low fuel",
            description: "Send to logistics",
            categoryId: "category-1",
            combinator: "ALL",
            conditions: [{ fieldId: "fuel", operator: "equals", value: "low", secondValue: "" }],
        },
        {
            id: "odometer-alert",
            title: "Odometer threshold",
            description: "",
            categoryId: "category-2",
            combinator: "ANY",
            conditions: [
                { fieldId: "odometer", operator: "gte", value: "200000", secondValue: "" },
                { fieldId: "fuel", operator: "equals", value: "low", secondValue: "" },
            ],
        },
    ],
};

describe("charroi rule engine", () => {
    test("evaluates simple and crossed rules", () => {
        const issues = evaluateChecklistRules({
            schemaJson,
            responses: {
                fuel: "low",
                odometer: 120000,
            },
        });

        expect(issues).toHaveLength(2);
        expect(issues[0].ruleId).toBe("fuel-alert");
        expect(issues[1].ruleId).toBe("odometer-alert");
    });

    test("ignores unmatched rules", () => {
        const issues = evaluateChecklistRules({
            schemaJson,
            responses: {
                fuel: "full",
                odometer: 150000,
            },
        });

        expect(issues).toHaveLength(0);
    });
});
