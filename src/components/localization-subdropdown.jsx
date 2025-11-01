"use client";

import { flagId, localeNames, locales } from "@lib/i18n/config";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import ReactCountryFlag from "react-country-flag";
import { setLocaleAction } from "@/actions/locale.action";
import {
    DropdownMenuCheckboxItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";

export default function LocalizationSubdropdown({ currentLocale }) {
    const { execute, isPending } = useServerAction();
    const tLanguage = useTranslations("language");
    const sortedLocales = [...locales].sort((a, b) => {
        const nameA = localeNames[a] ?? a;
        const nameB = localeNames[b] ?? b;

        return nameA.localeCompare(nameB);
    });
    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
                <Globe size={16} className="opacity-60" aria-hidden="true" />
                {tLanguage("label")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48" side="top">
                    {sortedLocales.map(locale => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={locale}
                                onSelect={async event => {
                                    event.preventDefault();
                                    if (isPending) return;

                                    await execute(
                                        () => setLocaleAction({ locale }),
                                        {
                                            successMessage: `${localeNames[locale]}`,
                                            refreshOnSuccess: true,
                                        }
                                    );
                                }}
                                disabled={locale === currentLocale || isPending}
                                checked={locale === currentLocale}
                            >
                                <ReactCountryFlag
                                    svg
                                    countryCode={flagId[locale] ?? locale}
                                />
                                {localeNames[locale] ?? locale}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
