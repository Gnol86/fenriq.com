import { checklistTemplateSchemaJsonSchema } from "./template-schema";
import { coerceConditionValues, ensureArray, normalizeChecklistTextValue } from "./utils";

function asComparableString(value) {
    if (value == null) {
        return "";
    }

    return String(value).trim().toLowerCase();
}

function asNumericValue(value) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
}

function isValueFilled(value) {
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === "string") {
        return value.trim().length > 0;
    }

    return value !== null && value !== undefined;
}

function evaluateCondition(fieldValue, condition) {
    const normalizedValue = normalizeChecklistTextValue(fieldValue);
    const expectedValue = coerceConditionValues(condition.value);
    const secondValue = coerceConditionValues(condition.secondValue);

    switch (condition.operator) {
        case "equals":
            return asComparableString(normalizedValue) === asComparableString(expectedValue);
        case "notEquals":
            return asComparableString(normalizedValue) !== asComparableString(expectedValue);
        case "in": {
            const acceptedValues = ensureArray(expectedValue).map(asComparableString);

            if (Array.isArray(normalizedValue)) {
                return normalizedValue
                    .map(asComparableString)
                    .some(value => acceptedValues.includes(value));
            }

            return acceptedValues.includes(asComparableString(normalizedValue));
        }
        case "notIn": {
            const blockedValues = ensureArray(expectedValue).map(asComparableString);

            if (Array.isArray(normalizedValue)) {
                return normalizedValue
                    .map(asComparableString)
                    .every(value => !blockedValues.includes(value));
            }

            return !blockedValues.includes(asComparableString(normalizedValue));
        }
        case "checked":
            return normalizedValue === true;
        case "unchecked":
            return normalizedValue !== true;
        case "gt": {
            const actual = asNumericValue(normalizedValue);
            const expected = asNumericValue(expectedValue);
            return actual != null && expected != null && actual > expected;
        }
        case "gte": {
            const actual = asNumericValue(normalizedValue);
            const expected = asNumericValue(expectedValue);
            return actual != null && expected != null && actual >= expected;
        }
        case "lt": {
            const actual = asNumericValue(normalizedValue);
            const expected = asNumericValue(expectedValue);
            return actual != null && expected != null && actual < expected;
        }
        case "lte": {
            const actual = asNumericValue(normalizedValue);
            const expected = asNumericValue(expectedValue);
            return actual != null && expected != null && actual <= expected;
        }
        case "between": {
            const actual = asNumericValue(normalizedValue);
            const lowerBound = asNumericValue(expectedValue);
            const upperBound = asNumericValue(secondValue);
            return (
                actual != null &&
                lowerBound != null &&
                upperBound != null &&
                actual >= lowerBound &&
                actual <= upperBound
            );
        }
        case "contains":
            if (Array.isArray(normalizedValue)) {
                return normalizedValue
                    .map(asComparableString)
                    .includes(asComparableString(expectedValue));
            }

            return asComparableString(normalizedValue).includes(asComparableString(expectedValue));
        case "notEmpty":
            return isValueFilled(normalizedValue);
        default:
            return false;
    }
}

export function evaluateChecklistRules({ schemaJson, responses }) {
    const schema = checklistTemplateSchemaJsonSchema.parse(schemaJson);

    return schema.rules.reduce((issues, rule) => {
        const results = rule.conditions.map(condition =>
            evaluateCondition(responses?.[condition.fieldId], condition)
        );
        const matched = rule.combinator === "ALL" ? results.every(Boolean) : results.some(Boolean);

        if (!matched) {
            return issues;
        }

        issues.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            description: rule.description || null,
            categoryId: rule.categoryId || null,
            triggeredFieldIds: [...new Set(rule.conditions.map(condition => condition.fieldId))],
        });

        return issues;
    }, []);
}
