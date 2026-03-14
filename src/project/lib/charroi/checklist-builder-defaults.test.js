import { describe, expect, test } from "bun:test";
import { buildChecklistOptionValueFromLabel } from "@project/lib/charroi/checklist-builder-defaults";

describe("checklist builder defaults", () => {
    test("builds a simple select option value from the label", () => {
        expect(
            buildChecklistOptionValueFromLabel({
                label: "Pneu d'avantage dégonflé",
            })
        ).toBe("pneu-d-avantage-degonfle");
    });

    test("keeps a non-empty fallback value when the label is blank", () => {
        expect(
            buildChecklistOptionValueFromLabel({
                label: "   ",
                fallbackValue: "option-actuelle",
            })
        ).toBe("option-actuelle");
    });

    test("adds a numeric suffix when another option already uses the same value", () => {
        expect(
            buildChecklistOptionValueFromLabel({
                label: "Plein",
                optionId: "fuel-low",
                options: [
                    {
                        id: "fuel-full",
                        label: "Plein",
                        value: "plein",
                    },
                    {
                        id: "fuel-low",
                        label: "Bas",
                        value: "bas",
                    },
                ],
            })
        ).toBe("plein-2");
    });
});
