import { CHECKLIST_FIELD_TYPES, CHECKLIST_RULE_OPERATORS } from "./constants";

function createId(prefix) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createChecklistOption(overrides = {}) {
    const id = createId("option");

    return {
        id,
        label: overrides.label ?? "Nouvelle option",
        value: overrides.value ?? id,
        ...overrides,
    };
}

export function createChecklistField(type = "text", overrides = {}) {
    const safeType = CHECKLIST_FIELD_TYPES.includes(type) ? type : "text";
    const baseId = createId("field");
    const baseField = {
        id: baseId,
        type: safeType,
        label: "Nouveau champ",
        description: "",
        placeholder: "",
        required: false,
        options: [],
    };

    if (safeType === "number") {
        baseField.label = "Numérique";
        baseField.placeholder = "0";
    }

    if (safeType === "single_select" || safeType === "multi_select") {
        baseField.label = safeType === "single_select" ? "Choix simple" : "Choix multiple";
        baseField.options = [createChecklistOption()];
    }

    if (safeType === "checkbox") {
        baseField.label = "Case à cocher";
    }

    if (safeType === "photo") {
        baseField.label = "Photos";
    }

    return {
        ...baseField,
        ...overrides,
    };
}

export function createChecklistSection(overrides = {}) {
    return {
        id: createId("section"),
        title: "Nouvelle section",
        description: "",
        fields: [createChecklistField("text")],
        ...overrides,
    };
}

export function createChecklistRuleCondition(overrides = {}) {
    return {
        id: createId("condition"),
        fieldId: "",
        operator: CHECKLIST_RULE_OPERATORS[0],
        value: "",
        secondValue: "",
        ...overrides,
    };
}

export function createChecklistRule(overrides = {}) {
    return {
        id: createId("rule"),
        title: "Nouvelle règle",
        description: "",
        categoryId: null,
        combinator: "ALL",
        conditions: [createChecklistRuleCondition()],
        ...overrides,
    };
}

export const FIELD_PRESETS = [
    {
        id: "text",
        label: "Texte",
        description: "Champ texte simple",
        factory: () => createChecklistField("text", { label: "Texte" }),
    },
    {
        id: "textarea",
        label: "Commentaire",
        description: "Zone de texte longue",
        factory: () =>
            createChecklistField("textarea", {
                label: "Commentaire",
                description: "Ajoutez des précisions si nécessaire",
            }),
    },
    {
        id: "number",
        label: "Numérique",
        description: "Champ numérique",
        factory: () =>
            createChecklistField("number", {
                label: "Numérique",
                placeholder: "0",
                required: true,
            }),
    },
    {
        id: "single_select",
        label: "Choix simple",
        description: "Une seule option possible",
        factory: () =>
            createChecklistField("single_select", {
                label: "Niveau de carburant",
                required: true,
                options: [
                    createChecklistOption({ label: "Plein", value: "full" }),
                    createChecklistOption({ label: "Bas", value: "low" }),
                ],
            }),
    },
    {
        id: "multi_select",
        label: "Choix multiple",
        description: "Plusieurs options possibles",
        factory: () =>
            createChecklistField("multi_select", {
                label: "Équipements présents",
                options: [
                    createChecklistOption({ label: "Gilet", value: "vest" }),
                    createChecklistOption({ label: "Triangle", value: "triangle" }),
                ],
            }),
    },
    {
        id: "checkbox",
        label: "Validation",
        description: "Oui / non",
        factory: () =>
            createChecklistField("checkbox", {
                label: "Véhicule propre",
            }),
    },
    {
        id: "photo",
        label: "Photos dégâts",
        description: "Téléversement image",
        factory: () =>
            createChecklistField("photo", {
                label: "Photos des dégâts",
                description: "Ajoutez les photos utiles",
            }),
    },
];

export const DEFAULT_TEMPLATE_SCHEMA = {
    sections: [
        createChecklistSection({
            id: "general",
            title: "État général",
            fields: [
                createChecklistField("number", {
                    id: "odometer",
                    label: "Kilométrage",
                    placeholder: "120500",
                    required: true,
                }),
                createChecklistField("single_select", {
                    id: "fuel-level",
                    label: "Niveau de carburant",
                    required: true,
                    options: [
                        createChecklistOption({
                            id: "fuel-full",
                            label: "Plein",
                            value: "full",
                        }),
                        createChecklistOption({
                            id: "fuel-low",
                            label: "Bas",
                            value: "low",
                        }),
                    ],
                }),
                createChecklistField("photo", {
                    id: "damage-photos",
                    label: "Photos des dégâts",
                }),
            ],
        }),
    ],
    rules: [
        createChecklistRule({
            id: "fuel-alert",
            title: "Carburant insuffisant",
            description: "Avertit l'équipe logistique si le niveau n'est pas plein",
            conditions: [
                createChecklistRuleCondition({
                    id: "fuel-alert-condition",
                    fieldId: "fuel-level",
                    operator: "equals",
                    value: "low",
                }),
            ],
        }),
    ],
};
