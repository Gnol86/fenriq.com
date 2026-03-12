import { randomBytes } from "node:crypto";

export function normalizeOptionalText(value) {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.trim();

    return normalized ? normalized : null;
}

export function normalizePlateNumber(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatVehicleLabel(vehicle) {
    const parts = [
        normalizeOptionalText(vehicle?.name),
        normalizeOptionalText(vehicle?.brand),
        normalizeOptionalText(vehicle?.model),
        normalizeOptionalText(vehicle?.plateNumber),
    ].filter(Boolean);

    return parts.join(" - ");
}

export function generatePublicToken() {
    return randomBytes(24).toString("hex");
}

export function ensureArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (value == null) {
        return [];
    }

    return [value];
}

export function buildChecklistPhotoStorageKey({ assignmentId, originalName }) {
    const timestamp = Date.now();
    const randomSuffix = randomBytes(6).toString("hex");
    const sanitizedName = String(originalName ?? "photo")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-80);

    return `charroi/checklists/${assignmentId}/${timestamp}-${randomSuffix}-${sanitizedName}`;
}

export function getS3HostUrl() {
    return `${process.env.AWS_S3_PROTOCOL}://${process.env.AWS_S3_HOSTNAME}/${process.env.AWS_S3_BUCKET}`;
}

export function buildChecklistPhotoUrl(storageKey) {
    return `${getS3HostUrl()}/${storageKey}`;
}

export function getSubmissionVehicleLabel(submission) {
    return [submission?.vehicleNameSnapshot, submission?.vehiclePlateNumberSnapshot]
        .filter(Boolean)
        .join(" - ");
}

export function getSubmissionPublicChecklistLabel(submission) {
    return [submission?.checklistNameSnapshot, getSubmissionVehicleLabel(submission)]
        .filter(Boolean)
        .join(" - ");
}

export function coerceConditionValues(rawValue) {
    if (Array.isArray(rawValue)) {
        return rawValue;
    }

    if (typeof rawValue !== "string") {
        return rawValue;
    }

    const trimmed = rawValue.trim();

    if (!trimmed) {
        return "";
    }

    if (trimmed.includes(",")) {
        return trimmed
            .split(",")
            .map(part => part.trim())
            .filter(Boolean);
    }

    return trimmed;
}

export function normalizeChecklistTextValue(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim();
}
