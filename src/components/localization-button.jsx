"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { setLocaleAction } from "@/actions/locale.action";
import { localeNames, locales } from "@lib/i18n/config";
import ReactCountryFlag from "react-country-flag";

export default function LocalizationButton({ currentLocale, size = 20 }) {
    const { execute, isPending } = useServerAction();
    const sortedLocales = [...locales].sort((a, b) => {
        const nameA = localeNames[a] ?? a;
        const nameB = localeNames[b] ?? b;

        return nameA.localeCompare(nameB);
    });
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Globe size={size} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" side="top">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <ReactCountryFlag
                        svg
                        countryCode={
                            currentLocale === "en" ? "gb" : currentLocale
                        }
                    />
                    {localeNames[currentLocale]}
                    <Check className="text-primary h-4 w-4" />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortedLocales.map(locale => {
                    if (locale === currentLocale) return null;
                    return (
                        <DropdownMenuItem
                            key={locale}
                            onSelect={async () => {
                                if (isPending) return;

                                await execute(
                                    () => setLocaleAction({ locale }),
                                    {
                                        successMessage: `${localeNames[locale]}`,
                                        refreshOnSuccess: true,
                                    }
                                );
                            }}
                            className="flex items-center gap-2 text-sm"
                            disabled={isPending}
                        >
                            <ReactCountryFlag
                                svg
                                countryCode={locale === "en" ? "gb" : locale}
                            />
                            {localeNames[locale] ?? locale}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
