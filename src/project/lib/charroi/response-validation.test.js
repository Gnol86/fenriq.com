import { describe, expect, test } from "bun:test";
import { validateChecklistResponses } from "@project/lib/charroi/response-validation";

const schema = {
    sections: [
        {
            id: "general",
            title: "General",
            description: "",
            fields: [
                {
                    id: "follow-up-notes",
                    type: "text_list",
                    label: "Follow-up notes",
                    description: "",
                    placeholder: "",
                    required: true,
                    options: [],
                },
            ],
        },
    ],
    rules: [],
};

describe("checklist response validation", () => {
    test("trims and filters empty values for text_list fields", () => {
        expect(
            validateChecklistResponses({
                schemaJson: schema,
                responses: {
                    "follow-up-notes": ["  Check tires  ", "", "   ", "Refill washer fluid"],
                },
            }).sanitizedResponses
        ).toEqual({
            "follow-up-notes": ["Check tires", "Refill washer fluid"],
        });
    });

    test("requires at least one non-empty text for required text_list fields", () => {
        expect(() =>
            validateChecklistResponses({
                schemaJson: schema,
                responses: {
                    "follow-up-notes": [" ", ""],
                },
            })
        ).toThrow('Le champ "Follow-up notes" est requis');
    });
});
