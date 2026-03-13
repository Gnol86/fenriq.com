import { describe, expect, test } from "bun:test";
import {
    duplicateField,
    normalizeFieldForType,
} from "@project/features/charroi/checklist-template-builder-helpers";

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

    test("resets photoCommentRequired when switching away from a photo field", () => {
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
                "text"
            )
        ).toMatchObject({
            type: "text",
            photoCommentRequired: false,
            options: [],
        });
    });
});
