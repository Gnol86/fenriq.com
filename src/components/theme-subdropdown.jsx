"use client";

import {
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, SunDim } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function ThemeSubdropdown() {
    const { theme = "system", setTheme } = useTheme();
    const tTheme = useTranslations("theme.toggler");

    const renderIcon = () => {
        if (theme === "dark")
            return <Moon size={16} className="opacity-60" aria-hidden="true" />;
        if (theme === "system")
            return (
                <Monitor size={16} className="opacity-60" aria-hidden="true" />
            );
        return <SunDim size={16} className="opacity-60" aria-hidden="true" />;
    };

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
                {renderIcon()}
                {tTheme(theme).replace(/^./, c => c.toUpperCase())}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48" side="top">
                    <DropdownMenuItem
                        onSelect={event => {
                            event.preventDefault();
                            setTheme("system");
                        }}
                    >
                        <Monitor
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        {tTheme("system").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={event => {
                            event.preventDefault();
                            setTheme("light");
                        }}
                    >
                        <SunDim
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        {tTheme("light").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={event => {
                            event.preventDefault();
                            setTheme("dark");
                        }}
                    >
                        <Moon
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        {tTheme("dark").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
