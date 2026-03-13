import {
    createChecklistField,
    createChecklistOption,
    createChecklistRule,
    createChecklistRuleCondition,
    createChecklistSection,
} from "@project/lib/charroi/checklist-builder-defaults";

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
    };

    return labels[type] ?? type;
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
