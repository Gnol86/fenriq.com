"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const previousPathnameRef = useRef(pathname);
    const previousSearchParamsRef = useRef(searchParams.toString());
    const navigationTimeoutRef = useRef(null);
    const loadingTimeoutRef = useRef(null);

    // Détecte les changements de navigation
    useEffect(() => {
        const currentPath = pathname;
        const currentSearch = searchParams.toString();
        const previousPath = previousPathnameRef.current;
        const previousSearch = previousSearchParamsRef.current;

        // Si le pathname ou searchParams ont changé, c'est qu'une navigation vient de se terminer
        if (currentPath !== previousPath || currentSearch !== previousSearch) {
            // Afficher le loader brièvement pour donner un feedback visuel
            setIsNavigating(true);

            // Cacher le loader après un court délai (effet de flash)
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
            loadingTimeoutRef.current = setTimeout(() => {
                setIsNavigating(false);
            }, 300); // 300ms de feedback visuel

            // Mettre à jour les références
            previousPathnameRef.current = currentPath;
            previousSearchParamsRef.current = currentSearch;
        }

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [pathname, searchParams]);

    // Fonction pour démarrer la navigation manuellement (pour router.push)
    const startNavigation = useCallback(() => {
        setIsNavigating(true);

        // Timeout de sécurité : arrêter le loader après 10 secondes max
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }
        navigationTimeoutRef.current = setTimeout(() => {
            setIsNavigating(false);
        }, 10000);
    }, []);

    // Écouter les clics pour démarrer le loader immédiatement
    useEffect(() => {
        const handleClick = (event) => {
            // Chercher un lien parent
            let element = event.target;
            while (element && element !== document.body) {
                if (element.tagName === "A") {
                    const href = element.getAttribute("href");

                    // Vérifier si c'est un lien interne
                    if (
                        href &&
                        !href.startsWith("http") &&
                        !href.startsWith("//") &&
                        !href.startsWith("#") &&
                        !href.startsWith("mailto:") &&
                        !href.startsWith("tel:") &&
                        element.target !== "_blank"
                    ) {
                        startNavigation();
                        return;
                    }
                }
                element = element.parentElement;
            }
        };

        // Utiliser capture phase pour intercepter avant Next.js
        window.addEventListener("click", handleClick, true);

        return () => {
            window.removeEventListener("click", handleClick, true);
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [startNavigation]);

    return (
        <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
            {children}
        </NavigationContext.Provider>
    );
}
