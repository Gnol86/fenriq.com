import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteConfig } from "@/site-config";

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

export default function RootLayout({ children }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Provider>{children}</Provider>
                <Toaster position="top-center" richColors closeButton />
            </body>
        </html>
    );
}
