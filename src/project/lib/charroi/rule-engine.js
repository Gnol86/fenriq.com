import { checklistTemplateSchemaJsonSchema } from "./template-schema";
import { ensureArray, normalizeChecklistTextValue } from "./utils";

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

function getDefaultValueForField(field) {
    switch (field.type) {
        case "checkbox":
            return false;
        case "multi_select":
        case "photo":
        case "text_list":
            return [];
        case "number":
            return null;
        default:
            return "";
    }
}

function normalizeScalarFieldValue(field, value) {
    switch (field.type) {
        case "text":
        case "textarea":
            return normalizeChecklistTextValue(typeof value === "string" ? value : "");
        case "number":
            return asNumericValue(value);
        case "single_select":
            return typeof value === "string" ? value.trim() : "";
        case "checkbox":
            return value === true;
        default:
            return value;
    }
}

function normalizeArrayFieldValue(field, value) {
    const values = Array.isArray(value) ? value : [];

    if (field.type === "multi_select" || field.type === "photo") {
        return [...new Set(values.map(entry => asComparableString(entry)).filter(Boolean))].sort();
    }

    if (field.type === "text_list") {
        return values
            .map(entry => asComparableString(entry))
            .filter(Boolean)
            .sort();
    }

    return values;
}

function buildOccurrenceMap(values) {
    return values.reduce((accumulator, value) => {
        accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
        return accumulator;
    }, new Map());
}

function countAddedEntries(previousValues, currentValues) {
    const previousOccurrences = buildOccurrenceMap(previousValues);
    const currentOccurrences = buildOccurrenceMap(currentValues);
    let count = 0;

    for (const [value, occurrences] of currentOccurrences.entries()) {
        count += Math.max(occurrences - (previousOccurrences.get(value) ?? 0), 0);
    }

    return count;
}

function countRemovedEntries(previousValues, currentValues) {
    const previousOccurrences = buildOccurrenceMap(previousValues);
    const currentOccurrences = buildOccurrenceMap(currentValues);
    let count = 0;

    for (const [value, occurrences] of previousOccurrences.entries()) {
        count += Math.max(occurrences - (currentOccurrences.get(value) ?? 0), 0);
    }

    return count;
}

function areValuesEqual(field, previousValue, currentValue) {
    if (field.type === "multi_select" || field.type === "photo" || field.type === "text_list") {
        if (previousValue.length !== currentValue.length) {
            return false;
        }

        return previousValue.every((value, index) => value === currentValue[index]);
    }

    return previousValue === currentValue;
}

function createFieldState({ currentValue, field, previousValue }) {
    const normalizedPreviousValue =
        field.type === "multi_select" || field.type === "photo" || field.type === "text_list"
            ? normalizeArrayFieldValue(field, previousValue)
            : normalizeScalarFieldValue(field, previousValue);
    const normalizedCurrentValue =
        field.type === "multi_select" || field.type === "photo" || field.type === "text_list"
            ? normalizeArrayFieldValue(field, currentValue)
            : normalizeScalarFieldValue(field, currentValue);

    return {
        addedCount:
            field.type === "multi_select" || field.type === "photo" || field.type === "text_list"
                ? countAddedEntries(normalizedPreviousValue, normalizedCurrentValue)
                : 0,
        changed: !areValuesEqual(field, normalizedPreviousValue, normalizedCurrentValue),
        currentValue: normalizedCurrentValue,
        field,
        previousValue: normalizedPreviousValue,
        removedCount:
            field.type === "multi_select" || field.type === "photo" || field.type === "text_list"
                ? countRemovedEntries(normalizedPreviousValue, normalizedCurrentValue)
                : 0,
    };
}

function buildFieldMap(schema) {
    return schema.sections.reduce((accumulator, section) => {
        for (const field of section.fields) {
            accumulator.set(field.id, field);
        }

        return accumulator;
    }, new Map());
}

export function createChecklistRuleFieldStateMap({
    currentFieldValuesByFieldId = {},
    previousFieldValuesByFieldId = {},
    previousResponses = {},
    responses,
    schemaJson,
}) {
    const schema = checklistTemplateSchemaJsonSchema.parse(schemaJson);
    const fieldMap = buildFieldMap(schema);

    return [...fieldMap.values()].reduce((accumulator, field) => {
        const defaultValue = getDefaultValueForField(field);
        const hasPreviousFieldValue = Object.hasOwn(previousFieldValuesByFieldId, field.id);
        const hasCurrentFieldValue = Object.hasOwn(currentFieldValuesByFieldId, field.id);

        accumulator[field.id] = createFieldState({
            currentValue: hasCurrentFieldValue
                ? currentFieldValuesByFieldId[field.id]
                : (responses?.[field.id] ?? defaultValue),
            field,
            previousValue: hasPreviousFieldValue
                ? previousFieldValuesByFieldId[field.id]
                : (previousResponses?.[field.id] ?? defaultValue),
        });
        return accumulator;
    }, {});
}

function evaluateStateCondition(fieldState, condition) {
    const expectedValue = condition.value;
    const secondValue = condition.secondValue;

    switch (condition.operator) {
        case "isEmpty":
            return !isValueFilled(fieldState.currentValue);
        case "isNotEmpty":
        case "notEmpty":
            return isValueFilled(fieldState.currentValue);
        case "changed":
            return fieldState.changed;
        case "addedEntries":
            return fieldState.addedCount > 0;
        case "removedEntries":
            return fieldState.removedCount > 0;
        case "equals":
            if (fieldState.field.type === "number") {
                const currentValue = asNumericValue(fieldState.currentValue);
                const nextExpectedValue = asNumericValue(expectedValue);
                return (
                    currentValue != null &&
                    nextExpectedValue != null &&
                    currentValue === nextExpectedValue
                );
            }

            return (
                asComparableString(fieldState.currentValue) === asComparableString(expectedValue)
            );
        case "notEquals":
            if (fieldState.field.type === "number") {
                const currentValue = asNumericValue(fieldState.currentValue);
                const nextExpectedValue = asNumericValue(expectedValue);
                return (
                    currentValue != null &&
                    nextExpectedValue != null &&
                    currentValue !== nextExpectedValue
                );
            }

            return (
                asComparableString(fieldState.currentValue) !== asComparableString(expectedValue)
            );
        case "lt": {
            const currentValue = asNumericValue(fieldState.currentValue);
            const nextExpectedValue = asNumericValue(expectedValue);
            return (
                currentValue != null &&
                nextExpectedValue != null &&
                currentValue < nextExpectedValue
            );
        }
        case "gt": {
            const currentValue = asNumericValue(fieldState.currentValue);
            const nextExpectedValue = asNumericValue(expectedValue);
            return (
                currentValue != null &&
                nextExpectedValue != null &&
                currentValue > nextExpectedValue
            );
        }
        case "lte": {
            const currentValue = asNumericValue(fieldState.currentValue);
            const nextExpectedValue = asNumericValue(expectedValue);
            return (
                currentValue != null &&
                nextExpectedValue != null &&
                currentValue <= nextExpectedValue
            );
        }
        case "gte": {
            const currentValue = asNumericValue(fieldState.currentValue);
            const nextExpectedValue = asNumericValue(expectedValue);
            return (
                currentValue != null &&
                nextExpectedValue != null &&
                currentValue >= nextExpectedValue
            );
        }
        case "allSelected": {
            const selectedValues = new Set(fieldState.currentValue);
            return ensureArray(expectedValue)
                .map(asComparableString)
                .every(value => selectedValues.has(value));
        }
        case "noneSelected": {
            const selectedValues = new Set(fieldState.currentValue);
            return ensureArray(expectedValue)
                .map(asComparableString)
                .every(value => !selectedValues.has(value));
        }
        case "someSelected": {
            const selectedValues = new Set(fieldState.currentValue);
            return ensureArray(expectedValue)
                .map(asComparableString)
                .some(value => selectedValues.has(value));
        }
        case "notAllSelected": {
            const selectedValues = new Set(fieldState.currentValue);
            return ensureArray(expectedValue)
                .map(asComparableString)
                .some(value => !selectedValues.has(value));
        }
        case "isTrue":
        case "checked":
            return fieldState.currentValue === true;
        case "isFalse":
        case "unchecked":
            return fieldState.currentValue !== true;
        case "in": {
            const acceptedValues = ensureArray(expectedValue).map(asComparableString);
            const currentValues = Array.isArray(fieldState.currentValue)
                ? fieldState.currentValue
                : [fieldState.currentValue];

            return currentValues.some(value => acceptedValues.includes(asComparableString(value)));
        }
        case "notIn": {
            const blockedValues = ensureArray(expectedValue).map(asComparableString);
            const currentValues = Array.isArray(fieldState.currentValue)
                ? fieldState.currentValue
                : [fieldState.currentValue];

            return currentValues.every(value => !blockedValues.includes(asComparableString(value)));
        }
        case "between": {
            const currentValue = asNumericValue(fieldState.currentValue);
            const lowerBound = asNumericValue(expectedValue);
            const upperBound = asNumericValue(secondValue);
            return (
                currentValue != null &&
                lowerBound != null &&
                upperBound != null &&
                currentValue >= lowerBound &&
                currentValue <= upperBound
            );
        }
        case "contains":
            if (Array.isArray(fieldState.currentValue)) {
                return fieldState.currentValue.includes(asComparableString(expectedValue));
            }

            return asComparableString(fieldState.currentValue).includes(
                asComparableString(expectedValue)
            );
        default:
            return false;
    }
}

function evaluatePreviousCondition(fieldState, condition) {
    if (isExplicitDeltaOperator(condition.operator)) {
        return false;
    }

    return evaluateStateCondition(
        {
            ...fieldState,
            currentValue: fieldState.previousValue,
        },
        condition
    );
}

function isExplicitDeltaOperator(operator) {
    return ["changed", "addedEntries", "removedEntries"].includes(operator);
}

function evaluateCondition(fieldState, condition) {
    const matchesCurrent = evaluateStateCondition(fieldState, condition);
    const matchesPrevious = evaluatePreviousCondition(fieldState, condition);
    const shouldRepeat =
        condition.repeatOnTrueChange === true &&
        fieldState.changed &&
        matchesCurrent &&
        matchesPrevious;
    const deltaTriggered = isExplicitDeltaOperator(condition.operator)
        ? matchesCurrent
        : shouldRepeat;

    return {
        deltaTriggered,
        matchesCurrent,
        matchesPrevious,
    };
}

function combineResults(results, combinator, key) {
    return combinator === "ALL"
        ? results.every(result => result[key] === true)
        : results.some(result => result[key] === true);
}

export function evaluateChecklistRules({
    currentFieldValuesByFieldId = {},
    previousFieldValuesByFieldId = {},
    previousResponses = {},
    responses,
    schemaJson,
}) {
    const schema = checklistTemplateSchemaJsonSchema.parse(schemaJson);
    const fieldStatesById = createChecklistRuleFieldStateMap({
        currentFieldValuesByFieldId,
        previousFieldValuesByFieldId,
        previousResponses,
        responses,
        schemaJson: schema,
    });

    return schema.rules.reduce((issues, rule) => {
        const results = rule.conditions.map(condition =>
            evaluateCondition(fieldStatesById[condition.fieldId], condition)
        );
        const matchesCurrent = combineResults(results, rule.combinator, "matchesCurrent");

        if (!matchesCurrent) {
            return issues;
        }

        const matchesPrevious = combineResults(results, rule.combinator, "matchesPrevious");
        const notificationTriggered =
            !matchesPrevious || results.some(result => result.deltaTriggered === true);

        issues.push({
            description: rule.description || null,
            categoryId: rule.categoryId || null,
            notificationTriggered,
            ruleId: rule.id,
            ruleTitle: rule.title,
            triggeredFieldIds: [...new Set(rule.conditions.map(condition => condition.fieldId))],
        });

        return issues;
    }, []);
}
