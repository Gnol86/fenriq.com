"use server";

import { Resend } from "resend";
import { OrganizationInvitationTemplate } from "@/components/email/organization-invitation-template";
import { ResetPasswordTemplate } from "@/components/email/reset-password-template";
import { VerificationEmailTemplate } from "@/components/email/verification-template";
import { SiteConfig } from "@/site-config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({ email, name, url }) {
    try {
        const { data, error } = await resend.emails.send({
            from: SiteConfig.mail.from,
            to: email,
            subject: `${SiteConfig.title} - Vérifiez votre adresse email`,
            react: VerificationEmailTemplate({
                name: name,
                verificationUrl: url,
            }),
        });

        if (error) {
            console.error("Resend error:", error);
            throw new Error("Failed to send invitation email");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Invitation email sending error:", error);
        throw new Error("Failed to send invitation email");
    }
}

export async function sendResetPasswordEmail({ email, name, url }) {
    try {
        const { data, error } = await resend.emails.send({
            from: SiteConfig.mail.from,
            to: email,
            subject: `${SiteConfig.title} - Réinitialisez votre mot de passe`,
            react: ResetPasswordTemplate({
                name,
                resetPasswordUrl: url,
            }),
        });

        if (error) {
            console.error("Resend error:", error);
            throw new Error("Failed to send reset password email");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Reset password email sending error:", error);
        throw new Error("Failed to send reset password email");
    }
}

export async function sendOrganizationInvitationEmail({
    email,
    organizationName,
    inviterName,
    invitationUrl,
    expiresAt,
}) {
    try {
        const expirationDate = expiresAt ? new Date(expiresAt) : null;
        const formattedExpiration =
            expirationDate && !Number.isNaN(expirationDate.getTime())
                ? new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                  }).format(expirationDate)
                : "bientôt";

        const { data, error } = await resend.emails.send({
            from: SiteConfig.mail.from,
            to: email,
            subject: `${SiteConfig.title} - Invitation à rejoindre ${organizationName}`,
            react: OrganizationInvitationTemplate({
                organizationName,
                inviterName,
                invitationUrl,
                expiresAt: formattedExpiration,
            }),
        });

        if (error) {
            console.error("Resend error:", error);
            throw new Error("Failed to send invitation email");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Invitation email sending error:", error);
        throw new Error("Failed to send invitation email");
    }
}
