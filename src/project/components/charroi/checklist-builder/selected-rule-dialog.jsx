"use client";

import { useTranslations } from "next-intl";
import { BuilderSelectionDialog } from "./builder-selection-dialog";
import { RuleInspectorForm } from "./rule-inspector-form";

export function SelectedRuleDialog({
    categories,
    fieldOptions,
    onChangeRule,
    onClose,
    onConditionsChange,
    onDeleteRule,
    onDuplicateRule,
    selectedRule,
}) {
    const t = useTranslations("project.charroi.builder");

    return (
        <BuilderSelectionDialog
            contentClassName="sm:max-w-2xl"
            description={t("rule_panel_description")}
            open={Boolean(selectedRule)}
            title={t("rule_panel_title")}
            onClose={onClose}
        >
            {selectedRule ? (
                <RuleInspectorForm
                    categories={categories}
                    fieldOptions={fieldOptions}
                    rule={selectedRule}
                    onChange={onChangeRule}
                    onConditionsChange={onConditionsChange}
                    onDelete={() => onDeleteRule(selectedRule.id)}
                    onDuplicate={() => onDuplicateRule(selectedRule.id)}
                />
            ) : null}
        </BuilderSelectionDialog>
    );
}
