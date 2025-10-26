import { Geist, Geist_Mono } from "next/font/google";

import { SiteConfig } from "@/site-config";
import WindowSize from "@components/dev/window-size";
import { Provider } from "@components/provider";
import SelectLanguageDialog from "@components/select-language-dialog";
import { defaultLocale } from "@lib/i18n/config";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: SiteConfig.title,
    description: SiteConfig.description,
    icons: {
        icon: "/images/logo_noborder.png",
    },
};

export default async function RootLayout({ children }) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
    const hasLocale = !!cookieStore.get("NEXT_LOCALE");
    const sidebarStateRaw = cookieStore.get("sidebar_state")?.value;
    const sidebarState =
        sidebarStateRaw == null ? true : sidebarStateRaw === "true";
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Provider
                    locale={locale}
                    messages={messages}
                    sidebarState={sidebarState}
                >
                    {children}
                </Provider>
                <SelectLanguageDialog hasLocale={hasLocale} />
                {process.env.NODE_ENV === "development" && (
                    <WindowSize currentLocale={locale} />
                )}
            </body>
        </html>
    );
}
