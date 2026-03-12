import { describe, expect, test } from "bun:test";
import {
    buildSchemaFromValues,
    parseSchemaText,
    reorderItems,
    serializeSchema,
} from "@project/lib/charroi/checklist-builder-utils";

const schema = {
    sections: [
        {
            id: "section-a",
            title: "Section A",
            description: "",
            fields: [
                {
                    id: "field-a",
                    type: "text",
                    label: "Champ A",
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

describe("checklist builder utils", () => {
    test("serializes and parses schema bidirectionally", () => {
        const serialized = serializeSchema(schema);
        const parsed = parseSchemaText(serialized);

        expect(parsed).toEqual(schema);
        expect(buildSchemaFromValues(parsed)).toEqual(schema);
    });

    test("reorders items by id", () => {
        const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

        expect(reorderItems(items, "c", "a")).toEqual([{ id: "c" }, { id: "a" }, { id: "b" }]);
        expect(reorderItems(items, "a", "a")).toEqual(items);
    });
});
