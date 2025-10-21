"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

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
    const t = await getTranslations("user.danger_zone");

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

    const soleOwnerOrgs = userOwnerships.filter(
        membership => membership.organization.members.length === 1
    );

    if (soleOwnerOrgs.length > 0) {
        const orgNames = soleOwnerOrgs.map(m => m.organization.name).join(", ");
        throw new Error(t("error_sole_owner", { orgNames }));
    }

    return await auth.api.deleteUser({
        body: {},
        headers: await headers(),
    });
}
