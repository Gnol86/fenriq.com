// src/lib/auth.js
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgres" }),
    baseURL: getServerUrl(),
    // Optionnel mais fortement recommandé pour limiter les hits DB
    session: {
        cookieCache: { enabled: true, maxAge: 60 }, // 60s "gratos" sans DB
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {}),
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
                    url,
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

/**
 * Mémoïsation PAR REQUÊTE:
 * - on clé le cache sur le header Cookie pour éviter toute fuite cross-user.
 * - tous les appels dans le même rendu/req RSC partagent le résultat.
 */
const _getUserCached = cache(async (cookieHeader) => {
    const session = await auth.api.getSession({
        headers: { cookie: cookieHeader },
    });

    const user = session?.user;

    const listOrganizations = await auth.api.listOrganizations({
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    user.organizations = listOrganizations;

    return user ?? null;
});

export const getUser = async () => {
    // Le cookie varie à chaque requête; c'est ta clé de cache.
    const cookieHeader = (await headers()).get("cookie") || "";
    return _getUserCached(cookieHeader);
};

export const needUser = async () => {
    const user = await getUser();
    if (!user) redirect("/signin");
    return user;
};
