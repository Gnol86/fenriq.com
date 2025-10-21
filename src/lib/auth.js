// src/lib/auth.js
import { deleteFile } from "@/actions/file.action";
import { SiteConfig } from "@/site-config";
import { APIError, betterAuth } from "better-auth";
import { localization } from "better-auth-localization";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, createAuthMiddleware, organization } from "better-auth/plugins";
import {
    ac,
    adminPermissions,
    memberPermissions,
    ownerPermissions,
} from "./organization-permissions.js";
import { getServerUrl } from "./server-url";

import { cookies } from "next/headers";
import translations from "../messages/better-auth.json";
import { defaultLocale } from "./i18n/config.js";
import { prisma } from "./prisma-client.js";

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
                        console.warn(
                            "First user signed up, assigning admin role."
                        );
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
                    const organization = await getActiveOrganization(
                        session.userId
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
            getLocale: getLocale,
            translations: translations,
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
                beforeDeleteOrganization: async data => {
                    // Vérifier si l'organisation a un abonnement actif
                    const subscription = await prisma.subscription.findFirst({
                        where: {
                            referenceId: data.organizationId,
                            status: {
                                in: ["active", "trialing", "past_due"],
                            },
                        },
                    });

                    if (subscription) {
                        throw new APIError("FORBIDDEN", {
                            message:
                                "Cannot delete organization with active subscription",
                        });
                    }
                },
                afterDeleteOrganization: async data => {
                    // Supprimer le logo de l'organisation du blob s'il existe
                    await deleteFile(data.organization.logo);
                },
                afterAddMember: async ({ organization }) => {
                    // Ne mettre à jour la quantité que pour le mode "seat"
                    if (SiteConfig.billing.type !== "seat") {
                        return;
                    }

                    // Mettre à jour la quantité de licences sur Stripe
                    try {
                        const { updateSubscriptionQuantityAction } =
                            await import("@/actions/stripe.action");
                        const memberCount = await prisma.member.count({
                            where: {
                                organizationId: organization.id,
                            },
                        });
                        await updateSubscriptionQuantityAction({
                            organizationId: organization.id,
                            quantity: memberCount,
                        });
                    } catch (error) {
                        console.error(
                            "Error updating subscription quantity after adding member:",
                            error
                        );
                        // Ne pas bloquer l'ajout du membre si la mise à jour Stripe échoue
                    }
                },
                afterRemoveMember: async ({ organization }) => {
                    // Ne mettre à jour la quantité que pour le mode "seat"
                    if (SiteConfig.billing.type !== "seat") {
                        return;
                    }

                    // Mettre à jour la quantité de licences sur Stripe
                    try {
                        const { updateSubscriptionQuantityAction } =
                            await import("@/actions/stripe.action");
                        const memberCount = await prisma.member.count({
                            where: {
                                organizationId: organization.id,
                            },
                        });
                        await updateSubscriptionQuantityAction({
                            organizationId: organization.id,
                            quantity: memberCount,
                        });
                    } catch (error) {
                        console.error(
                            "Error updating subscription quantity after removing member:",
                            error
                        );
                        // Ne pas bloquer la suppression du membre si la mise à jour Stripe échoue
                    }
                },
                afterAcceptInvitation: async ({ organization }) => {
                    // Ne mettre à jour la quantité que pour le mode "seat"
                    if (SiteConfig.billing.type !== "seat") {
                        return;
                    }

                    // Mettre à jour la quantité de licences sur Stripe
                    try {
                        const { updateSubscriptionQuantityAction } =
                            await import("@/actions/stripe.action");
                        const memberCount = await prisma.member.count({
                            where: {
                                organizationId: organization.id,
                            },
                        });
                        await updateSubscriptionQuantityAction({
                            organizationId: organization.id,
                            quantity: memberCount,
                        });
                    } catch (error) {
                        console.error(
                            "Error updating subscription quantity after accepting invitation:",
                            error
                        );
                        // Ne pas bloquer l'acceptation de l'invitation si la mise à jour Stripe échoue
                    }
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
