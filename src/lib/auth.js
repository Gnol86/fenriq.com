import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

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
        sendVerificationEmail: async ({ user, url }) => {
            try {
                const { sendEmail } = await import("@/actions/email.action");
                await sendEmail({
                    email: user.email,
                    subject: "Vérifiez votre adresse email - PolGPT",
                    name: user.name,
                    message:
                        "Pour terminer la création de votre compte PolGPT, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :",
                    url: url,
                });
            } catch (error) {
                console.error("Error sending verification email:", error);
            }
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    plugins: [admin(), organization()],
});

export const getUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user;
};

export const needUser = async () => {
    const user = await getUser();
    if (!user) {
        unauthorized();
    }
    return user;
};
