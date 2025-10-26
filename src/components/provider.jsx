"use client";

import { DialogProvider } from "@/components/providers/dialog-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "./ui/sidebar";

export function Provider({ children, locale, messages, sidebarState }) {
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
                <DialogProvider>
                    <SidebarProvider defaultOpen={sidebarState}>
                        {children}
                    </SidebarProvider>
                    <Toaster position="bottom-right" richColors closeButton />
                </DialogProvider>
            </NextThemesProvider>
        </NextIntlClientProvider>
    );
}
