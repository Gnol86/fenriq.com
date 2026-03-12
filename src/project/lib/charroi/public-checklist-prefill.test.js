import { describe, expect, test } from "bun:test";
import {
    buildPublicChecklistPrefill,
    createChecklistInitialResponses,
} from "@project/lib/charroi/public-checklist-prefill";

const schema = {
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
                    id: "mileage",
                    type: "number",
                    label: "Mileage",
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
                        { id: "equipment-gps", label: "GPS", value: "gps" },
                        { id: "equipment-kit", label: "Kit", value: "kit" },
                    ],
                },
                {
                    id: "clean",
                    type: "checkbox",
                    label: "Clean",
                    description: "",
                    placeholder: "",
                    required: false,
                    options: [],
                },
                {
                    id: "damage-photos",
                    type: "photo",
                    label: "Damage photos",
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

describe("public checklist prefill", () => {
    test("creates default responses from schema", () => {
        expect(createChecklistInitialResponses(schema)).toEqual({
            comment: "",
            mileage: "",
            fuel: "",
            equipment: [],
            clean: false,
            "damage-photos": [],
        });
    });

    test("prefills compatible values from the latest submission", () => {
        const latestSubmission = {
            responseJson: {
                comment: "  All good  ",
                mileage: 125000,
                fuel: "low",
                equipment: ["gps", "kit"],
                clean: true,
                "damage-photos": ["photo-1"],
            },
            photos: [
                {
                    id: "photo-1",
                    fieldId: "damage-photos",
                    originalName: "damage-1.jpg",
                    url: "https://example.com/damage-1.jpg",
                },
            ],
        };

        expect(buildPublicChecklistPrefill({ schema, latestSubmission })).toEqual({
            initialResponses: {
                comment: "All good",
                mileage: 125000,
                fuel: "low",
                equipment: ["gps", "kit"],
                clean: true,
                "damage-photos": [],
            },
            previousPhotosByFieldId: {
                "damage-photos": [
                    {
                        id: "photo-1",
                        fieldId: "damage-photos",
                        originalName: "damage-1.jpg",
                        url: "https://example.com/damage-1.jpg",
                    },
                ],
            },
        });
    });

    test("drops unknown fields and invalid option values", () => {
        const latestSubmission = {
            responseJson: {
                legacy: "old value",
                comment: "Still here",
                mileage: "150500",
                fuel: "invalid",
                equipment: ["gps", "invalid"],
                clean: "yes",
            },
            photos: [
                {
                    id: "photo-legacy",
                    fieldId: "legacy-photo",
                    originalName: "legacy.jpg",
                    url: "https://example.com/legacy.jpg",
                },
            ],
        };

        expect(buildPublicChecklistPrefill({ schema, latestSubmission })).toEqual({
            initialResponses: {
                comment: "Still here",
                mileage: 150500,
                fuel: "",
                equipment: ["gps"],
                clean: false,
                "damage-photos": [],
            },
            previousPhotosByFieldId: {},
        });
    });

    test("returns defaults when there is no previous submission", () => {
        expect(buildPublicChecklistPrefill({ schema, latestSubmission: null })).toEqual({
            initialResponses: {
                comment: "",
                mileage: "",
                fuel: "",
                equipment: [],
                clean: false,
                "damage-photos": [],
            },
            previousPhotosByFieldId: {},
        });
    });
});
