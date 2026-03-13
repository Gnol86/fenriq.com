"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RulesStructureList } from "./rules-structure-list";

export function RulesPanel({
    onAddRule,
    onDeleteRule,
    onDuplicateRule,
    onRuleMove,
    onRuleSelect,
    rules,
    selectedRuleId,
}) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h2 className="font-medium">{t("rules_title")}</h2>
                    <p className="text-muted-foreground text-sm">{t("rules_description")}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onAddRule}>
                    {t("add_rule_button")}
                </Button>
            </div>

            {rules.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                    {t("empty_rules")}
                </div>
            ) : (
                <RulesStructureList
                    rules={rules}
                    selectedRuleId={selectedRuleId}
                    onDuplicateRule={onDuplicateRule}
                    onRuleDelete={onDeleteRule}
                    onRuleMove={onRuleMove}
                    onRuleSelect={onRuleSelect}
                />
            )}
        </div>
    );
}
