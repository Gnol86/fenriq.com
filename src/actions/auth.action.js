"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
    try {
        await auth.api.signOut({
            headers: await headers(),
        });
    } catch (error) {
        console.error("Error during sign out:", error);
    }
    
    redirect("/");
}