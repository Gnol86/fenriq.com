"use client";
import { Monitor, Moon, SunDim } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const THEME_ORDER = ["light", "dark", "system"];
const THEME_NAME = {
    light: "clair",
    dark: "sombre",
    system: "système",
};

export const AnimatedThemeToggler = ({ className, size = 20 }) => {
    const { theme = "system", setTheme } = useTheme();
    const buttonRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    const currentThemeIndex = THEME_ORDER.indexOf(theme);

    useEffect(() => {
        setMounted(true);
    }, []);

    const changeTheme = async () => {
        if (!buttonRef.current) return;

        const normalizedIndex =
            currentThemeIndex === -1
                ? THEME_ORDER.indexOf("system")
                : currentThemeIndex;
        const nextTheme =
            THEME_ORDER[(normalizedIndex + 1) % THEME_ORDER.length];

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(nextTheme);
            });
        });

        await transition.ready;

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect();
        const y = top + height / 2;
        const x = left + width / 2;

        const right = window.innerWidth - left;
        const bottom = window.innerHeight - top;
        const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

        const animation = document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRad}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 700,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        );

        try {
            await animation.finished;
            await transition.finished;
        } catch (error) {
            // Animation may be cancelled; we still show feedback at the end of handler
        }

        toast("Thème " + THEME_NAME[nextTheme] + " appliqué");
    };

    if (!mounted) {
        return <Loader2 size={size} className="animate-spin" />;
    }

    const renderIcon = () => {
        if (theme === "dark") return <Moon size={size} />;
        if (theme === "system") return <Monitor size={size} />;
        return <SunDim size={size} />;
    };

    return (
        <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
            {renderIcon()}
        </button>
    );
};
