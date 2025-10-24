"use client";

import { useContext } from "react";
import { NavigationContext } from "@/components/providers/navigation-provider";

export function useNavigationLoading() {
    const context = useContext(NavigationContext);

    if (!context) {
        throw new Error(
            "useNavigationLoading must be used within a NavigationProvider"
        );
    }

    return context;
}
