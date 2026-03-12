"use client";

import { useEffect } from "react";

export function useUnsavedChangesGuard(enabled, message) {
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const handleBeforeUnload = event => {
            event.preventDefault();
            event.returnValue = message;
            return message;
        };

        const handleDocumentClick = event => {
            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            const anchor = target.closest("a[href]");

            if (!anchor) {
                return;
            }

            const href = anchor.getAttribute("href");

            if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
                return;
            }

            const nextUrl = new URL(href, window.location.href);
            const currentUrl = new URL(window.location.href);

            if (nextUrl.href === currentUrl.href) {
                return;
            }

            const shouldLeave = window.confirm(message);

            if (!shouldLeave) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("click", handleDocumentClick, true);
        };
    }, [enabled, message]);
}
