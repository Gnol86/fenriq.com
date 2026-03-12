"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DialogManagerRenderer } from "@/lib/dialog-manager/dialog-manager-renderer";
import { SidebarProvider } from "./ui/sidebar";

export function Provider({ children, locale, messages, sidebarState }) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <TooltipProvider>
                    <SidebarProvider defaultOpen={sidebarState}>{children}</SidebarProvider>
                    <Toaster position="bottom-right" richColors closeButton />
                    <DialogManagerRenderer />
                </TooltipProvider>
            </NextThemesProvider>
        </NextIntlClientProvider>
    );
}
