"use client";

import { useTranslations } from "next-intl";
import { BuilderSelectionDialog } from "./builder-selection-dialog";
import { SectionInspectorForm } from "./section-inspector-form";

export function SelectedSectionDialog({ onChange, onClose, onDelete, onDuplicate, section }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <BuilderSelectionDialog
            description={t("section_panel_description")}
            open={Boolean(section)}
            title={t("section_panel_title")}
            onClose={onClose}
        >
            <SectionInspectorForm
                section={section}
                onChange={onChange}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        </BuilderSelectionDialog>
    );
}
