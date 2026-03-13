import { describe, expect, test } from "bun:test";
import { checklistFieldSchema } from "@project/lib/charroi/template-schema";

describe("checklist field schema", () => {
    test("defaults photoCommentRequired to false for legacy photo fields", () => {
        expect(
            checklistFieldSchema.parse({
                id: "damage-photos",
                type: "photo",
                label: "Photos des degats",
            })
        ).toEqual({
            id: "damage-photos",
            type: "photo",
            label: "Photos des degats",
            description: "",
            placeholder: "",
            required: false,
            photoCommentRequired: false,
            options: [],
        });
    });

    test("accepts the text_list field type", () => {
        expect(
            checklistFieldSchema.parse({
                id: "follow-up-notes",
                type: "text_list",
                label: "Notes",
            })
        ).toEqual({
            id: "follow-up-notes",
            type: "text_list",
            label: "Notes",
            description: "",
            placeholder: "",
            required: false,
            photoCommentRequired: false,
            options: [],
        });
    });
});
