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
            <DropdownMenuContent>
                <DropdownMenuLabel className="flex items-center justify-between">
                    {localeNames[currentLocale]}{" "}
                    <Check className="h-4 w-4 text-primary" />
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
                            className="flex items-center justify-between gap-2"
                            disabled={isPending}
                        >
                            <span className="text-sm">
                                {localeNames[locale] ?? locale}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
