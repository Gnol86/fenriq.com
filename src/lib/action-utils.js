// src/lib/action-utils.js
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Helpers pour Server Actions avec gestion d'erreurs et revalidation
 */

/**
 * Wrapper pour Server Actions avec gestion d'erreurs
 */
export async function safeServerAction(action, redirectPath = null, revalidatePaths = []) {
    try {
        const result = await action();
        
        // Revalider les chemins spécifiés
        revalidatePaths.forEach(path => {
            revalidatePath(path);
        });
        
        // Rediriger si spécifié
        if (redirectPath) {
            redirect(redirectPath);
        }
        
        return { success: true, result };
    } catch (error) {
        console.error("Server Action Error:", error);
        
        // Pour les Server Actions, on peut soit:
        // 1. Lancer l'erreur pour qu'elle soit catchée par le composant parent
        // 2. Retourner un objet d'erreur
        // 3. Rediriger vers une page d'erreur
        
        throw error; // On laisse l'erreur remonter
    }
}

/**
 * Helper pour valider les données de formulaire
 */
export function validateFormData(formData, validations) {
    const errors = [];
    
    for (const [field, validation] of Object.entries(validations)) {
        const value = formData.get(field);
        
        if (validation.required && (!value || value.trim().length === 0)) {
            errors.push(`${validation.label || field} est requis`);
            continue;
        }
        
        if (value && validation.minLength && value.length < validation.minLength) {
            errors.push(`${validation.label || field} doit contenir au moins ${validation.minLength} caractères`);
        }
        
        if (value && validation.maxLength && value.length > validation.maxLength) {
            errors.push(`${validation.label || field} ne peut pas dépasser ${validation.maxLength} caractères`);
        }
        
        if (value && validation.pattern && !validation.pattern.test(value)) {
            errors.push(validation.patternMessage || `${validation.label || field} a un format invalide`);
        }
        
        if (value && validation.custom) {
            const customError = validation.custom(value);
            if (customError) {
                errors.push(customError);
            }
        }
    }
    
    if (errors.length > 0) {
        throw new Error(errors[0]); // Retourner la première erreur
    }
    
    return true;
}