import { describe, expect, test } from "bun:test";
import {
    buildHistoricalChecklistPhotosByFieldId,
    processChecklistPhotoDeletionBatch,
} from "@project/lib/charroi/checklist-photo-cleanup";

const schema = {
    sections: [
        {
            id: "general",
            title: "General",
            description: "",
            fields: [
                {
                    id: "damage-photos",
                    type: "photo",
                    label: "Damage photos",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
                {
                    id: "comment",
                    type: "text",
                    label: "Comment",
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

describe("checklist photo cleanup helpers", () => {
    test("groups only historical photos that still belong to photo fields", () => {
        expect(
            buildHistoricalChecklistPhotosByFieldId({
                schema,
                photos: [
                    {
                        id: "photo-1",
                        fieldId: "damage-photos",
                        originalName: "damage-1.jpg",
                        url: "https://example.com/damage-1.jpg",
                    },
                    {
                        id: "photo-2",
                        fieldId: "legacy-photo",
                        originalName: "legacy.jpg",
                        url: "https://example.com/legacy.jpg",
                    },
                ],
            })
        ).toEqual({
            "damage-photos": [
                {
                    id: "photo-1",
                    fieldId: "damage-photos",
                    originalName: "damage-1.jpg",
                    url: "https://example.com/damage-1.jpg",
                },
            ],
        });
    });

    test("deletes photos when storage cleanup succeeds", async () => {
        const calls = [];
        const cleanup = await processChecklistPhotoDeletionBatch({
            photos: [{ id: "photo-1", storageKey: "key-1" }],
            deleteFromStorage: async photo => {
                calls.push(["storage", photo.id]);
            },
            deletePhotoRecord: async photo => {
                calls.push(["db-delete", photo.id]);
            },
            markPhotoDeleteFailed: async () => {
                calls.push(["failed"]);
            },
        });

        expect(cleanup).toEqual({
            attemptedCount: 1,
            deletedCount: 1,
            pendingRetryCount: 0,
        });
        expect(calls).toEqual([
            ["storage", "photo-1"],
            ["db-delete", "photo-1"],
        ]);
    });

    test("keeps photos pending retry when storage cleanup fails", async () => {
        const failures = [];
        const cleanup = await processChecklistPhotoDeletionBatch({
            photos: [{ id: "photo-1", storageKey: "key-1" }],
            deleteFromStorage: async () => {
                throw new Error("S3 unavailable");
            },
            deletePhotoRecord: async () => {
                throw new Error("should not delete");
            },
            markPhotoDeleteFailed: async (photo, errorMessage) => {
                failures.push([photo.id, errorMessage]);
            },
        });

        expect(cleanup).toEqual({
            attemptedCount: 1,
            deletedCount: 0,
            pendingRetryCount: 1,
        });
        expect(failures).toEqual([["photo-1", "S3 unavailable"]]);
    });
});
