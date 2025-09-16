import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgres",
    }),
    baseURL: getServerUrl(),
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            // Email restriction for sign-up
            if (ctx.path === "/sign-up/email") {
                // Only apply email restriction in production
                const isProduction = process.env.VERCEL_ENV === "production";
                if (!isProduction) {
                    return;
                }

                const email = ctx.body?.email;
                const isAuthorized =
                    email === "arnaud.marchot@icloud.com" ||
                    email?.endsWith("@police.belgium.eu");

                if (!isAuthorized) {
                    throw new APIError("BAD_REQUEST", {
                        message:
                            "Seules les adresses @police.belgium.eu sont autorisées",
                    });
                }
            }
        }),
    },
    advanced: {
        cookiePrefix: SiteConfig.appId,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            // TODO: Implement email sending with your preferred provider (Resend, NodeMailer, etc.)
            console.log("Verification email should be sent to:", user.email);
            console.log("Verification URL:", url);
            console.log("Verification token:", token);
            
            // Example with console log for now
            // You need to replace this with actual email sending logic
            // await sendEmail({
            //     to: user.email,
            //     subject: "Vérifiez votre adresse email",
            //     html: `<p>Cliquez <a href="${url}">ici</a> pour vérifier votre email.</p>`
            // });
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    plugins: [admin(), organization()],
});
