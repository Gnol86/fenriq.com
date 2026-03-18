"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SectionInspectorForm({
    onChange,
    onDelete,
    onDuplicate,
    readOnly = false,
    section,
}) {
    const t = useTranslations("project.charroi.builder");

    if (!section) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={readOnly}
                    onClick={onDuplicate}
                >
                    {t("duplicate_section")}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={readOnly}
                    onClick={onDelete}
                >
                    {t("delete_section")}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("section_title_label")}</Label>
                <Input
                    disabled={readOnly}
                    value={section.title}
                    onChange={event => onChange("title", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("section_description_label")}</Label>
                <Textarea
                    rows={3}
                    disabled={readOnly}
                    value={section.description}
                    onChange={event => onChange("description", event.target.value)}
                />
            </div>
        </div>
    );
}
