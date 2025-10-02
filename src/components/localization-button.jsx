"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { setLocaleAction } from "@/actions/locale.action";
import { localeNames, locales } from "@lib/i18n/config";

export default function LocalizationButton({ currentLocale, size = 20 }) {
    const { execute, isPending } = useServerAction();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Globe size={size} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {locales.map(locale => {
                    const isActive = locale === currentLocale;

                    return (
                        <DropdownMenuItem
                            key={locale}
                            onSelect={async event => {
                                event.preventDefault();
                                if (isPending || isActive) return;

                                await execute(
                                    () => setLocaleAction({ locale }),
                                    {
                                        successMessage: `${localeNames[locale]}`,
                                        refreshOnSuccess: true,
                                    }
                                );
                            }}
                            className="flex items-center justify-between gap-2"
                            disabled={isPending || isActive}
                        >
                            <span className="text-sm">
                                {localeNames[locale] ?? locale}
                            </span>
                            {isActive ? (
                                <Check className="h-4 w-4 text-primary" />
                            ) : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
