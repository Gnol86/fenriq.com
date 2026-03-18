/**
 * ============================================================
 * 🚨 PROJECT CONFIGURATION - CUSTOMIZE FOR YOUR PROJECT
 * ============================================================
 *
 * This file is PROTECTED and will NOT be overwritten when you
 * update from the boilerplate upstream.
 *
 * ⚠️ IMPORTANT: You MUST customize ALL values below for your project!
 *
 * This configuration is used throughout the application:
 * - Site metadata (title, description)
 * - Email templates and sender information
 * - Organization settings and limits
 * - Billing configuration
 *
 * See: .github/SETUP_NEW_PROJECT.md for detailed instructions
 * ============================================================
 */

export const SiteConfig = {
    // ========== SITE INFORMATION ==========
    title: "Fleecheck", // ← TODO: Change to your project name
    description: "Prennez soin de votre charroi avec Fleecheck.com", // ← TODO: Change to your project description
    prodUrl: "https://fleecheck.com", // ← TODO: Change to your production URL
    appId: "Fleecheck", // ← TODO: Change to your app identifier (lowercase, no spaces)
    appIcon: "/images/logo.png", // ← TODO: Update with your logo path
    timeZone: "Europe/Brussels",

    // ========== TEAM INFORMATION ==========
    team: {
        name: "Arnaud Marchot", // ← TODO: Change to your team/contact name
    },

    // ========== EMAIL CONFIGURATION ==========
    mail: {
        from: process.env.EMAIL_FROM, // ← Override with EMAIL_FROM env var
        signature: "L'équipe Fleecheck", // ← TODO: Change email signature
    },

    // ========== BRAND STYLING ==========
    brand: {
        primary: "#000000", // ← TODO: Change to your primary brand color
    },

    // ========== ORGANIZATION SETTINGS ==========
    options: {
        organization: {
            allowUserToCreateOrganization: true, // Allow users to create orgs?
            organizationLimit: 5, // Max orgs per user
            membershipLimit: 9999, // Max members per organization
            invitationLimit: 9999, // Max pending invitations per org
            invitationExpiresIn: 60 * 60 * 24 * 30, // Invitation expiry (30 days)
        },
    },

    // ========== QUOTA CONFIGURATION ==========
    quota: {
        enabled: true, // Set to true to enable quantity-based billing
        minimum: 10, // Minimum quantity per subscription
        step: 1, // Quantity increment step (1 = any number, 5 = multiples of 5)
        inactiveLimit: 1, // Limit used when an organization has no active subscription
    },
};
