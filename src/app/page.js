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
            <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
                <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
                    <h1 className="text-4xl font-bold">
                        👋 Hello, I&apos;m Arnaud
                    </h1>
                    <p className="text-lg">
                        I&apos;m a software engineer, I love to code, and
                        I&apos;m passionate about open source.
                    </p>
                </main>
            </div>
            <footer className="absolute right-0 bottom-0 left-0 flex items-center justify-between gap-2 p-4 text-sm">
                <div>
                    © {new Date().getFullYear()} {SiteConfig.team.name}
                </div>
                <div className="flex items-center gap-2">
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
