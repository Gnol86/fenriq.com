"use client";

import { DialogProvider } from "@/components/providers/dialog-provider";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider as NextThemesProvider } from "next-themes";

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
                <NavigationProvider>
                    <DialogProvider>
                        {children}
                        <Toaster position="bottom-right" richColors closeButton />
                    </DialogProvider>
                </NavigationProvider>
            </NextThemesProvider>
        </NextIntlClientProvider>
    );
}
