import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "PolGPT",
    description: "PolGPT est un bot de langage qui utilise OpenAI et GPT4",
};

export default function RootLayout({ children, modal }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Provider>
                    {children}
                    {modal /* rendu conditionnel de la slot @modal */}
                    <footer className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 justify-between text-sm">
                        PolGPT est un bot de langage qui utilise OpenAI et GPT4.
                        <AnimatedThemeToggler />
                    </footer>
                </Provider>
                <Toaster />
            </body>
        </html>
    );
}
