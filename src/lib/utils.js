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

export function normalizeText(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
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

/**
 * Calcule le prix total pour un tarif échelonné Stripe.
 * @param {Array} tiers - Tableau de paliers Stripe [{up_to, unit_amount, flat_amount}, ...]
 * @param {number} quantity - La quantité à facturer
 * @param {string} tiersMode - "graduated" ou "volume"
 * @returns {number} Prix total en centimes
 */
export function calculateTieredPrice(tiers, quantity, tiersMode) {
    if (!tiers?.length || quantity <= 0) return 0;

    if (tiersMode === "volume") {
        for (const tier of tiers) {
            if (tier.up_to === null || quantity <= tier.up_to) {
                return (tier.unit_amount ?? 0) * quantity + (tier.flat_amount ?? 0);
            }
        }
        const lastTier = tiers[tiers.length - 1];
        return (lastTier.unit_amount ?? 0) * quantity + (lastTier.flat_amount ?? 0);
    }

    // graduated : chaque palier est facturé séparément
    let total = 0;
    let remaining = quantity;
    let previousUpTo = 0;

    for (const tier of tiers) {
        if (remaining <= 0) break;

        const tierCapacity = tier.up_to === null ? remaining : tier.up_to - previousUpTo;
        const unitsInTier = Math.min(remaining, tierCapacity);

        total += (tier.unit_amount ?? 0) * unitsInTier + (tier.flat_amount ?? 0);

        remaining -= unitsInTier;
        previousUpTo = tier.up_to ?? previousUpTo + tierCapacity;
    }

    return total;
}
