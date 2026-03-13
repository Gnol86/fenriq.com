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
});
