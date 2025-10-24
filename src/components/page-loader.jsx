"use client";

import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { Spinner } from "./ui/spinner";

export default function PageLoader() {
    const { isNavigating } = useNavigationLoading();

    console.log("[PageLoader] isNavigating:", isNavigating);

    if (!isNavigating) {
        return null;
    }

    return (
        <div className="bg-background/10 pointer-events-none fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center backdrop-blur-md">
            <Spinner className="h-10 w-10" />
        </div>
    );
}
