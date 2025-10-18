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
    title: "PolGPT", // ← TODO: Change to your project name
    description: "Editeur booster par l'IA", // ← TODO: Change to your project description
    prodUrl: "https://polgpt.be", // ← TODO: Change to your production URL
    appId: "polgpt", // ← TODO: Change to your app identifier (lowercase, no spaces)
    domain: "polgpt.be", // ← TODO: Change to your domain
    appIcon: "/images/logo.png", // ← TODO: Update with your logo path

    // ========== COMPANY INFORMATION ==========
    company: {
        name: "PolGPT", // ← TODO: Change to your company name
    },

    // ========== TEAM INFORMATION ==========
    team: {
        website: "https://polgpt.be", // ← TODO: Change to your website
        name: "Arnaud Marchot", // ← TODO: Change to your team/contact name
        email: "info@polgpt.be", // ← TODO: Change to your contact email
    },

    // ========== EMAIL CONFIGURATION ==========
    mail: {
        from: "PolGPT <noreply@polgpt.be>", // ← TODO: Change sender email
        name: "PolGPT", // ← TODO: Change sender name
        email: "noreply@polgpt.be", // ← TODO: Change no-reply email
        replyTo: "info@polgpt.be", // ← TODO: Change reply-to email
        signature: "L'équipe de PolGPT", // ← TODO: Change email signature
    },

    // ========== BRAND STYLING ==========
    brand: {
        primary: "#6366F1", // ← TODO: Change to your primary brand color
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

    // ========== BILLING CONFIGURATION ==========
    billing: {
        type: "plan", // "seat" or "plan" or "subscription"
    },
};
