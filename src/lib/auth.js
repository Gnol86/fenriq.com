// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";
import {
    ac,
    ownerPermissions,
    adminPermissions,
    memberPermissions,
} from "./organization-permissions.js";
import { disabledPaths } from "./auth-disabled-paths.js";
import { translations } from "./auth-translations.js";

import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgres" }),
    baseURL: getServerUrl(),
    basePath: "/api/auth",
    disabledPaths,
    logger: {
        level: "info",
        log: (level, message, ...args) => {
            console.log({
                level,
                message,
                metadata: args,
                timestamp: new Date().toISOString(),
            });
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24, // Refresh après 24h
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes (best practice sécurité)
        },
    },
    // Sécurité renforcée
    rateLimit: {
        enabled: true,
        window: 60, // 1 minute
        max: 100, // 100 requêtes par minute
    },
    // Hooks désactivés temporairement pour éviter les erreurs de démarrage
    advanced: {
        cookiePrefix: SiteConfig.appId,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            try {
                const { sendVerificationEmail } = await import(
                    "@/actions/email.action"
                );
                await sendVerificationEmail({
                    email: user.email,
                    name: user.name,
                    url,
                });
            } catch (error) {
                console.error("Error sending verification email:", error);
            }
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    plugins: [
        localization({
            defaultLocale: "fr-FR",
            fallbackLocale: "default",
            translations,
        }),
        admin({
            defaultRole: "user",
        }),
        organization({
            creatorRole: "owner",
            ac: ac,
            roles: {
                owner: ownerPermissions,
                admin: adminPermissions,
                member: memberPermissions,
            },
            invitationExpiresIn: 60 * 60 * 24 * 30,
            sendInvitationEmail: async ({
                email,
                organization,
                inviter,
                invitation,
            }) => {
                try {
                    const { sendOrganizationInvitationEmail } = await import(
                        "@/actions/email.action"
                    );
                    const invitationUrl = `${getServerUrl()}/invitations/${invitation.id}`;
                    await sendOrganizationInvitationEmail({
                        email,
                        organizationName: organization.name,
                        inviterName:
                            inviter?.user?.name ||
                            inviter?.user?.email ||
                            "Un membre de votre organisation",
                        invitationUrl,
                        expiresAt: invitation.expiresAt,
                    });
                } catch (error) {
                    console.error(
                        "Error sending organization invitation email:",
                        error
                    );
                }
            },
        }),
    ],
});
