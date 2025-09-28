"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function Provider({ children }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster position="bottom-right" richColors closeButton />
        </NextThemesProvider>
    );
}
