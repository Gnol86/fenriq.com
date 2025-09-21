"use client";
import { Moon, SunDim } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const AnimatedThemeToggler = ({ className }) => {
    const { theme, setTheme } = useTheme();
    const buttonRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const changeTheme = async () => {
        if (!buttonRef.current) return;

        const newTheme = theme === "dark" ? "light" : "dark";

        await document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme);
            });
        }).ready;

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect();
        const y = top + height / 2;
        const x = left + width / 2;

        const right = window.innerWidth - left;
        const bottom = window.innerHeight - top;
        const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

        document.documentElement.animate(
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
    };

    if (!mounted) {
        return null;
    }

    return (
        <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
            {theme === "dark" ? <Moon size={20} /> : <SunDim size={20} />}
        </button>
    );
};
