// Helper pour construire les traductions Better-Auth à partir des fichiers JSON next-intl
import frMessages from "./fr.json";
import enMessages from "./en.json";
import nlMessages from "./nl.json";
import deMessages from "./de.json";

/**
 * Construit l'objet de traductions au format attendu par better-auth-localization
 * à partir des fichiers JSON next-intl
 *
 * @returns {Object} Objet de traductions au format { "fr-FR": {...}, "en-US": {...}, etc. }
 */
export function getBetterAuthTranslations() {
    return {
        "fr-FR": frMessages.better_auth,
        "en-US": enMessages.better_auth,
        "nl-NL": nlMessages.better_auth,
        "de-DE": deMessages.better_auth,
    };
}
