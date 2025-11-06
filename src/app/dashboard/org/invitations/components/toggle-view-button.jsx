"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function ToggleViewButton({ label }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isShowingAll = searchParams.get("view") === "all";

    const handleToggle = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (isShowingAll) {
            // Switch back to pending view (remove view param)
            params.delete("view");
        } else {
            // Switch to all view
            params.set("view", "all");
        }

        // Reset pagination when toggling view
        params.delete("page");

        startTransition(() => {
            router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
        });
    };

    return (
        <Button variant="outline" className="sm:w-auto" onClick={handleToggle} disabled={isPending}>
            {label}
        </Button>
    );
}
