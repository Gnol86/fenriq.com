"use server";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function inviteMemberAction({
    email,
    role = "member",
    organizationId,
    resend = false,
}) {
    try {
        if (!email) {
            throw new Error("Adresse email manquante");
        }

        const invitation = await auth.api.createInvitation({
            body: {
                email,
                role,
                organizationId,
                resend,
            },
            headers: await headers(),
        });

        return { success: true, invitation };
    } catch (error) {
        console.error("inviteMemberAction error:", error);
        let message = "Impossible d'envoyer l'invitation";

        if (error instanceof APIError) {
            message = error?.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            success: false,
            error: message,
        };
    }
}
