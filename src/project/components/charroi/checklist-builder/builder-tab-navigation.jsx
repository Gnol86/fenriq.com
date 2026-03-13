"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function BuilderTabNavigation({ activeTab, onChange }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex w-fit items-center gap-2 rounded-lg border p-1">
            <Button
                type="button"
                size="sm"
                variant={activeTab === "visual" ? "default" : "ghost"}
                onClick={() => onChange("visual")}
            >
                {t("tab_visual")}
            </Button>
            <Button
                type="button"
                size="sm"
                variant={activeTab === "preview" ? "default" : "ghost"}
                onClick={() => onChange("preview")}
            >
                {t("tab_preview")}
            </Button>
            <Button
                type="button"
                size="sm"
                variant={activeTab === "json" ? "default" : "ghost"}
                onClick={() => onChange("json")}
            >
                {t("tab_json")}
            </Button>
        </div>
    );
}
