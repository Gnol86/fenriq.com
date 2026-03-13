import { describe, expect, test } from "bun:test";
import {
    buildChecklistPhotoCommentsPayload,
    getChecklistPhotoCommentValue,
    validateChecklistPhotoComments,
} from "@project/lib/charroi/checklist-photo-comments";

describe("checklist photo comments", () => {
    test("builds a payload keyed by photo id", () => {
        expect(
            buildChecklistPhotoCommentsPayload({
                "damage-photos": [
                    { id: "photo-1", comment: "  Left door  " },
                    { id: "photo-2", comment: "" },
                ],
            })
        ).toEqual({
            "photo-1": "  Left door  ",
            "photo-2": "",
        });
    });

    test("normalizes comments and validates photo references", () => {
        const result = validateChecklistPhotoComments({
            fieldMap: new Map([
                [
                    "damage-photos",
                    {
                        type: "photo",
                        label: "Photos des degats",
                        photoCommentRequired: true,
                    },
                ],
            ]),
            photoComments: {
                "photo-1": "  Left door  ",
                "photo-2": "Mirror",
            },
            sanitizedResponses: {
                "damage-photos": ["photo-1", "photo-2"],
            },
            uploadedPhotoMap: new Map([
                ["photo-1", { id: "photo-1", fieldId: "damage-photos" }],
                ["photo-2", { id: "photo-2", fieldId: "damage-photos" }],
            ]),
        });

        expect(result).toEqual({
            normalizedPhotoComments: {
                "photo-1": "Left door",
                "photo-2": "Mirror",
            },
            referencedPhotoIds: ["photo-1", "photo-2"],
        });
    });

    test("rejects missing comments when the field requires them", () => {
        expect(() =>
            validateChecklistPhotoComments({
                fieldMap: new Map([
                    [
                        "damage-photos",
                        {
                            type: "photo",
                            label: "Photos des degats",
                            photoCommentRequired: true,
                        },
                    ],
                ]),
                photoComments: {
                    "photo-1": "   ",
                },
                sanitizedResponses: {
                    "damage-photos": ["photo-1"],
                },
                uploadedPhotoMap: new Map([
                    ["photo-1", { id: "photo-1", fieldId: "damage-photos" }],
                ]),
            })
        ).toThrow('Le commentaire est requis pour chaque photo du champ "Photos des degats"');
    });

    test("rejects comments that do not belong to the current draft", () => {
        expect(() =>
            validateChecklistPhotoComments({
                fieldMap: new Map(),
                photoComments: {
                    orphan: "Comment",
                },
                sanitizedResponses: {},
                uploadedPhotoMap: new Map(),
            })
        ).toThrow("Un commentaire photo est invalide");
    });

    test("trims comment values consistently", () => {
        expect(getChecklistPhotoCommentValue("  Aile  ")).toBe("Aile");
        expect(getChecklistPhotoCommentValue(null)).toBe("");
    });
});
