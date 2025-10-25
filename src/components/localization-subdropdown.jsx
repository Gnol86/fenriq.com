"use client";

import { setLocaleAction } from "@/actions/locale.action";
import {
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";
import { flagId, localeNames, locales } from "@lib/i18n/config";
import { Globe } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

export default function LocalizationSubdropdown({ currentLocale }) {
    const { execute, isPending } = useServerAction();
    const sortedLocales = [...locales].sort((a, b) => {
        const nameA = localeNames[a] ?? a;
        const nameB = localeNames[b] ?? b;

        return nameA.localeCompare(nameB);
    });
    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
                <Globe size={16} className="opacity-60" aria-hidden="true" />
                {localeNames[currentLocale]}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48" side="top">
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
                                    countryCode={flagId[locale] ?? locale}
                                />
                                {localeNames[locale] ?? locale}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
