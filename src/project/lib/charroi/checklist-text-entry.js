export const CHECKLIST_TEXT_ENTRY_PUBLIC_SELECT = {
    id: true,
    fieldId: true,
    text: true,
    createdAt: true,
};

export function getChecklistTextListFieldIds(schema) {
    return schema.sections.flatMap(section =>
        section.fields.filter(field => field.type === "text_list").map(field => field.id)
    );
}

export function sanitizeChecklistTextEntryValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

function resolveDraftTextEntryValue(entry) {
    if (typeof entry === "string") {
        return entry;
    }

    if (entry && typeof entry.text === "string") {
        return entry.text;
    }

    return "";
}

export function sanitizeChecklistTextEntryArray(entries) {
    if (!Array.isArray(entries)) {
        return [];
    }

    return entries
        .map(resolveDraftTextEntryValue)
        .map(sanitizeChecklistTextEntryValue)
        .filter(Boolean);
}

export function buildHistoricalChecklistTextEntriesByFieldId({ schema, textEntries }) {
    const allowedFieldIds = new Set(getChecklistTextListFieldIds(schema));

    return (textEntries ?? []).reduce((accumulator, entry) => {
        if (!allowedFieldIds.has(entry.fieldId)) {
            return accumulator;
        }

        if (!accumulator[entry.fieldId]) {
            accumulator[entry.fieldId] = [];
        }

        accumulator[entry.fieldId].push(entry);
        return accumulator;
    }, {});
}

export function buildChecklistTextListResponseValue({
    historicalTextEntries = [],
    removedHistoricalTextEntryIds = [],
    draftTextEntries = [],
}) {
    const removedHistoricalTextEntryIdSet = new Set(removedHistoricalTextEntryIds);
    const keptHistoricalTexts = historicalTextEntries
        .filter(entry => !removedHistoricalTextEntryIdSet.has(entry.id))
        .map(entry => sanitizeChecklistTextEntryValue(entry.text))
        .filter(Boolean);

    return [...keptHistoricalTexts, ...sanitizeChecklistTextEntryArray(draftTextEntries)];
}

export function normalizeDraftTextEntriesByFieldId({ draftTextEntriesByFieldId, fieldMap }) {
    return Object.entries(draftTextEntriesByFieldId ?? {}).reduce(
        (accumulator, [fieldId, draftEntries]) => {
            const field = fieldMap.get(fieldId);

            if (field?.type !== "text_list") {
                throw new Error("Une liste de texte est invalide");
            }

            accumulator[fieldId] = sanitizeChecklistTextEntryArray(draftEntries);
            return accumulator;
        },
        {}
    );
}
