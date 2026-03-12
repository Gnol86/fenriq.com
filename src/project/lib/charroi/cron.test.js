import { describe, expect, test } from "bun:test";
import { isCronDue, isValidCronExpression } from "@project/lib/charroi/cron";

describe("charroi cron", () => {
    test("validates a 5-field cron expression", () => {
        expect(isValidCronExpression("0 7 * * 1-5")).toBe(true);
        expect(isValidCronExpression("bad cron")).toBe(false);
    });

    test("matches a date against cron in a timezone", () => {
        const date = new Date("2026-03-16T06:00:00.000Z");

        expect(isCronDue(date, "0 7 * * 1-5", "Europe/Brussels")).toBe(true);
        expect(isCronDue(date, "30 7 * * 1-5", "Europe/Brussels")).toBe(false);
    });
});
