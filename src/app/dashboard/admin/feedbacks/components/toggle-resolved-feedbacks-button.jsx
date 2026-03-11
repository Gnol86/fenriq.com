"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createUrlSearchParams } from "@/lib/utils";

const EMPTY_SEARCH_PARAMS = {};

export default function ToggleResolvedFeedbacksButton({
    searchParams = EMPTY_SEARCH_PARAMS,
    isShowingAll = false,
    resolvedCount = 0,
}) {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("admin.feedbacks");
    const [isPending, startTransition] = useTransition();

    if (resolvedCount === 0 && !isShowingAll) {
        return null;
    }

    const handleToggle = () => {
        const params = createUrlSearchParams(searchParams);

        if (isShowingAll) {
            params.delete("status");
        } else {
            params.set("status", "all");
        }

        params.delete("page");

        startTransition(() => {
            router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
        });
    };

    return (
        <Button variant="outline" className="sm:w-auto" onClick={handleToggle} disabled={isPending}>
            {isShowingAll ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
            {isShowingAll
                ? t("hide_resolved", { count: resolvedCount })
                : t("show_resolved", { count: resolvedCount })}
        </Button>
    );
}
