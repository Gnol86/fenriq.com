"use client";

import { useTranslations } from "next-intl";
import { BuilderSelectionDialog } from "./builder-selection-dialog";
import { FieldInspectorForm } from "./field-inspector-form";

export function SelectedFieldDialog({
    field,
    getFieldTypeLabel,
    onChange,
    onClose,
    onDelete,
    onDuplicate,
    onOptionsChange,
}) {
    const t = useTranslations("project.charroi.builder");

    return (
        <BuilderSelectionDialog
            description={t("field_panel_description")}
            open={Boolean(field)}
            contentClassName="sm:max-w-md"
            title={t("field_panel_title")}
            onClose={onClose}
        >
            <FieldInspectorForm
                field={field}
                getFieldTypeLabel={getFieldTypeLabel}
                onChange={onChange}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onOptionsChange={onOptionsChange}
            />
        </BuilderSelectionDialog>
    );
}
