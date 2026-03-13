import { describe, expect, test } from "bun:test";
import {
    buildChecklistTextListResponseValue,
    buildHistoricalChecklistTextEntriesByFieldId,
} from "@project/lib/charroi/checklist-text-entry";

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

describe("checklist text entry helpers", () => {
    test("groups only historical entries that still belong to text_list fields", () => {
        expect(
            buildHistoricalChecklistTextEntriesByFieldId({
                schema,
                textEntries: [
                    {
                        id: "text-1",
                        fieldId: "follow-up-notes",
                        text: "Check tires",
                    },
                    {
                        id: "text-2",
                        fieldId: "legacy-field",
                        text: "Legacy",
                    },
                ],
            })
        ).toEqual({
            "follow-up-notes": [
                {
                    id: "text-1",
                    fieldId: "follow-up-notes",
                    text: "Check tires",
                },
            ],
        });
    });

    test("builds the visible response from kept historical entries and trimmed drafts", () => {
        expect(
            buildChecklistTextListResponseValue({
                historicalTextEntries: [
                    {
                        id: "text-1",
                        text: "Check tires",
                    },
                    {
                        id: "text-2",
                        text: "Refill washer fluid",
                    },
                ],
                removedHistoricalTextEntryIds: ["text-2"],
                draftTextEntries: [
                    {
                        id: "draft-1",
                        text: "  Add charging card  ",
                    },
                    {
                        id: "draft-2",
                        text: "   ",
                    },
                ],
            })
        ).toEqual(["Check tires", "Add charging card"]);
    });
});
