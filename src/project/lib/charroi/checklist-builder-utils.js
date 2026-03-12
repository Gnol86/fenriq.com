import { checklistTemplateSchemaJsonSchema } from "./template-schema";

export function getTemplateFormDefaults(template, fallbackSchema) {
    return {
        name: template?.name ?? "",
        description: template?.description ?? "",
        isActive: template?.isActive ?? true,
        sections: template?.schemaJson?.sections ?? fallbackSchema.sections,
        rules: template?.schemaJson?.rules ?? fallbackSchema.rules,
    };
}

export function buildSchemaFromValues(values) {
    return checklistTemplateSchemaJsonSchema.parse({
        sections: values.sections ?? [],
        rules: values.rules ?? [],
    });
}

export function serializeSchema(schema) {
    return JSON.stringify(schema, null, 2);
}

export function parseSchemaText(value) {
    const parsed = JSON.parse(value);
    return checklistTemplateSchemaJsonSchema.parse(parsed);
}

export function reorderItems(items, activeId, overId) {
    const oldIndex = items.findIndex(item => item.id === activeId);
    const newIndex = items.findIndex(item => item.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return items;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(oldIndex, 1);
    nextItems.splice(newIndex, 0, movedItem);

    return nextItems;
}

export function getFieldLocation(sections, fieldId) {
    for (const [sectionIndex, section] of sections.entries()) {
        const fieldIndex = section.fields.findIndex(field => field.id === fieldId);

        if (fieldIndex !== -1) {
            return {
                sectionIndex,
                fieldIndex,
            };
        }
    }

    return null;
}

export function getConditionLocation(rules, conditionId) {
    for (const [ruleIndex, rule] of rules.entries()) {
        const conditionIndex = rule.conditions.findIndex(condition => condition.id === conditionId);

        if (conditionIndex !== -1) {
            return {
                ruleIndex,
                conditionIndex,
            };
        }
    }

    return null;
}

export function getReferencedCategoryCount(schema) {
    return new Set(schema.rules.map(rule => rule.categoryId).filter(Boolean)).size;
}
