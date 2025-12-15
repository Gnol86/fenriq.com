import { z } from "zod";

/**
 * Builds a Zod schema validator based on validation config
 * @param {Object} validation - Validation configuration object
 * @param {string} validation.type - Type of validation (string, number, email, boolean, array, enum)
 * @param {Object} [validation.min] - Min constraint {value, message}
 * @param {Object} [validation.max] - Max constraint {value, message}
 * @param {boolean} [validation.optional] - Whether field is optional
 * @param {boolean} [validation.trim] - Whether to trim string values
 * @param {Object} [validation.regex] - Regex constraint {pattern, message}
 * @param {Object} [validation.startsWith] - StartsWith constraint {value, message}
 * @param {Object} [validation.sameAs] - SameAs constraint {value: fieldName, message} - Applied at schema level
 * @param {any} [validation.default] - Default value
 * @param {Array} [validation.enumValues] - Enum values for enum type
 * @param {string} [validation.enumMessage] - Error message for enum validation
 * @param {Object} [validation.arrayItem] - Schema for array items (recursive validation)
 * @returns {z.ZodType} Zod schema
 */
function buildFieldValidator(validation) {
    if (!validation || !validation.type) {
        return z.string().optional();
    }

    let validator;

    // Base type
    switch (validation.type) {
        case "string":
            validator = z.string(validation.required);
            break;
        case "number":
            validator = z.number();
            break;
        case "email":
            validator = z
                .string(validation.required)
                .email(validation.emailMessage ?? "Email invalide");
            break;
        case "boolean":
            if (validation.required) {
                validator = z.boolean().refine(val => val === true, {
                    message: validation.required,
                });
            } else {
                validator = z.boolean();
            }

            break;
        case "array":
            // Si arrayItem est fourni, construire le schéma pour les items
            if (validation.arrayItem) {
                const itemValidator = buildFieldValidator(validation.arrayItem);
                validator = z.array(itemValidator);
            } else {
                validator = z.array(z.any());
            }
            break;
        case "enum":
            if (!validation.enumValues || validation.enumValues.length === 0) {
                throw new Error("enumValues is required for enum type");
            }
            validator = z.enum(validation.enumValues, {
                required_error: validation.enumMessage,
            });
            break;
        default:
            validator = z.string();
    }

    // Apply regex (only for strings)
    if (validation.regex && validation.type === "string") {
        validator = validator.regex(validation.regex.pattern, validation.regex.message);
    }

    // Apply startsWith (only for strings)
    if (validation.startsWith && validation.type === "string") {
        validator = validator.startsWith(
            validation.startsWith.value,
            validation.startsWith.message
        );
    }

    // Apply min/max constraints
    if (validation.min) {
        validator = validator.min(validation.min.value, validation.min.message);
    }

    if (validation.max) {
        validator = validator.max(validation.max.value, validation.max.message);
    }

    // Apply default value
    if (validation.default !== undefined) {
        validator = validator.default(validation.default);
    }

    // Apply trim (always for strings and emails)
    if (validation.type === "string" || validation.type === "email") {
        validator = validator.trim();
    }

    // Optional (doit être appliqué en dernier)
    if (!validation.required) {
        validator = validator.optional();
    }

    return validator;
}

/**
 * Builds a complete Zod schema from form descriptor
 * @param {Object} formDescriptor - Form descriptor object
 * @param {Array} formDescriptor.fields - Array of field definitions
 * @returns {z.ZodObject} Complete Zod schema
 */
export function buildZodSchema(formDescriptor) {
    const shape = {};
    const sameAsValidations = [];

    // Construire les validateurs de champs et collecter les validations sameAs
    formDescriptor.fields.forEach(field => {
        shape[field.name] = buildFieldValidator(field.validation);

        // Collecter les validations sameAs pour les appliquer au niveau du schéma
        if (field.validation?.sameAs) {
            sameAsValidations.push({
                field: field.name,
                targetField: field.validation.sameAs.value,
                message: field.validation.sameAs.message,
            });
        }
    });

    // Créer le schéma de base
    let schema = z.object(shape);

    // Appliquer les validations sameAs au niveau du schéma
    sameAsValidations.forEach(validation => {
        schema = schema.refine(data => data[validation.field] === data[validation.targetField], {
            message: validation.message,
            path: [validation.field],
        });
    });

    return schema;
}
