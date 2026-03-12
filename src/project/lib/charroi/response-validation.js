import { checklistTemplateSchemaJsonSchema } from "./template-schema";

function buildFieldMap(schemaJson) {
    const schema = checklistTemplateSchemaJsonSchema.parse(schemaJson);
    const fieldMap = new Map();

    for (const section of schema.sections) {
        for (const field of section.fields) {
            fieldMap.set(field.id, field);
        }
    }

    return fieldMap;
}

function ensureRequiredField(field, value) {
    if (!field.required) {
        return;
    }

    const isMissing =
        value == null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        value === false;

    if (isMissing) {
        throw new Error(`Le champ "${field.label}" est requis`);
    }
}

export function validateChecklistResponses({ schemaJson, responses }) {
    const fieldMap = buildFieldMap(schemaJson);
    const sanitizedResponses = {};

    for (const [fieldId, field] of fieldMap.entries()) {
        const rawValue = responses?.[fieldId];

        switch (field.type) {
            case "text":
            case "textarea": {
                const value = typeof rawValue === "string" ? rawValue.trim() : "";
                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            case "number": {
                const value =
                    rawValue === "" || rawValue == null
                        ? null
                        : Number.parseFloat(String(rawValue));

                if (value != null && Number.isNaN(value)) {
                    throw new Error(`Le champ "${field.label}" doit être numérique`);
                }

                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            case "single_select": {
                const value = typeof rawValue === "string" ? rawValue : "";
                const acceptedValues = field.options.map(option => option.value);

                if (value && !acceptedValues.includes(value)) {
                    throw new Error(`La valeur choisie pour "${field.label}" est invalide`);
                }

                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            case "multi_select": {
                const value = Array.isArray(rawValue)
                    ? rawValue.filter(entry => typeof entry === "string")
                    : [];
                const acceptedValues = new Set(field.options.map(option => option.value));

                if (value.some(entry => !acceptedValues.has(entry))) {
                    throw new Error(`Une valeur de "${field.label}" est invalide`);
                }

                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            case "checkbox": {
                const value = rawValue === true;
                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            case "photo": {
                const value = Array.isArray(rawValue)
                    ? rawValue.filter(entry => typeof entry === "string")
                    : [];
                ensureRequiredField(field, value);
                sanitizedResponses[fieldId] = value;
                break;
            }
            default:
                sanitizedResponses[fieldId] = rawValue;
        }
    }

    return {
        fieldMap,
        sanitizedResponses,
    };
}
