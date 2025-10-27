import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function formatDate(date, locale) {
    if (!date) return "N/A";

    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) return "N/A";

    const formatter = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return formatter.format(dateObj);
}

// Fonction pour formater le prix
export function formatPrice(amount, currency, locale) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}
