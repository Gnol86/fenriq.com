// src/lib/auth.js

import { stripe } from "@better-auth/stripe";
import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, createAuthMiddleware, organization } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { deleteFile } from "@/actions/file.action";
import { SiteConfig } from "@/site-config";
import translations from "../messages/better-auth.json";
import { checkPermission } from "./access-control";
import { defaultLocale } from "./i18n/config.js";
import {
    ac,
    adminPermissions,
    memberPermissions,
    ownerPermissions,
} from "./organization-permissions.js";
import prisma from "./prisma";
import { getServerUrl } from "./server-url";

async function getActiveOrganization(userId) {
    const userMembership = await prisma.member.findFirst({
        where: { userId },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
    });
    return userMembership?.organization ?? null;
}

async function getLocale() {
    const cookieStore = await cookies();
    return cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
}

function withCallbackUrl(url, callbackURL) {
    const resolvedUrl = new URL(url);
    resolvedUrl.searchParams.set("callbackURL", callbackURL);
    return resolvedUrl.toString();
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover", // Latest API version as of Stripe SDK v19
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgres" }),
    baseURL: getServerUrl(),
    basePath: "/api/auth",
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24, // Refresh après 24h
        cookieCache: {
            enabled: true,
            maxAge: 60, // 5 minutes (best practice sécurité)
        },
    },
    // Sécurité renforcée
    rateLimit: {
        enabled: true,
        window: 10, // 1 minute
        max: 100, // 100 requêtes par minute
    },
    databaseHooks: {
        user: {
            create: {
                after: async user => {
                    // Vérifier si c'est le premier utilisateur
                    const userCount = await prisma.user.count();

                    if (userCount === 1) {
                        console.warn("First user signed up, assigning admin role.");
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { role: "admin" },
                        });
                    }
                },
            },
        },
        session: {
            create: {
                before: async session => {
                    const organization = await getActiveOrganization(session.userId);
                    return {
                        data: {
                            ...session,
                            activeOrganizationId: organization?.id,
                        },
                    };
                },
            },
        },
    },
    hooks: {
        before: createAuthMiddleware(async ctx => {
            const path = ctx.path;
            const orgId = ctx.query?.organizationId;

            const needsMemberRead = [
                "/organization/list-members",
                "/organization/get-full-organization",
            ].includes(path);

            const needsInvitationRead = [
                "/organization/list-invitations",
                "/organization/get-full-organization",
            ].includes(path);

            if (!needsMemberRead && !needsInvitationRead) return;

            const permissions = {};
            if (needsMemberRead) permissions.member = ["read"];
            if (needsInvitationRead) permissions.invitation = ["read"];

            const ok = await auth.api
                .hasPermission({
                    headers: ctx.headers,
                    body: { permissions, organizationId: orgId },
                })
                .catch(() => null);

            if (!ok?.success)
                throw new APIError("FORBIDDEN", {
                    message: "Denied",
                });
        }),
    },
    advanced: {
        cookiePrefix: SiteConfig.appId,
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
                try {
                    const { sendChangeEmailConfirmationEmail } = await import(
                        "@/actions/email.action"
                    );
                    await sendChangeEmailConfirmationEmail({
                        email: user.email,
                        name: user.name,
                        newEmail,
                        url,
                    });
                } catch (error) {
                    console.error("Error sending change email confirmation:", error);
                }
            },
        },
        deleteUser: {
            enabled: true,
            beforeDelete: async user => {
                // Vérifier si l'utilisateur est le seul propriétaire d'organisations
                const userOwnerships = await prisma.member.findMany({
                    where: {
                        userId: user.id,
                        role: "owner",
                    },
                    include: {
                        organization: {
                            include: {
                                members: {
                                    where: {
                                        role: "owner",
                                    },
                                },
                            },
                        },
                    },
                });

                // Trouver les organisations où l'utilisateur est le seul propriétaire
                const soleOwnerOrgs = userOwnerships.filter(
                    membership => membership.organization.members.length === 1
                );

                if (soleOwnerOrgs.length > 0) {
                    throw new APIError("FORBIDDEN", {
                        message: "Denied",
                    });
                }
            },
            afterDelete: async user => {
                // Supprimer l'image de profil du blob si elle existe
                await deleteFile(user.image);
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                const { sendResetPasswordEmail } = await import("@/actions/email.action");
                await sendResetPasswordEmail({
                    email: user.email,
                    name: user.name,
                    url,
                });
            } catch (error) {
                console.error("Error sending reset password email:", error);
            }
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            try {
                let verificationUrl = url;

                const currentUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { email: true },
                });

                const isPendingEmailChange =
                    currentUser?.email &&
                    currentUser.email.toLowerCase() !== user.email.toLowerCase();

                if (isPendingEmailChange) {
                    verificationUrl = withCallbackUrl(url, "/dashboard/user/settings");
                }

                const { sendVerificationEmail } = await import("@/actions/email.action");
                await sendVerificationEmail({
                    email: user.email,
                    name: user.name,
                    url: verificationUrl,
                });
            } catch (error) {
                console.error("Error sending verification email:", error);
            }
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            createCustomerOnSignUp: false,
            subscription: {
                enabled: true,
                plans: async () => {
                    const plans = await prisma.plan.findMany();
                    return plans.map(plan => ({
                        name: plan.name,
                        priceId: plan.priceId,
                        annualDiscountPriceId: plan.annualDiscountPriceId,
                        limits: JSON.parse(plan.limits),
                        freeTrial: JSON.parse(plan.freeTrial),
                    }));
                },
                authorizeReference: async ({ action }) => {
                    // Vérifier si l'action nécessite des permissions de gestion
                    if (
                        action === "upgrade-subscription" ||
                        action === "cancel-subscription" ||
                        action === "restore-subscription"
                    ) {
                        const ok = await checkPermission({
                            permissions: { billing: ["manage"] },
                        });
                        return ok;
                    }
                    return true;
                },
                getCheckoutSessionParams: async (
                    { _user, _session, _plan, _subscription },
                    _request
                ) => {
                    return {
                        params: {
                            allow_promotion_codes: true,
                            automatic_tax: {
                                enabled: true,
                            },
                            tax_id_collection: {
                                enabled: true,
                            },
                            billing_address_collection: "required",
                        },
                    };
                },
            },
        }),
        localization({
            defaultLocale: "en-US",
            fallbackLocale: "default",
            getLocale: getLocale,
            translations: translations,
        }),
        admin({
            defaultRole: "user",
        }),
        organization({
            allowUserToCreateOrganization:
                SiteConfig.options.organization.allowUserToCreateOrganization,
            organizationLimit: SiteConfig.options.organization.organizationLimit,
            membershipLimit: SiteConfig.options.organization.membershipLimit,
            invitationLimit: SiteConfig.options.organization.invitationLimit,
            invitationExpiresIn: SiteConfig.options.organization.invitationExpiresIn,

            creatorRole: "owner",
            ac: ac,
            roles: {
                owner: ownerPermissions,
                admin: adminPermissions,
                member: memberPermissions,
            },

            organizationHooks: {
                afterDeleteOrganization: async data => {
                    // Supprimer le logo de l'organisation du blob s'il existe
                    await deleteFile(data.organization.logo);
                },
            },

            sendInvitationEmail: async ({ email, organization, inviter, invitation }) => {
                try {
                    const { sendOrganizationInvitationEmail } = await import(
                        "@/actions/email.action"
                    );
                    const invitationUrl = `${getServerUrl()}/invitations/${invitation.id}`;
                    await sendOrganizationInvitationEmail({
                        email,
                        organizationName: organization.name,
                        inviterName: inviter?.user?.name || inviter?.user?.email || "--",
                        invitationUrl,
                        expiresAt: invitation.expiresAt,
                    });
                } catch (error) {
                    console.error("Error sending organization invitation email:", error);
                }
            },
        }),
        nextCookies(),
    ],
});
