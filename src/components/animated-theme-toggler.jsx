"use client";
import { Loader2, Monitor, Moon, SunDim } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const THEME_ORDER = ["light", "dark", "system"];
const subscribeToMountedState = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export const AnimatedThemeToggler = ({ className, size = 20 }) => {
    const { theme = "system", setTheme } = useTheme();
    const buttonRef = useRef(null);
    const mounted = useSyncExternalStore(
        subscribeToMountedState,
        getMountedSnapshot,
        getServerMountedSnapshot
    );
    const shouldReduceMotion = useReducedMotion();
    const tTheme = useTranslations("theme.toggler");

    const currentThemeIndex = THEME_ORDER.indexOf(theme);

    const changeTheme = async () => {
        const normalizedIndex =
            currentThemeIndex === -1 ? THEME_ORDER.indexOf("system") : currentThemeIndex;
        const nextTheme = THEME_ORDER[(normalizedIndex + 1) % THEME_ORDER.length];
        const themeLabel = tTheme(nextTheme);
        const canAnimateTransition =
            !shouldReduceMotion &&
            buttonRef.current &&
            typeof document.startViewTransition === "function";

        if (!canAnimateTransition) {
            setTheme(nextTheme);
            toast.success(
                tTheme("toast_success", {
                    theme: themeLabel,
                })
            );
            return;
        }

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(nextTheme);
            });
        });

        await transition.ready;

        const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
        const y = top + height / 2;
        const x = left + width / 2;

        const right = window.innerWidth - left;
        const bottom = window.innerHeight - top;
        const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

        const animation = document.documentElement.animate(
            {
                clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRad}px at ${x}px ${y}px)`],
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
        } catch (_error) {
            // Animation may be cancelled; we still show feedback at the end of handler
        }

        toast.success(
            tTheme("toast_success", {
                theme: themeLabel,
            })
        );
    };

    if (!mounted) {
        return <Loader2 size={size} className="animate-spin" />;
    }

    const icon =
        theme === "dark" ? (
            <Moon size={size} />
        ) : theme === "system" ? (
            <Monitor size={size} />
        ) : (
            <SunDim size={size} />
        );

    return (
        <button
            type="button"
            ref={buttonRef}
            onClick={changeTheme}
            className={cn(className)}
            aria-label={tTheme("button_aria_label")}
        >
            {icon}
        </button>
    );
};
