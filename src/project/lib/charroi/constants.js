export const CHECKLIST_FIELD_TYPES = [
    "text",
    "textarea",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
    "photo",
    "text_list",
];

export const CHECKLIST_RULE_OPERATORS = [
    "equals",
    "notEquals",
    "in",
    "notIn",
    "checked",
    "unchecked",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "contains",
    "notEmpty",
];

export const CHECKLIST_RULE_COMBINATORS = ["ALL", "ANY"];
export const CHECKLIST_DELIVERY_MODES = ["IMMEDIATE", "DIGEST"];
export const CHECKLIST_NOTIFICATION_TYPES = ["IMMEDIATE", "DIGEST"];
export const CHECKLIST_UPLOAD_ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
];
export const CHECKLIST_MAX_UPLOAD_SIZE = 4.5 * 1024 * 1024;
export const CHARROI_PAGE_SIZE = 10;
