"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function JsonEditorTab({ errorMessage, onChange, readOnly = false, value }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex flex-col gap-3">
            <Label>{t("json_tab_title")}</Label>
            <Textarea
                rows={24}
                disabled={readOnly}
                value={value}
                onChange={event => onChange(event.target.value)}
            />
            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
        </div>
    );
}
