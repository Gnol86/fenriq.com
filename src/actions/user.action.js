"use server";

import { auth } from "@/lib/auth";
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

export async function deleteUserAction() {
    return await auth.api.deleteUser({
        body: {},
        headers: await headers(),
    });
}