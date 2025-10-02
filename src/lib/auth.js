// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, createAuthMiddleware, organization } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import { getServerUrl } from "./server-url";
import { SiteConfig } from "@/site-config";
import {
    ac,
    ownerPermissions,
    adminPermissions,
    memberPermissions,
} from "./organization-permissions.js";
import { translations } from "./auth-translations.js";
import { deleteFile } from "@/actions/file.action";

import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

async function getActiveOrganization(userId) {
    const userMembership = await prisma.member.findFirst({
        where: { userId },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
    });
    return userMembership?.organization ?? null;
}

// Détecte la locale depuis le cookie NEXT_LOCALE de next-intl
function getLocaleFromRequest(request) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
    }, {});

    return cookies["NEXT_LOCALE"] ?? null;
}

// Mapper les codes de locale next-intl vers better-auth-localization
function mapLocaleToBetterAuth(locale) {
    const localeMap = {
        fr: "fr-FR",
        en: "en-US",
        nl: "nl-NL",
        de: "de-DE",
    };
    return localeMap[locale] ?? "en-US";
}

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
        session: {
            create: {
                before: async session => {
                    const organization = await getActiveOrganization(
                        session.userId
                    );
                    console.log(
                        "Auto Active organisation :",
                        organization?.name
                    );
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
                    const orgNames = soleOwnerOrgs
                        .map(m => m.organization.name)
                        .join(", ");
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
            defaultLocale: "en-US",
            fallbackLocale: "default",
            getLocale: async request => {
                try {
                    const nextIntlLocale = getLocaleFromRequest(request);
                    return mapLocaleToBetterAuth(nextIntlLocale ?? "en");
                } catch (error) {
                    console.warn(
                        "Error detecting locale from NEXT_LOCALE cookie:",
                        error
                    );
                    return "en-US";
                }
            },
            translations,
        }),
        admin({
            defaultRole: "user",
        }),
        organization({
            allowUserToCreateOrganization:
                SiteConfig.options.organization.allowUserToCreateOrganization,
            organizationLimit:
                SiteConfig.options.organization.organizationLimit,
            membershipLimit: SiteConfig.options.organization.membershipLimit,
            invitationLimit: SiteConfig.options.organization.invitationLimit,
            invitationExpiresIn:
                SiteConfig.options.organization.invitationExpiresIn,

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
                            inviter?.user?.name || inviter?.user?.email || "--",
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
