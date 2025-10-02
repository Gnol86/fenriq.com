import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { defaultLocale } from "@lib/i18n/config";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getInitials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();
}

export function nameToSlug(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

const LOCALE_TO_REGION = {
    fr: "fr-FR",
    en: "en-US",
};

function resolveLocale(locale) {
    if (locale) {
        return LOCALE_TO_REGION[locale] ?? locale;
    }

    if (typeof navigator !== "undefined" && navigator.language) {
        return navigator.language;
    }

    if (typeof Intl !== "undefined") {
        const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
        if (resolved) return resolved;
    }

    return LOCALE_TO_REGION[defaultLocale] ?? defaultLocale;
}

export function formatDate(date, locale) {
    if (!date) return "N/A";

    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) return "N/A";

    const formatter = new Intl.DateTimeFormat(resolveLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return formatter.format(dateObj);
}
