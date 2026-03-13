"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SectionInspectorForm({ onChange, onDelete, onDuplicate, section }) {
    const t = useTranslations("project.charroi.builder");

    if (!section) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                    {t("duplicate_section")}
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                    {t("delete_section")}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("section_title_label")}</Label>
                <Input
                    value={section.title}
                    onChange={event => onChange("title", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("section_description_label")}</Label>
                <Textarea
                    rows={3}
                    value={section.description}
                    onChange={event => onChange("description", event.target.value)}
                />
            </div>
        </div>
    );
}
