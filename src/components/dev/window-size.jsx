"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { setLocaleAction } from "@/actions/locale.action";
import { localeNames, locales } from "@/i18n/config";
import { Globe } from "lucide-react";

export default function WindowSize({ currentLocale }) {
    const { execute, isPending } = useServerAction();

    return (
        <div className="absolute z-50 top-0 right-0 p-1 text-foreground text-xs font-bold flex items-center gap-2">
            <div>
                <div className="sm:hidden">{"<"} SM</div>
                <div className="hidden sm:block md:hidden">SM</div>
                <div className="hidden md:block lg:hidden">MD</div>
                <div className="hidden lg:block xl:hidden">LG</div>
                <div className="hidden xl:block 2xl:hidden">XL</div>
                <div className="hidden 2xl:block">2XL</div>
            </div>
            <div>-</div>
            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer hover:underline">
                    {currentLocale?.toUpperCase() ?? "FR"}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48"
                    onCloseAutoFocus={event => event.preventDefault()}
                >
                    <DropdownMenuLabel className="text-xs text-muted-foreground flex gap-1">
                        <Globe size={16} />{" "}
                        {currentLocale?.toUpperCase() ?? "FR"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                                            successMessage: `Langue changée: ${localeNames[locale]}`,
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
        </div>
    );
}
