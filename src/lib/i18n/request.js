import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale } from "./config";

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;

    // Load base messages (boilerplate)
    const baseMessages = (await import(`@/messages/${locale}.json`)).default;

    // Load project messages (if they exist)
    let projectMessages = {};
    try {
        projectMessages = (await import(`@/messages/${locale}.project.json`))
            .default;
    } catch (_e) {
        // No project messages, that's ok
    }

    return {
        locale,
        messages: {
            ...baseMessages,
            project: projectMessages,
        },
        timeZone: "UTC",
    };
});
