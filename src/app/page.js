/**
 * ============================================================
 * 🚨 PROJECT TEMPLATE FILE - CUSTOMIZE FOR YOUR PROJECT
 * ============================================================
 *
 * This file is PROTECTED and will NOT be overwritten when you
 * update from the boilerplate upstream.
 *
 * This is your landing page - customize it for your project!
 *
 * See examples in: src/project/examples/
 * Documentation: .github/SETUP_NEW_PROJECT.md
 * ============================================================
 */

import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import SignUpButton from "@/components/auth/SignUpButton";
import SignInButton from "@/components/auth/SignInButton";
import SignOutButton from "@/components/auth/SignOutButton";
import GoAppButton from "@/components/auth/GoAppButton";
import { SiteConfig } from "@/site-config";
import { cookies } from "next/headers";
import { defaultLocale } from "@lib/i18n/config";
import LocalizationButton from "@/components/localization-button";

export default async function Home() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
    return (
        <>
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                    <h1 className="text-4xl font-bold">
                        👋 Hello, I&apos;m Arnaud
                    </h1>
                    <p className="text-lg">
                        I&apos;m a software engineer, I love to code, and
                        I&apos;m passionate about open source.
                    </p>
                </main>
            </div>
            <footer className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 justify-between items-center text-sm">
                <div>
                    © {new Date().getFullYear()} {SiteConfig.team.name}
                </div>
                <div className="flex gap-2 items-center">
                    <LocalizationButton currentLocale={locale} />
                    <AnimatedThemeToggler />
                    <SignUpButton />
                    <SignInButton />
                    <SignOutButton />
                    <GoAppButton />
                </div>
            </footer>
        </>
    );
}
