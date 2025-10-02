"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

export async function updateUserAction({ name, email, image }) {
    return await auth.api.updateUser({
        body: {
            name: name,
            email: email,
            image: image,
        },
        headers: await headers(),
    });
}

export async function deleteUserAction({ userId }) {
    const userOwnerships = await prisma.member.findMany({
        where: {
            userId: userId,
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
        const orgNames = soleOwnerOrgs.map(m => m.organization.name).join(", ");
        throw new Error(
            `Impossible de supprimer votre compte. Vous êtes le seul propriétaire de ces organisations : "${orgNames}". Veuillez transférer la propriété ou supprimer ces organisations avant de supprimer votre compte.`
        );
    }

    return await auth.api.deleteUser({
        body: {},
        headers: await headers(),
    });
}
