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
    title: "Boilerplate", // ← TODO: Change to your project name
    description: "Boilerplate from Arnaud", // ← TODO: Change to your project description
    prodUrl: "https://omka.cloud", // ← TODO: Change to your production URL
    appId: "boilerplate", // ← TODO: Change to your app identifier (lowercase, no spaces)
    appIcon: "/images/logo.png", // ← TODO: Update with your logo path
    timeZone: "Europe/Brussels",

    // ========== TEAM INFORMATION ==========
    team: {
        name: "Arnaud Marchot", // ← TODO: Change to your team/contact name
    },

    // ========== EMAIL CONFIGURATION ==========
    mail: {
        from: "Boilerplate <noreply@example.com>", // ← TODO: Change sender email
        signature: "L'équipe Boilerplate", // ← TODO: Change email signature
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
};
