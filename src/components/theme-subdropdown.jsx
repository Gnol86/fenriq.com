"use client";

import { Monitor, Moon, SunDim } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
    DropdownMenuCheckboxItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeSubdropdown() {
    const { theme = "system", setTheme } = useTheme();
    const tTheme = useTranslations("theme.toggler");

    const renderIcon = () => {
        if (theme === "dark") return <Moon size={16} className="opacity-60" aria-hidden="true" />;
        if (theme === "system")
            return <Monitor size={16} className="opacity-60" aria-hidden="true" />;
        return <SunDim size={16} className="opacity-60" aria-hidden="true" />;
    };

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
                {renderIcon()}
                {tTheme("label")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48" side="top">
                    <DropdownMenuCheckboxItem
                        onClick={() => setTheme("system")}
                        disabled={theme === "system"}
                        checked={theme === "system"}
                    >
                        <Monitor size={16} className="opacity-60" aria-hidden="true" />
                        {tTheme("system").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        onClick={() => setTheme("light")}
                        disabled={theme === "light"}
                        checked={theme === "light"}
                    >
                        <SunDim size={16} className="opacity-60" aria-hidden="true" />
                        {tTheme("light").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        onClick={() => setTheme("dark")}
                        disabled={theme === "dark"}
                        checked={theme === "dark"}
                    >
                        <Moon size={16} className="opacity-60" aria-hidden="true" />
                        {tTheme("dark").replace(/^./, c => c.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
