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
                {
                    id: "follow-up-notes",
                    type: "text_list",
                    label: "Follow-up notes",
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
            "follow-up-notes": [],
        });
    });

    test("prefills compatible values from the latest submission and active text history", () => {
        const latestSubmission = {
            responseJson: {
                comment: "  All good  ",
                mileage: 125000,
                fuel: "low",
                equipment: ["gps", "kit"],
                clean: true,
                "damage-photos": ["photo-1"],
                "follow-up-notes": ["Legacy note"],
            },
        };
        const historicalPhotos = [
            {
                id: "photo-1",
                fieldId: "damage-photos",
                originalName: "damage-1.jpg",
                url: "https://example.com/damage-1.jpg",
            },
            {
                id: "photo-2",
                fieldId: "damage-photos",
                originalName: "damage-2.jpg",
                url: "https://example.com/damage-2.jpg",
            },
        ];
        const historicalTextEntries = [
            {
                id: "text-1",
                fieldId: "follow-up-notes",
                text: "Check tires",
            },
            {
                id: "text-2",
                fieldId: "follow-up-notes",
                text: "Refill washer fluid",
            },
        ];

        expect(
            buildPublicChecklistPrefill({
                schema,
                latestSubmission,
                historicalPhotos,
                historicalTextEntries,
            })
        ).toEqual({
            initialResponses: {
                comment: "All good",
                mileage: 125000,
                fuel: "low",
                equipment: ["gps", "kit"],
                clean: true,
                "damage-photos": [],
                "follow-up-notes": ["Check tires", "Refill washer fluid"],
            },
            historicalPhotosByFieldId: {
                "damage-photos": [
                    {
                        id: "photo-1",
                        fieldId: "damage-photos",
                        originalName: "damage-1.jpg",
                        url: "https://example.com/damage-1.jpg",
                    },
                    {
                        id: "photo-2",
                        fieldId: "damage-photos",
                        originalName: "damage-2.jpg",
                        url: "https://example.com/damage-2.jpg",
                    },
                ],
            },
            historicalTextEntriesByFieldId: {
                "follow-up-notes": [
                    {
                        id: "text-1",
                        fieldId: "follow-up-notes",
                        text: "Check tires",
                    },
                    {
                        id: "text-2",
                        fieldId: "follow-up-notes",
                        text: "Refill washer fluid",
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
                "follow-up-notes": ["Legacy note"],
            },
        };
        const historicalPhotos = [
            {
                id: "photo-legacy",
                fieldId: "legacy-photo",
                originalName: "legacy.jpg",
                url: "https://example.com/legacy.jpg",
            },
        ];
        const historicalTextEntries = [
            {
                id: "text-legacy",
                fieldId: "legacy-text",
                text: "Legacy text",
            },
        ];

        expect(
            buildPublicChecklistPrefill({
                schema,
                latestSubmission,
                historicalPhotos,
                historicalTextEntries,
            })
        ).toEqual({
            initialResponses: {
                comment: "Still here",
                mileage: 150500,
                fuel: "",
                equipment: ["gps"],
                clean: false,
                "damage-photos": [],
                "follow-up-notes": [],
            },
            historicalPhotosByFieldId: {},
            historicalTextEntriesByFieldId: {},
        });
    });

    test("returns defaults when there is no previous submission", () => {
        expect(
            buildPublicChecklistPrefill({
                schema,
                latestSubmission: null,
                historicalPhotos: [
                    {
                        id: "photo-1",
                        fieldId: "damage-photos",
                        originalName: "damage.jpg",
                        url: "https://example.com/damage.jpg",
                    },
                ],
                historicalTextEntries: [
                    {
                        id: "text-1",
                        fieldId: "follow-up-notes",
                        text: "Inspect mirror",
                    },
                ],
            })
        ).toEqual({
            initialResponses: {
                comment: "",
                mileage: "",
                fuel: "",
                equipment: [],
                clean: false,
                "damage-photos": [],
                "follow-up-notes": ["Inspect mirror"],
            },
            historicalPhotosByFieldId: {
                "damage-photos": [
                    {
                        id: "photo-1",
                        fieldId: "damage-photos",
                        originalName: "damage.jpg",
                        url: "https://example.com/damage.jpg",
                    },
                ],
            },
            historicalTextEntriesByFieldId: {
                "follow-up-notes": [
                    {
                        id: "text-1",
                        fieldId: "follow-up-notes",
                        text: "Inspect mirror",
                    },
                ],
            },
        });
    });
});
