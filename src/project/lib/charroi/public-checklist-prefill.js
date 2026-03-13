import { buildHistoricalChecklistTextEntriesByFieldId } from "./checklist-text-entry";
export const PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE = "charroi_public_submitter_name";
export const PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function createChecklistInitialResponses(schema) {
    return schema.sections.reduce((accumulator, section) => {
        for (const field of section.fields) {
            switch (field.type) {
                case "checkbox":
                    accumulator[field.id] = false;
                    break;
                case "multi_select":
                case "photo":
                case "text_list":
                    accumulator[field.id] = [];
                    break;
                default:
                    accumulator[field.id] = "";
            }
        }

        return accumulator;
    }, {});
}

function createFieldMap(schema) {
    return schema.sections.reduce((accumulator, section) => {
        for (const field of section.fields) {
            accumulator[field.id] = field;
        }

        return accumulator;
    }, {});
}

function groupHistoricalPhotosByFieldId({ fieldMap, historicalPhotos }) {
    return (historicalPhotos ?? []).reduce((accumulator, photo) => {
        const field = fieldMap[photo.fieldId];

        if (!field || field.type !== "photo") {
            return accumulator;
        }

        if (!accumulator[photo.fieldId]) {
            accumulator[photo.fieldId] = [];
        }

        accumulator[photo.fieldId].push(photo);
        return accumulator;
    }, {});
}

function coerceNumberValue(rawValue) {
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        return rawValue;
    }

    if (typeof rawValue === "string" && rawValue.trim() !== "") {
        const parsedValue = Number.parseFloat(rawValue);

        return Number.isNaN(parsedValue) ? "" : parsedValue;
    }

    return "";
}

export function buildPublicChecklistPrefill({
    schema,
    latestSubmission,
    historicalPhotos = [],
    historicalTextEntries = [],
}) {
    const fieldMap = createFieldMap(schema);
    const initialResponses = createChecklistInitialResponses(schema);
    const historicalPhotosByFieldId = groupHistoricalPhotosByFieldId({
        fieldMap,
        historicalPhotos,
    });
    const historicalTextEntriesByFieldId = buildHistoricalChecklistTextEntriesByFieldId({
        schema,
        textEntries: historicalTextEntries,
    });

    for (const field of Object.values(fieldMap)) {
        if (field.type === "text_list") {
            initialResponses[field.id] = (historicalTextEntriesByFieldId[field.id] ?? []).map(
                entry => entry.text
            );
        }
    }

    if (!latestSubmission) {
        return {
            initialResponses,
            historicalPhotosByFieldId,
            historicalTextEntriesByFieldId,
        };
    }

    for (const field of Object.values(fieldMap)) {
        const rawValue = latestSubmission.responseJson?.[field.id];

        switch (field.type) {
            case "text":
            case "textarea":
                initialResponses[field.id] = typeof rawValue === "string" ? rawValue.trim() : "";
                break;
            case "number":
                initialResponses[field.id] = coerceNumberValue(rawValue);
                break;
            case "single_select": {
                const acceptedValues = new Set(field.options.map(option => option.value));
                initialResponses[field.id] =
                    typeof rawValue === "string" && acceptedValues.has(rawValue) ? rawValue : "";
                break;
            }
            case "multi_select": {
                const acceptedValues = new Set(field.options.map(option => option.value));
                initialResponses[field.id] = Array.isArray(rawValue)
                    ? rawValue.filter(
                          value => typeof value === "string" && acceptedValues.has(value)
                      )
                    : [];
                break;
            }
            case "checkbox":
                initialResponses[field.id] = rawValue === true;
                break;
            case "photo":
                initialResponses[field.id] = [];
                break;
            case "text_list":
                initialResponses[field.id] = (historicalTextEntriesByFieldId[field.id] ?? []).map(
                    entry => entry.text
                );
                break;
            default:
                initialResponses[field.id] = "";
        }
    }

    return {
        initialResponses,
        historicalPhotosByFieldId,
        historicalTextEntriesByFieldId,
    };
}

export function getRememberedPublicChecklistSubmitterName(cookieStore) {
    const cookieValue = cookieStore.get(PUBLIC_CHECKLIST_SUBMITTER_NAME_COOKIE)?.value;

    return typeof cookieValue === "string" ? cookieValue.trim().slice(0, 120) : "";
}
