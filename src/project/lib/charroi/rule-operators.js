import { ensureArray } from "./utils";

export const CHECKLIST_RULE_VALUE_INPUT_TYPES = [
    "none",
    "number",
    "single_select",
    "multi_select",
    "text",
];

const MODERN_OPERATOR_DEFINITIONS = {
    isEmpty: {
        fieldTypes: ["text", "textarea", "number", "photo", "text_list"],
        label: "Est vide",
        labelKey: "condition_operator_is_empty",
        supportsRepeatOnTrueChange: true,
        valueInput: "none",
        valueRequired: false,
    },
    isNotEmpty: {
        fieldTypes: ["text", "textarea", "number", "photo", "text_list"],
        label: "N'est pas vide",
        labelKey: "condition_operator_is_not_empty",
        supportsRepeatOnTrueChange: true,
        valueInput: "none",
        valueRequired: false,
    },
    changed: {
        fieldTypes: [
            "text",
            "textarea",
            "number",
            "single_select",
            "multi_select",
            "checkbox",
            "photo",
            "text_list",
        ],
        kind: "delta",
        label: "Tous changements",
        labelKey: "condition_operator_changed",
        supportsRepeatOnTrueChange: false,
        valueInput: "none",
        valueRequired: false,
    },
    equals: {
        fieldTypes: ["number", "single_select"],
        label: "Égale à",
        labelKey: "condition_operator_equals",
        supportsRepeatOnTrueChange: true,
        valueInput: "single_select",
        valueRequired: true,
    },
    notEquals: {
        fieldTypes: ["number", "single_select"],
        label: "Pas égale à",
        labelKey: "condition_operator_not_equals",
        supportsRepeatOnTrueChange: true,
        valueInput: "single_select",
        valueRequired: true,
    },
    lt: {
        fieldTypes: ["number"],
        label: "Plus petit que",
        labelKey: "condition_operator_lt",
        supportsRepeatOnTrueChange: true,
        valueInput: "number",
        valueRequired: true,
    },
    gt: {
        fieldTypes: ["number"],
        label: "Plus grand que",
        labelKey: "condition_operator_gt",
        supportsRepeatOnTrueChange: true,
        valueInput: "number",
        valueRequired: true,
    },
    lte: {
        fieldTypes: ["number"],
        label: "Plus petit ou égale à",
        labelKey: "condition_operator_lte",
        supportsRepeatOnTrueChange: true,
        valueInput: "number",
        valueRequired: true,
    },
    gte: {
        fieldTypes: ["number"],
        label: "Plus grand ou égale à",
        labelKey: "condition_operator_gte",
        supportsRepeatOnTrueChange: true,
        valueInput: "number",
        valueRequired: true,
    },
    allSelected: {
        fieldTypes: ["multi_select"],
        label: "Si tout sélectionné",
        labelKey: "condition_operator_all_selected",
        supportsRepeatOnTrueChange: true,
        valueInput: "multi_select",
        valueRequired: true,
    },
    noneSelected: {
        fieldTypes: ["multi_select"],
        label: "Si rien sélectionné",
        labelKey: "condition_operator_none_selected",
        supportsRepeatOnTrueChange: true,
        valueInput: "multi_select",
        valueRequired: true,
    },
    someSelected: {
        fieldTypes: ["multi_select"],
        label: "Si au moins un sélectionné",
        labelKey: "condition_operator_some_selected",
        supportsRepeatOnTrueChange: true,
        valueInput: "multi_select",
        valueRequired: true,
    },
    notAllSelected: {
        fieldTypes: ["multi_select"],
        label: "Si tout n'est pas sélectionné",
        labelKey: "condition_operator_not_all_selected",
        supportsRepeatOnTrueChange: true,
        valueInput: "multi_select",
        valueRequired: true,
    },
    isTrue: {
        fieldTypes: ["checkbox"],
        label: "Si vrai",
        labelKey: "condition_operator_is_true",
        supportsRepeatOnTrueChange: true,
        valueInput: "none",
        valueRequired: false,
    },
    isFalse: {
        fieldTypes: ["checkbox"],
        label: "Si faux",
        labelKey: "condition_operator_is_false",
        supportsRepeatOnTrueChange: true,
        valueInput: "none",
        valueRequired: false,
    },
    addedEntries: {
        fieldTypes: ["photo", "text_list"],
        kind: "delta",
        label: "Si nouvelle(s) entrée(s)",
        labelKey: "condition_operator_added_entries",
        supportsRepeatOnTrueChange: false,
        valueInput: "none",
        valueRequired: false,
    },
    removedEntries: {
        fieldTypes: ["photo", "text_list"],
        kind: "delta",
        label: "Si entrée(s) supprimée(s)",
        labelKey: "condition_operator_removed_entries",
        supportsRepeatOnTrueChange: false,
        valueInput: "none",
        valueRequired: false,
    },
};

const LEGACY_OPERATOR_DEFINITIONS = {
    in: {
        fieldTypes: ["single_select", "multi_select"],
        isLegacy: true,
        label: "Dans (legacy)",
        labelKey: "condition_operator_legacy_in",
        valueInput: "multi_select",
        valueRequired: true,
    },
    notIn: {
        fieldTypes: ["single_select", "multi_select"],
        isLegacy: true,
        label: "Pas dans (legacy)",
        labelKey: "condition_operator_legacy_not_in",
        valueInput: "multi_select",
        valueRequired: true,
    },
    checked: {
        fieldTypes: ["checkbox"],
        isLegacy: true,
        label: "Coché (legacy)",
        labelKey: "condition_operator_legacy_checked",
        valueInput: "none",
        valueRequired: false,
    },
    unchecked: {
        fieldTypes: ["checkbox"],
        isLegacy: true,
        label: "Décoché (legacy)",
        labelKey: "condition_operator_legacy_unchecked",
        valueInput: "none",
        valueRequired: false,
    },
    between: {
        fieldTypes: ["number"],
        isLegacy: true,
        label: "Entre (legacy)",
        labelKey: "condition_operator_legacy_between",
        valueInput: "number",
        valueRequired: true,
        secondValueRequired: true,
    },
    contains: {
        fieldTypes: ["text", "textarea", "multi_select", "text_list"],
        isLegacy: true,
        label: "Contient (legacy)",
        labelKey: "condition_operator_legacy_contains",
        valueInput: "text",
        valueRequired: true,
    },
    notEmpty: {
        fieldTypes: ["text", "textarea", "number", "photo", "text_list"],
        isLegacy: true,
        label: "Non vide (legacy)",
        labelKey: "condition_operator_legacy_not_empty",
        valueInput: "none",
        valueRequired: false,
    },
};

export const CHECKLIST_RULE_OPERATOR_DEFINITIONS = {
    ...MODERN_OPERATOR_DEFINITIONS,
    ...LEGACY_OPERATOR_DEFINITIONS,
};

export const CHECKLIST_RULE_OPERATORS = Object.keys(CHECKLIST_RULE_OPERATOR_DEFINITIONS);

function normalizeStringValue(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function normalizeStringArray(value) {
    return [...new Set(ensureArray(value).map(normalizeStringValue).filter(Boolean))];
}

function normalizeScalarValue(value) {
    if (typeof value === "number") {
        return value;
    }

    return normalizeStringValue(value);
}

export function getChecklistRuleOperatorDefinition(operator) {
    return CHECKLIST_RULE_OPERATOR_DEFINITIONS[operator] ?? null;
}

export function isChecklistRuleLegacyOperator(operator) {
    return getChecklistRuleOperatorDefinition(operator)?.isLegacy === true;
}

export function getChecklistRuleOperatorsForFieldType(fieldType, { includeLegacy = false } = {}) {
    return Object.entries(CHECKLIST_RULE_OPERATOR_DEFINITIONS)
        .filter(([, definition]) => {
            if (!definition.fieldTypes.includes(fieldType)) {
                return false;
            }

            if (includeLegacy) {
                return true;
            }

            return definition.isLegacy !== true;
        })
        .map(([operator]) => operator);
}

export function getDefaultChecklistRuleOperator(fieldType) {
    return getChecklistRuleOperatorsForFieldType(fieldType)[0] ?? "isEmpty";
}

export function isChecklistRuleOperatorCompatibleWithFieldType({ fieldType, operator }) {
    return Boolean(getChecklistRuleOperatorDefinition(operator)?.fieldTypes.includes(fieldType));
}

export function getChecklistRuleConditionValueInput(operator, fieldType) {
    const definition = getChecklistRuleOperatorDefinition(operator);

    if (!definition) {
        return "none";
    }

    if (["equals", "notEquals"].includes(operator) && fieldType === "number") {
        return "number";
    }

    return definition.valueInput ?? "none";
}

export function normalizeChecklistRuleConditionValue({ operator, value, fieldType }) {
    switch (getChecklistRuleConditionValueInput(operator, fieldType)) {
        case "number":
            return normalizeScalarValue(value);
        case "single_select":
            return normalizeScalarValue(Array.isArray(value) ? value[0] : value);
        case "multi_select":
            return normalizeStringArray(value);
        case "text":
            return normalizeStringValue(Array.isArray(value) ? value[0] : value);
        default:
            return "";
    }
}

export function normalizeChecklistRuleConditionSecondValue({ operator, secondValue }) {
    if (operator !== "between") {
        return "";
    }

    return normalizeScalarValue(secondValue);
}

export function validateChecklistRuleConditionShape({ condition, field }) {
    const definition = getChecklistRuleOperatorDefinition(condition.operator);

    if (!definition) {
        return {
            isValid: false,
            message: "L'opérateur est invalide.",
        };
    }

    if (!definition.fieldTypes.includes(field.type)) {
        return {
            isValid: false,
            message: "L'opérateur n'est pas compatible avec ce type de champ.",
        };
    }

    const valueInput = getChecklistRuleConditionValueInput(condition.operator, field.type);
    const normalizedValue = normalizeChecklistRuleConditionValue({
        operator: condition.operator,
        value: condition.value,
        fieldType: field.type,
    });
    const normalizedSecondValue = normalizeChecklistRuleConditionSecondValue({
        operator: condition.operator,
        secondValue: condition.secondValue,
    });

    if (definition.valueRequired) {
        if (
            ["allSelected", "noneSelected", "someSelected", "notAllSelected"].includes(
                condition.operator
            ) &&
            !Array.isArray(condition.value)
        ) {
            return {
                isValid: false,
                message: "Cette condition attend une liste de valeurs.",
            };
        }

        if (valueInput === "multi_select" && normalizedValue.length === 0) {
            return {
                isValid: false,
                message: "Au moins une valeur est requise pour cette condition.",
            };
        }

        if (
            ["number", "single_select", "text"].includes(valueInput) &&
            normalizeStringValue(String(normalizedValue ?? "")) === ""
        ) {
            return {
                isValid: false,
                message: "Une valeur est requise pour cette condition.",
            };
        }
    }

    if (
        condition.operator === "between" &&
        normalizeStringValue(String(normalizedSecondValue)) === ""
    ) {
        return {
            isValid: false,
            message: "Une seconde valeur est requise pour cette condition.",
        };
    }

    if (valueInput === "number") {
        const normalizedNumbers = [normalizedValue];

        if (condition.operator === "between") {
            normalizedNumbers.push(normalizedSecondValue);
        }

        const hasInvalidNumber = normalizedNumbers.some(entry => {
            if (normalizeStringValue(String(entry)) === "") {
                return false;
            }

            const parsed = Number.parseFloat(String(entry));
            return Number.isNaN(parsed);
        });

        if (hasInvalidNumber) {
            return {
                isValid: false,
                message: "La valeur de cette condition doit être numérique.",
            };
        }
    }

    if (valueInput === "single_select" && field.type === "single_select") {
        const optionValues = new Set(field.options.map(option => option.value));

        if (!optionValues.has(normalizedValue)) {
            return {
                isValid: false,
                message: "La valeur choisie pour cette condition est invalide.",
            };
        }
    }

    if (valueInput === "multi_select") {
        const optionValues = new Set(field.options.map(option => option.value));
        const values = Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue];

        if (values.some(entry => !optionValues.has(entry))) {
            return {
                isValid: false,
                message: "Une valeur choisie pour cette condition est invalide.",
            };
        }
    }

    return {
        isValid: true,
    };
}
