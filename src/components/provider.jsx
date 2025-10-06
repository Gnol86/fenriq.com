"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";

export function Provider({ children, locale, messages }) {
    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="UTC"
        >
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster position="bottom-right" richColors closeButton />
            </NextThemesProvider>
        </NextIntlClientProvider>
    );
}
