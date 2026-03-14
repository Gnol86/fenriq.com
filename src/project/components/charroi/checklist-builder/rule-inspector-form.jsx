"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createChecklistRuleCondition } from "@project/lib/charroi/checklist-builder-defaults";
import { reorderItems } from "@project/lib/charroi/checklist-builder-utils";
import {
    getChecklistBuilderFieldOption,
    normalizeRuleConditionForField,
    normalizeRuleConditionForOperator,
} from "@project/lib/charroi/checklist-template-builder-helpers";
import {
    getChecklistRuleConditionValueInput,
    getChecklistRuleOperatorDefinition,
    getChecklistRuleOperatorsForFieldType,
    isChecklistRuleLegacyOperator,
    isChecklistRuleOperatorCompatibleWithFieldType,
} from "@project/lib/charroi/rule-operators";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RuleCategoryCombobox } from "./rule-category-combobox";
import { SortableBlock } from "./sortable-block";
import { SortableHandle } from "./sortable-handle";

function getOperatorLabel(operator, t) {
    const definition = getChecklistRuleOperatorDefinition(operator);

    if (!definition) {
        return operator;
    }

    return t(definition.labelKey);
}

function getConditionOperatorOptions(condition, selectedFieldOption) {
    if (!selectedFieldOption) {
        return condition.operator ? [condition.operator] : [];
    }

    const operators = getChecklistRuleOperatorsForFieldType(selectedFieldOption.type);

    if (
        condition.operator &&
        isChecklistRuleLegacyOperator(condition.operator) &&
        isChecklistRuleOperatorCompatibleWithFieldType({
            fieldType: selectedFieldOption.type,
            operator: condition.operator,
        })
    ) {
        operators.push(condition.operator);
    }

    return [...new Set(operators)];
}

function updateConditionList(conditions, conditionId, updater) {
    return conditions.map(condition =>
        condition.id === conditionId ? updater(condition) : condition
    );
}

export function RuleInspectorForm({
    categories,
    fieldOptions,
    onChange,
    onConditionsChange,
    onDelete,
    onDuplicate,
    rule,
}) {
    const t = useTranslations("project.charroi.builder");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    if (!rule) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{t("rule_panel_title")}</h3>
                    <p className="text-muted-foreground text-sm">{t("rule_panel_description")}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                        {t("duplicate_rule")}
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                        {t("delete_rule")}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("rule_title_label")}</Label>
                <Input
                    value={rule.title}
                    onChange={event => onChange("title", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("rule_description_label")}</Label>
                <Textarea
                    rows={3}
                    value={rule.description}
                    onChange={event => onChange("description", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("rule_combinator_label")}</Label>
                <Select
                    value={rule.combinator}
                    onValueChange={value => onChange("combinator", value)}
                >
                    <SelectTrigger>
                        <SelectValue>
                            {rule.combinator === "ALL"
                                ? t("rule_combinator_all")
                                : t("rule_combinator_any")}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t("rule_combinator_all")}</SelectItem>
                        <SelectItem value="ANY">{t("rule_combinator_any")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("rule_category_label")}</Label>
                <RuleCategoryCombobox
                    categories={categories}
                    value={rule.categoryId}
                    onChange={value => onChange("categoryId", value)}
                />
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Label>{t("conditions_title")}</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const nextCondition = createChecklistRuleCondition();
                            const firstFieldOption = fieldOptions[0] ?? null;

                            onConditionsChange([
                                ...rule.conditions,
                                firstFieldOption
                                    ? normalizeRuleConditionForField({
                                          condition: {
                                              ...nextCondition,
                                              fieldId: firstFieldOption.id,
                                          },
                                          fieldOption: firstFieldOption,
                                      })
                                    : nextCondition,
                            ]);
                        }}
                    >
                        {t("add_condition")}
                    </Button>
                </div>
                <DndContext
                    id={`checklist-builder-rule-${rule.id}-conditions-dnd`}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    sensors={sensors}
                    onDragEnd={event => {
                        if (!event.over || event.active.id === event.over.id) {
                            return;
                        }

                        onConditionsChange(
                            reorderItems(rule.conditions, event.active.id, event.over.id)
                        );
                    }}
                >
                    <SortableContext
                        items={rule.conditions.map(condition => condition.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-2">
                            {rule.conditions.map(condition => {
                                const selectedFieldOption = getChecklistBuilderFieldOption(
                                    fieldOptions,
                                    condition.fieldId
                                );
                                const operatorOptions = getConditionOperatorOptions(
                                    condition,
                                    selectedFieldOption
                                );
                                const operatorDefinition = getChecklistRuleOperatorDefinition(
                                    condition.operator
                                );
                                const valueInput = getChecklistRuleConditionValueInput(
                                    condition.operator,
                                    selectedFieldOption?.type
                                );
                                const shouldRenderValue =
                                    valueInput !== "none" || condition.operator === "between";
                                const supportsRepeatOnTrueChange =
                                    operatorDefinition?.supportsRepeatOnTrueChange === true;

                                return (
                                    <SortableBlock key={condition.id} id={condition.id}>
                                        {({ attributes, listeners }) => (
                                            <div className="flex flex-col gap-3 p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <SortableHandle
                                                        attributes={attributes}
                                                        listeners={listeners}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            onConditionsChange(
                                                                rule.conditions.filter(
                                                                    currentCondition =>
                                                                        currentCondition.id !==
                                                                        condition.id
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            {t("delete_condition")}
                                                        </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            className="size-4"
                                                        >
                                                            <path d="M9 3a1 1 0 0 0-.8.4L7.5 4H5a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2h-2.5l-.7-.6A1 1 0 0 0 15 3H9Z" />
                                                            <path d="M6 8a1 1 0 0 1 1 1v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a1 1 0 1 1 2 0v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1Z" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>{t("condition_field_label")}</Label>
                                                        <Select
                                                            value={condition.fieldId}
                                                            onValueChange={value => {
                                                                const nextFieldOption =
                                                                    getChecklistBuilderFieldOption(
                                                                        fieldOptions,
                                                                        value
                                                                    );

                                                                onConditionsChange(
                                                                    updateConditionList(
                                                                        rule.conditions,
                                                                        condition.id,
                                                                        currentCondition =>
                                                                            normalizeRuleConditionForField(
                                                                                {
                                                                                    condition: {
                                                                                        ...currentCondition,
                                                                                        fieldId:
                                                                                            value,
                                                                                    },
                                                                                    fieldOption:
                                                                                        nextFieldOption,
                                                                                }
                                                                            )
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "condition_field_placeholder"
                                                                    )}
                                                                >
                                                                    {selectedFieldOption
                                                                        ? `${selectedFieldOption.sectionTitle} - ${selectedFieldOption.label}`
                                                                        : null}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fieldOptions.map(option => (
                                                                    <SelectItem
                                                                        key={option.id}
                                                                        value={option.id}
                                                                    >
                                                                        {option.sectionTitle} -{" "}
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            {t("condition_operator_label")}
                                                        </Label>
                                                        <Select
                                                            value={condition.operator}
                                                            disabled={!selectedFieldOption}
                                                            onValueChange={value =>
                                                                onConditionsChange(
                                                                    updateConditionList(
                                                                        rule.conditions,
                                                                        condition.id,
                                                                        currentCondition =>
                                                                            normalizeRuleConditionForOperator(
                                                                                {
                                                                                    condition:
                                                                                        currentCondition,
                                                                                    fieldOption:
                                                                                        selectedFieldOption,
                                                                                    operator: value,
                                                                                }
                                                                            )
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue>
                                                                    {getOperatorLabel(
                                                                        condition.operator,
                                                                        t
                                                                    )}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {operatorOptions.map(operator => (
                                                                    <SelectItem
                                                                        key={operator}
                                                                        value={operator}
                                                                    >
                                                                        {getOperatorLabel(
                                                                            operator,
                                                                            t
                                                                        )}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                {shouldRenderValue ? (
                                                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                                        <div className="flex flex-col gap-2">
                                                            <Label>
                                                                {t("condition_value_label")}
                                                            </Label>
                                                            {valueInput === "number" ? (
                                                                <Input
                                                                    type="number"
                                                                    value={condition.value ?? ""}
                                                                    placeholder={t(
                                                                        "condition_value_placeholder"
                                                                    )}
                                                                    onChange={event =>
                                                                        onConditionsChange(
                                                                            updateConditionList(
                                                                                rule.conditions,
                                                                                condition.id,
                                                                                currentCondition => ({
                                                                                    ...currentCondition,
                                                                                    value: event
                                                                                        .target
                                                                                        .value,
                                                                                })
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            ) : null}
                                                            {valueInput === "text" ? (
                                                                <Input
                                                                    value={condition.value ?? ""}
                                                                    placeholder={t(
                                                                        "condition_value_placeholder"
                                                                    )}
                                                                    onChange={event =>
                                                                        onConditionsChange(
                                                                            updateConditionList(
                                                                                rule.conditions,
                                                                                condition.id,
                                                                                currentCondition => ({
                                                                                    ...currentCondition,
                                                                                    value: event
                                                                                        .target
                                                                                        .value,
                                                                                })
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            ) : null}
                                                            {valueInput === "single_select" ? (
                                                                selectedFieldOption?.type ===
                                                                    "single_select" &&
                                                                selectedFieldOption.options.length >
                                                                    0 ? (
                                                                    <Select
                                                                        value={
                                                                            condition.value ?? ""
                                                                        }
                                                                        onValueChange={value =>
                                                                            onConditionsChange(
                                                                                updateConditionList(
                                                                                    rule.conditions,
                                                                                    condition.id,
                                                                                    currentCondition => ({
                                                                                        ...currentCondition,
                                                                                        value,
                                                                                    })
                                                                                )
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue
                                                                                placeholder={t(
                                                                                    "select_placeholder"
                                                                                )}
                                                                            >
                                                                                {selectedFieldOption.options.find(
                                                                                    option =>
                                                                                        option.value ===
                                                                                        condition.value
                                                                                )?.label ?? null}
                                                                            </SelectValue>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {selectedFieldOption.options.map(
                                                                                option => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            option.id
                                                                                        }
                                                                                        value={
                                                                                            option.value
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            option.label
                                                                                        }
                                                                                    </SelectItem>
                                                                                )
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <Input
                                                                        value={
                                                                            condition.value ?? ""
                                                                        }
                                                                        placeholder={t(
                                                                            "condition_value_placeholder"
                                                                        )}
                                                                        onChange={event =>
                                                                            onConditionsChange(
                                                                                updateConditionList(
                                                                                    rule.conditions,
                                                                                    condition.id,
                                                                                    currentCondition => ({
                                                                                        ...currentCondition,
                                                                                        value: event
                                                                                            .target
                                                                                            .value,
                                                                                    })
                                                                                )
                                                                            )
                                                                        }
                                                                    />
                                                                )
                                                            ) : null}
                                                            {valueInput === "multi_select" ? (
                                                                <div className="flex flex-col gap-2 rounded-md border p-3">
                                                                    {selectedFieldOption?.options.map(
                                                                        option => {
                                                                            const values =
                                                                                Array.isArray(
                                                                                    condition.value
                                                                                )
                                                                                    ? condition.value
                                                                                    : [];
                                                                            const checked =
                                                                                values.includes(
                                                                                    option.value
                                                                                );

                                                                            return (
                                                                                <div
                                                                                    key={option.id}
                                                                                    className="flex items-center gap-2 text-sm"
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            checked
                                                                                        }
                                                                                        onCheckedChange={nextChecked =>
                                                                                            onConditionsChange(
                                                                                                updateConditionList(
                                                                                                    rule.conditions,
                                                                                                    condition.id,
                                                                                                    currentCondition => {
                                                                                                        const currentValues =
                                                                                                            Array.isArray(
                                                                                                                currentCondition.value
                                                                                                            )
                                                                                                                ? currentCondition.value
                                                                                                                : [];

                                                                                                        return {
                                                                                                            ...currentCondition,
                                                                                                            value: nextChecked
                                                                                                                ? [
                                                                                                                      ...currentValues,
                                                                                                                      option.value,
                                                                                                                  ]
                                                                                                                : currentValues.filter(
                                                                                                                      value =>
                                                                                                                          value !==
                                                                                                                          option.value
                                                                                                                  ),
                                                                                                        };
                                                                                                    }
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    {option.label}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        {condition.operator === "between" ? (
                                                            <div className="flex flex-col gap-2">
                                                                <Label>
                                                                    {t(
                                                                        "condition_second_value_label"
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        condition.secondValue ?? ""
                                                                    }
                                                                    onChange={event =>
                                                                        onConditionsChange(
                                                                            updateConditionList(
                                                                                rule.conditions,
                                                                                condition.id,
                                                                                currentCondition => ({
                                                                                    ...currentCondition,
                                                                                    secondValue:
                                                                                        event.target
                                                                                            .value,
                                                                                })
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                                {supportsRepeatOnTrueChange ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            checked={
                                                                condition.repeatOnTrueChange ===
                                                                true
                                                            }
                                                            onCheckedChange={checked =>
                                                                onConditionsChange(
                                                                    updateConditionList(
                                                                        rule.conditions,
                                                                        condition.id,
                                                                        currentCondition => ({
                                                                            ...currentCondition,
                                                                            repeatOnTrueChange:
                                                                                checked === true,
                                                                        })
                                                                    )
                                                                )
                                                            }
                                                        />
                                                        {t("condition_repeat_on_true_change_label")}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </SortableBlock>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
