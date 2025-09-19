// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgres" }),
    baseURL: getServerUrl(),
    // Configuration optimale session 2025
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
                const { sendEmail } = await import("@/actions/email.action");
                await sendEmail({
                    email: user.email,
                    subject: "Vérifiez votre adresse email - PolGPT",
                    name: user.name,
                    message:
                        "Pour terminer la création de votre compte PolGPT, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :",
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
        admin(),
        organization({
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
