import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";
import { SiteConfig } from "@/site-config";
import WindowSize from "@/components/dev/window-size";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale } from "@/i18n/config";

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
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Provider locale={locale} messages={messages}>
                    {children}
                </Provider>
                {process.env.NODE_ENV === "development" && (
                    <WindowSize currentLocale={locale} />
                )}
            </body>
        </html>
    );
}
