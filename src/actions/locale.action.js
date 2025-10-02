"use server";

import { cookies } from "next/headers";
import { locales } from "@lib/i18n/config";

export async function setLocaleAction({ locale }) {
    if (!locales.includes(locale)) {
        throw new Error(`Invalid locale: ${locale}`);
    }

    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", locale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
    });

    return { success: true, locale };
}
