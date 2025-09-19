"use server";

import { APIError } from "better-auth/api";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
    withAuthMonitoring,
    authLogger,
} from "@/lib/auth-monitoring";
import { safeAuthOperation } from "@/lib/auth-error-handling";
import {
    requireUser,
    checkUserPermissions,
} from "@/lib/data-access";
import {
    invalidateOrgCache,
    invalidateUserCache,
} from "@/lib/permissions-cache";
import { nameToSlug } from "@/lib/utils";

const DEFAULT_MESSAGES = {
    invalidPayload: "Les données fournies sont invalides.",
    createOrganization: "Impossible de créer l'organisation pour le moment.",
    inviteMember: "Impossible d'envoyer l'invitation pour le moment.",
    updateOrganization: "Impossible de mettre à jour l'organisation pour le moment.",
    deleteOrganization: "Impossible de supprimer l'organisation pour le moment.",
    updateMemberRole: "Impossible de mettre à jour le rôle pour le moment.",
    removeMember: "Impossible de supprimer ce membre pour le moment.",
    cancelInvitation: "Impossible d'annuler cette invitation pour le moment.",
    insufficientPermissions:
        "Vous n'avez pas les permissions nécessaires pour réaliser cette action.",
    organizationMismatch: "L'organisation ciblée ne correspond pas à l'organisation active.",
};

const createOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(80, "Le nom ne peut pas dépasser 80 caractères"),
    keepCurrentActiveOrganization: z.boolean().optional(),
});

const inviteMemberSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "L'adresse email est requise")
        .email("Adresse email invalide"),
    role: z.string().trim().default("member"),
    organizationId: z.string().trim().min(1, "Organisation invalide"),
    resend: z.boolean().optional().default(false),
});

const updateOrganizationSchema = z.object({
    organizationId: z.string().trim().min(1, "Organisation invalide"),
    name: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(80, "Le nom ne peut pas dépasser 80 caractères"),
});

const deleteOrganizationSchema = z.object({
    organizationId: z.string().trim().min(1, "Organisation invalide"),
});

const updateMemberRoleSchema = z.object({
    organizationId: z.string().trim().min(1, "Organisation invalide"),
    memberId: z.string().trim().min(1, "Identifiant membre invalide"),
    role: z.string().trim().min(1, "Le rôle est requis"),
});

const removeMemberSchema = z.object({
    organizationId: z.string().trim().min(1, "Organisation invalide"),
    memberIdOrEmail: z
        .string()
        .trim()
        .min(1, "Identifiant membre invalide"),
});

const cancelInvitationSchema = z.object({
    organizationId: z.string().trim().min(1, "Organisation invalide"),
    invitationId: z.string().trim().min(1, "Invitation invalide"),
});

const resolveErrorMessage = (error, fallback) => {
    if (!error) {
        return fallback;
    }

    if (error instanceof APIError) {
        return error?.message ?? fallback;
    }

    if (error instanceof z.ZodError) {
        const firstIssue = error.issues?.[0];
        return firstIssue?.message ?? fallback;
    }

    if (error instanceof Error) {
        return error.message || fallback;
    }

    return fallback;
};

const validateInput = (schema, input, fallbackMessage) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error:
                parsed.error.issues?.[0]?.message ??
                fallbackMessage ?? DEFAULT_MESSAGES.invalidPayload,
        };
    }

    return { ok: true, value: parsed.data };
};

const createOrganizationOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.createOrganization;
    const user = await safeAuthOperation(() => requireUser(), null);

    if (!user?.id) {
        authLogger.warn("createOrganizationOperation: user not resolved");
        return { success: false, error: defaultError };
    }

    try {
        const requestHeaders = await headers();
        const organization = await auth.api.createOrganization({
            headers: requestHeaders,
            body: {
                name: input.name,
                slug: nameToSlug(input.name),
                keepCurrentActiveOrganization: Boolean(
                    input.keepCurrentActiveOrganization
                ),
            },
        });

        if (!organization?.id) {
            throw new Error("Réponse inattendue lors de la création de l'organisation");
        }

        // Sélectionne automatiquement la nouvelle organisation sauf indication contraire
        if (!input.keepCurrentActiveOrganization) {
            await safeAuthOperation(async () => {
                await auth.api.setActiveOrganization({
                    headers: requestHeaders,
                    body: { organizationId: organization.id },
                });
                return true;
            }, null);
        }

        await invalidateOrgCache(organization.id);
        await invalidateUserCache(user.id, organization.id);

        authLogger.info("Organization created", {
            userId: user.id,
            organizationId: organization.id,
        });

        return {
            success: true,
            data: { organization },
        };
    } catch (error) {
        authLogger.error("Organization creation failed", {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const inviteMemberOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.inviteMember;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:admin"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("inviteMemberOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization, user } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("inviteMemberOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        const invitation = await auth.api.createInvitation({
            headers: requestHeaders,
            body: {
                email: input.email,
                role: input.role,
                organizationId: organization.id,
                resend: Boolean(input.resend),
            },
        });

        await invalidateOrgCache(organization.id);

        authLogger.info("Member invited", {
            organizationId: organization.id,
            invitedEmail: input.email,
            invitedBy: user.id,
            resend: Boolean(input.resend),
        });

        return {
            success: true,
            data: { invitation },
        };
    } catch (error) {
        authLogger.error("inviteMemberOperation failed", {
            organizationId: organization.id,
            invitedEmail: input.email,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const updateOrganizationOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.updateOrganization;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:admin"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("updateOrganizationOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization, user } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("updateOrganizationOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        const updatedOrganization = await auth.api.updateOrganization({
            headers: requestHeaders,
            body: {
                organizationId: organization.id,
                data: {
                    name: input.name,
                    slug: nameToSlug(input.name),
                },
            },
        });

        await invalidateOrgCache(organization.id);
        await invalidateUserCache(user.id, organization.id);

        authLogger.info("Organization updated", {
            organizationId: organization.id,
            userId: user.id,
        });

        return {
            success: true,
            data: { organization: updatedOrganization },
        };
    } catch (error) {
        authLogger.error("updateOrganizationOperation failed", {
            organizationId: organization.id,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const deleteOrganizationOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.deleteOrganization;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:delete"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("deleteOrganizationOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization, user } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("deleteOrganizationOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        await auth.api.deleteOrganization({
            headers: requestHeaders,
            body: { organizationId: organization.id },
        });

        await invalidateOrgCache(organization.id);
        await invalidateUserCache(user.id);

        authLogger.info("Organization deleted", {
            organizationId: organization.id,
            userId: user.id,
        });

        return {
            success: true,
        };
    } catch (error) {
        authLogger.error("deleteOrganizationOperation failed", {
            organizationId: organization.id,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const updateMemberRoleOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.updateMemberRole;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:admin"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("updateMemberRoleOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("updateMemberRoleOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        const updatedMember = await auth.api.updateMemberRole({
            headers: requestHeaders,
            body: {
                memberId: input.memberId,
                organizationId: organization.id,
                role: input.role,
            },
        });

        if (updatedMember?.userId) {
            await invalidateUserCache(updatedMember.userId, organization.id);
        }
        await invalidateOrgCache(organization.id);

        authLogger.info("Member role updated", {
            organizationId: organization.id,
            memberId: input.memberId,
            role: input.role,
        });

        return {
            success: true,
            data: { member: updatedMember },
        };
    } catch (error) {
        authLogger.error("updateMemberRoleOperation failed", {
            organizationId: organization.id,
            memberId: input.memberId,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const removeMemberOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.removeMember;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:admin"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("removeMemberOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("removeMemberOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        const result = await auth.api.removeMember({
            headers: requestHeaders,
            body: {
                memberIdOrEmail: input.memberIdOrEmail,
                organizationId: organization.id,
            },
        });

        const removedMemberId = result?.member?.userId;
        if (removedMemberId) {
            await invalidateUserCache(removedMemberId, organization.id);
        }
        await invalidateOrgCache(organization.id);

        authLogger.info("Member removed", {
            organizationId: organization.id,
            memberIdentifier: input.memberIdOrEmail,
        });

        return {
            success: true,
            data: { member: result?.member ?? null },
        };
    } catch (error) {
        authLogger.error("removeMemberOperation failed", {
            organizationId: organization.id,
            memberIdentifier: input.memberIdOrEmail,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

const cancelInvitationOperation = withAuthMonitoring(async input => {
    const defaultError = DEFAULT_MESSAGES.cancelInvitation;
    const permissionContext = await safeAuthOperation(
        () => checkUserPermissions(["org:admin"], { throwOnError: true }),
        null
    );

    if (!permissionContext?.organization || !permissionContext?.user) {
        authLogger.warn("cancelInvitationOperation: insufficient permissions context");
        return { success: false, error: DEFAULT_MESSAGES.insufficientPermissions };
    }

    const { organization } = permissionContext;
    if (organization.id !== input.organizationId) {
        authLogger.warn("cancelInvitationOperation: organization mismatch", {
            expected: organization.id,
            received: input.organizationId,
        });
        return { success: false, error: DEFAULT_MESSAGES.organizationMismatch };
    }

    try {
        const requestHeaders = await headers();
        const invitation = await auth.api.cancelInvitation({
            headers: requestHeaders,
            body: {
                invitationId: input.invitationId,
            },
        });

        await invalidateOrgCache(organization.id);

        authLogger.info("Invitation cancelled", {
            organizationId: organization.id,
            invitationId: input.invitationId,
        });

        return {
            success: true,
            data: { invitation },
        };
    } catch (error) {
        authLogger.error("cancelInvitationOperation failed", {
            organizationId: organization.id,
            invitationId: input.invitationId,
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            success: false,
            error: resolveErrorMessage(error, defaultError),
        };
    }
});

export const createOrganizationAction = async rawInput => {
    const validation = validateInput(
        createOrganizationSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => createOrganizationOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.createOrganization }
    );
};

export const inviteMemberAction = async rawInput => {
    const validation = validateInput(
        inviteMemberSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => inviteMemberOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.inviteMember }
    );
};

export const updateOrganizationAction = async rawInput => {
    const validation = validateInput(
        updateOrganizationSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => updateOrganizationOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.updateOrganization }
    );
};

export const deleteOrganizationAction = async rawInput => {
    const validation = validateInput(
        deleteOrganizationSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => deleteOrganizationOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.deleteOrganization }
    );
};

export const updateMemberRoleAction = async rawInput => {
    const validation = validateInput(
        updateMemberRoleSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => updateMemberRoleOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.updateMemberRole }
    );
};

export const removeMemberAction = async rawInput => {
    const validation = validateInput(
        removeMemberSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => removeMemberOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.removeMember }
    );
};

export const cancelInvitationAction = async rawInput => {
    const validation = validateInput(
        cancelInvitationSchema,
        rawInput,
        DEFAULT_MESSAGES.invalidPayload
    );
    if (!validation.ok) {
        return { success: false, error: validation.error };
    }

    return safeAuthOperation(
        () => cancelInvitationOperation(validation.value),
        { success: false, error: DEFAULT_MESSAGES.cancelInvitation }
    );
};
