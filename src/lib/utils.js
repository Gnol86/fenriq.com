import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getInitials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
}
