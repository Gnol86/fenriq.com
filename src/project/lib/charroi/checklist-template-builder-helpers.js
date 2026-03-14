import {
    createChecklistField,
    createChecklistOption,
    createChecklistRule,
    createChecklistRuleCondition,
    createChecklistSection,
} from "@project/lib/charroi/checklist-builder-defaults";
import {
    getChecklistRuleConditionValueInput,
    getChecklistRuleOperatorsForFieldType,
    isChecklistRuleOperatorCompatibleWithFieldType,
    normalizeChecklistRuleConditionSecondValue,
    normalizeChecklistRuleConditionValue,
} from "@project/lib/charroi/rule-operators";

export function duplicateField(field) {
    return {
        ...field,
        id: createChecklistField(field.type).id,
        photoCommentRequired: field.photoCommentRequired === true,
        options: field.options.map(option => ({
            ...option,
            id: createChecklistOption().id,
        })),
    };
}

export function duplicateSection(section) {
    return {
        ...section,
        id: createChecklistSection().id,
        fields: section.fields.map(duplicateField),
    };
}

export function duplicateRule(rule) {
    return {
        ...rule,
        id: createChecklistRule().id,
        conditions: rule.conditions.map(condition => ({
            ...condition,
            id: createChecklistRuleCondition().id,
        })),
    };
}

export function getFieldTypeLabel(type) {
    const labels = {
        text: "Texte",
        textarea: "Texte long",
        number: "Numérique",
        single_select: "Choix simple",
        multi_select: "Choix multiple",
        checkbox: "Case à cocher",
        photo: "Photo",
        text_list: "Liste de texte",
    };

    return labels[type] ?? type;
}

export function buildChecklistBuilderFieldOptions(schema) {
    return schema.sections.flatMap(section =>
        section.fields.map(field => ({
            id: field.id,
            label: field.label,
            options: field.options ?? [],
            sectionId: section.id,
            sectionTitle: section.title,
            type: field.type,
        }))
    );
}

export function getChecklistBuilderFieldOption(fieldOptions, fieldId) {
    return fieldOptions.find(option => option.id === fieldId) ?? null;
}

export function normalizeRuleConditionForField({ condition, fieldOption }) {
    if (!fieldOption) {
        return {
            ...condition,
            repeatOnTrueChange: condition.repeatOnTrueChange === true,
        };
    }

    const availableOperators = getChecklistRuleOperatorsForFieldType(fieldOption.type);
    const nextOperator = isChecklistRuleOperatorCompatibleWithFieldType({
        fieldType: fieldOption.type,
        operator: condition.operator,
    })
        ? condition.operator
        : (availableOperators[0] ?? createChecklistRuleCondition().operator);
    const shouldPreserveRepeatOnTrueChange = nextOperator === condition.operator;
    const valueInput = getChecklistRuleConditionValueInput(nextOperator, fieldOption.type);
    const normalizedValue = normalizeChecklistRuleConditionValue({
        operator: nextOperator,
        value:
            valueInput === "multi_select"
                ? condition.value
                : Array.isArray(condition.value)
                  ? condition.value[0]
                  : condition.value,
        fieldType: fieldOption.type,
    });
    const optionValues = new Set((fieldOption.options ?? []).map(option => option.value));

    return {
        ...condition,
        fieldId: fieldOption.id,
        operator: nextOperator,
        repeatOnTrueChange:
            shouldPreserveRepeatOnTrueChange && condition.repeatOnTrueChange === true,
        secondValue: normalizeChecklistRuleConditionSecondValue({
            operator: nextOperator,
            secondValue: condition.secondValue,
        }),
        value:
            valueInput === "single_select" && fieldOption.type === "single_select"
                ? optionValues.has(normalizedValue)
                    ? normalizedValue
                    : ""
                : valueInput === "multi_select"
                  ? normalizedValue.filter(value => optionValues.has(value))
                  : normalizedValue,
    };
}

export function normalizeRuleConditionForOperator({ condition, fieldOption, operator }) {
    return {
        ...condition,
        operator,
        repeatOnTrueChange: false,
        secondValue: normalizeChecklistRuleConditionSecondValue({
            operator,
            secondValue: "",
        }),
        value: normalizeChecklistRuleConditionValue({
            operator,
            value: "",
            fieldType: fieldOption?.type ?? "text",
        }),
    };
}

export function sanitizeRulesForFieldOptions({ fieldOptions, rules }) {
    return rules.map(rule => ({
        ...rule,
        conditions: rule.conditions.map(condition =>
            normalizeRuleConditionForField({
                condition,
                fieldOption: getChecklistBuilderFieldOption(fieldOptions, condition.fieldId),
            })
        ),
    }));
}

export function normalizeFieldForType(field, nextType) {
    const baseField = {
        ...field,
        type: nextType,
        photoCommentRequired: nextType === "photo" ? field.photoCommentRequired === true : false,
    };

    if (nextType === "single_select" || nextType === "multi_select") {
        return {
            ...baseField,
            options: field.options.length > 0 ? field.options : [createChecklistOption()],
        };
    }

    return {
        ...baseField,
        options: [],
    };
}
