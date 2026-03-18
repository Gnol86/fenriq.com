import { defaultLocale } from "@lib/i18n/config";
import { LandingPage } from "@project/components/landing/landing-page";
import { cookies } from "next/headers";
import { getMessages } from "next-intl/server";
import { getAuth } from "@/lib/access-control";

export default async function Home() {
    const [cookieStore, messages, { user }] = await Promise.all([
        cookies(),
        getMessages(),
        getAuth(),
    ]);
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;

    return (
        <LandingPage
            authLabels={messages.auth.buttons}
            currentLocale={locale}
            isAuthenticated={!!user}
            landing={messages.project.landing}
        />
    );
}
