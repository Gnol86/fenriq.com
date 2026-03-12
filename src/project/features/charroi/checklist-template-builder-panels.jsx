"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
    createChecklistRuleCondition,
    FIELD_PRESETS,
} from "@project/lib/charroi/checklist-builder-defaults";
import { reorderItems } from "@project/lib/charroi/checklist-builder-utils";
import { CHECKLIST_RULE_OPERATORS } from "@project/lib/charroi/constants";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { BuilderSelectionDialog } from "./checklist-template-builder-inspectors";
import { SortableBlock, SortableHandle } from "./checklist-template-builder-sortable";

function FieldPresetPicker({ disabled, onPick, title }) {
    const stopPropagation = event => {
        event.stopPropagation();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        onClick={stopPropagation}
                        onKeyDown={stopPropagation}
                        onPointerDown={stopPropagation}
                    />
                }
            >
                {title}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {FIELD_PRESETS.map(preset => (
                    <DropdownMenuItem
                        key={preset.id}
                        disabled={disabled}
                        onClick={event => {
                            event.stopPropagation();
                            onPick(preset.factory());
                        }}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span>{preset.label}</span>
                            <span className="text-muted-foreground text-xs">
                                {preset.description}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SectionStructureBlock({
    getFieldTypeLabel,
    onAddField,
    onDuplicateField,
    onFieldDelete,
    onFieldMove,
    onSectionDelete,
    onSectionDuplicate,
    onSelectField,
    onSelectSection,
    section,
    selectedFieldId,
    selectedSectionId,
}) {
    const t = useTranslations("project.charroi.builder");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    return (
        <SortableBlock
            id={section.id}
            isSelected={selectedSectionId === section.id}
            onClick={() => onSelectSection(section.id)}
        >
            {({ attributes, listeners }) => (
                <div className="flex flex-col gap-3 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                            <SortableHandle attributes={attributes} listeners={listeners} />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">{section.title}</span>
                                <span className="text-muted-foreground text-xs">
                                    {section.description || t("no_description")}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FieldPresetPicker
                                title={t("add_field_button")}
                                onPick={field => onAddField(section.id, field)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={event => {
                                    event.stopPropagation();
                                    onSectionDuplicate(section.id);
                                }}
                            >
                                <span className="sr-only">{t("duplicate_section")}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-4"
                                >
                                    <path d="M8 7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1H8V7Z" />
                                    <path d="M6 9a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H6Zm0 2h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
                                </svg>
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={event => {
                                    event.stopPropagation();
                                    onSectionDelete(section.id);
                                }}
                            >
                                <span className="sr-only">{t("delete_section")}</span>
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
                    </div>
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        sensors={sensors}
                        onDragEnd={event => {
                            if (!event.over || event.active.id === event.over.id) {
                                return;
                            }

                            onFieldMove(section.id, event.active.id, event.over.id);
                        }}
                    >
                        <SortableContext
                            items={section.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-2">
                                {section.fields.map(field => (
                                    <SortableBlock
                                        key={field.id}
                                        id={field.id}
                                        isSelected={selectedFieldId === field.id}
                                        onClick={event => {
                                            event.stopPropagation();
                                            onSelectField(field.id);
                                        }}
                                    >
                                        {({ attributes, listeners }) => (
                                            <div className="flex items-center justify-between gap-2 p-2">
                                                <div className="flex items-center gap-2">
                                                    <SortableHandle
                                                        attributes={attributes}
                                                        listeners={listeners}
                                                    />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium">
                                                            {field.label}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {getFieldTypeLabel(field.type)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon-sm"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            onDuplicateField(section.id, field.id);
                                                        }}
                                                    >
                                                        <span className="sr-only">
                                                            {t("duplicate_field")}
                                                        </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            className="size-4"
                                                        >
                                                            <path d="M8 7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1H8V7Z" />
                                                            <path d="M6 9a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H6Zm0 2h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            onFieldDelete(section.id, field.id);
                                                        }}
                                                    >
                                                        <span className="sr-only">
                                                            {t("delete_field")}
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
                                            </div>
                                        )}
                                    </SortableBlock>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </SortableBlock>
    );
}

function RulesStructureList({
    onDuplicateRule,
    onRuleDelete,
    onRuleMove,
    onRuleSelect,
    rules,
    selectedRuleId,
}) {
    const t = useTranslations("project.charroi.builder");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            onDragEnd={event => {
                if (!event.over || event.active.id === event.over.id) {
                    return;
                }

                onRuleMove(event.active.id, event.over.id);
            }}
        >
            <SortableContext
                items={rules.map(rule => rule.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2">
                    {rules.map(rule => (
                        <SortableBlock
                            key={rule.id}
                            id={rule.id}
                            isSelected={selectedRuleId === rule.id}
                            onClick={() => onRuleSelect(rule.id)}
                        >
                            {({ attributes, listeners }) => (
                                <div className="flex items-center justify-between gap-2 p-2">
                                    <div className="flex items-center gap-2">
                                        <SortableHandle
                                            attributes={attributes}
                                            listeners={listeners}
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">
                                                {rule.title}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {rule.conditions.length} {t("conditions_count")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={event => {
                                                event.stopPropagation();
                                                onDuplicateRule(rule.id);
                                            }}
                                        >
                                            <span className="sr-only">{t("duplicate_rule")}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="size-4"
                                            >
                                                <path d="M8 7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1H8V7Z" />
                                                <path d="M6 9a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H6Zm0 2h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
                                            </svg>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon-sm"
                                            onClick={event => {
                                                event.stopPropagation();
                                                onRuleDelete(rule.id);
                                            }}
                                        >
                                            <span className="sr-only">{t("delete_rule")}</span>
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
                                </div>
                            )}
                        </SortableBlock>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function RuleCategoryCombobox({ categories, onChange, value }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <Combobox
            itemToStringLabel={categoryId =>
                categories.find(category => category.id === categoryId)?.name ?? ""
            }
            itemToStringValue={categoryId => categoryId ?? ""}
            onValueChange={nextValue => onChange(nextValue)}
            value={value ?? null}
        >
            <ComboboxInput
                placeholder={t("category_placeholder")}
                showClear
                onChange={event => event.stopPropagation()}
            />
            <ComboboxContent>
                <ComboboxEmpty>{t("category_empty")}</ComboboxEmpty>
                <ComboboxList>
                    {categories.map(category => (
                        <ComboboxItem key={category.id} value={category.id}>
                            <div className="flex flex-col gap-0.5">
                                <span>{category.name}</span>
                                <span className="text-muted-foreground text-xs">
                                    {category.defaultDeliveryMode === "IMMEDIATE"
                                        ? t("category_mode_immediate")
                                        : t("category_mode_digest", {
                                              cron: category.defaultDigestCron ?? t("no_cron"),
                                          })}
                                </span>
                            </div>
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

function RuleInspectorForm({
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
                        onClick={() =>
                            onConditionsChange([...rule.conditions, createChecklistRuleCondition()])
                        }
                    >
                        {t("add_condition")}
                    </Button>
                </div>
                <DndContext
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
                                const selectedFieldOption = fieldOptions.find(
                                    option => option.id === condition.fieldId
                                );
                                const selectedFieldType = selectedFieldOption?.type;
                                const needsSecondValue = condition.operator === "between";
                                const shouldHideValue = [
                                    "checked",
                                    "unchecked",
                                    "notEmpty",
                                ].includes(condition.operator);

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
                                                            onValueChange={value =>
                                                                onConditionsChange(
                                                                    rule.conditions.map(
                                                                        currentCondition =>
                                                                            currentCondition.id ===
                                                                            condition.id
                                                                                ? {
                                                                                      ...currentCondition,
                                                                                      fieldId:
                                                                                          value,
                                                                                  }
                                                                                : currentCondition
                                                                    )
                                                                )
                                                            }
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
                                                            onValueChange={value =>
                                                                onConditionsChange(
                                                                    rule.conditions.map(
                                                                        currentCondition =>
                                                                            currentCondition.id ===
                                                                            condition.id
                                                                                ? {
                                                                                      ...currentCondition,
                                                                                      operator:
                                                                                          value,
                                                                                  }
                                                                                : currentCondition
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue>
                                                                    {condition.operator}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {CHECKLIST_RULE_OPERATORS.map(
                                                                    operator => (
                                                                        <SelectItem
                                                                            key={operator}
                                                                            value={operator}
                                                                        >
                                                                            {operator}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                {!shouldHideValue ? (
                                                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                                        <div className="flex flex-col gap-2">
                                                            <Label>
                                                                {t("condition_value_label")}
                                                            </Label>
                                                            <Input
                                                                value={condition.value ?? ""}
                                                                placeholder={
                                                                    selectedFieldType ===
                                                                        "multi_select" ||
                                                                    selectedFieldType ===
                                                                        "single_select"
                                                                        ? t(
                                                                              "condition_value_option_hint"
                                                                          )
                                                                        : t(
                                                                              "condition_value_placeholder"
                                                                          )
                                                                }
                                                                onChange={event =>
                                                                    onConditionsChange(
                                                                        rule.conditions.map(
                                                                            currentCondition =>
                                                                                currentCondition.id ===
                                                                                condition.id
                                                                                    ? {
                                                                                          ...currentCondition,
                                                                                          value: event
                                                                                              .target
                                                                                              .value,
                                                                                      }
                                                                                    : currentCondition
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        {needsSecondValue ? (
                                                            <div className="flex flex-col gap-2">
                                                                <Label>
                                                                    {t(
                                                                        "condition_second_value_label"
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        condition.secondValue ?? ""
                                                                    }
                                                                    onChange={event =>
                                                                        onConditionsChange(
                                                                            rule.conditions.map(
                                                                                currentCondition =>
                                                                                    currentCondition.id ===
                                                                                    condition.id
                                                                                        ? {
                                                                                              ...currentCondition,
                                                                                              secondValue:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : currentCondition
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        ) : null}
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

export function TemplateSettingsPanel({ form }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
                <h3 className="font-medium">{t("template_panel_title")}</h3>
                <p className="text-muted-foreground text-sm">{t("template_panel_description")}</p>
            </div>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("name_label")}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("description_label")}</FormLabel>
                        <FormControl>
                            <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="flex flex-col gap-1">
                            <FormLabel>{t("active_label")}</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}

export function StructurePanel({
    getFieldTypeLabel,
    onAddField,
    onAddSection,
    onDuplicateField,
    onFieldDelete,
    onFieldMove,
    onSectionDelete,
    onSectionDuplicate,
    onSectionsReorder,
    onSelectField,
    onSelectSection,
    sections,
    selectedFieldId,
    selectedSectionId,
}) {
    const t = useTranslations("project.charroi.builder");
    const sectionsSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        })
    );

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h2 className="font-medium">{t("structure_title")}</h2>
                    <p className="text-muted-foreground text-sm">{t("structure_description")}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onAddSection}>
                    {t("add_section_button")}
                </Button>
            </div>
            {sections.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                    {t("empty_sections")}
                </div>
            ) : (
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    sensors={sectionsSensors}
                    onDragEnd={event => {
                        if (!event.over || event.active.id === event.over.id) {
                            return;
                        }

                        onSectionsReorder(event.active.id, event.over.id);
                    }}
                >
                    <SortableContext
                        items={sections.map(section => section.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-3">
                            {sections.map(section => (
                                <SectionStructureBlock
                                    key={section.id}
                                    getFieldTypeLabel={getFieldTypeLabel}
                                    section={section}
                                    selectedFieldId={selectedFieldId}
                                    selectedSectionId={selectedSectionId}
                                    onAddField={onAddField}
                                    onDuplicateField={onDuplicateField}
                                    onFieldDelete={onFieldDelete}
                                    onFieldMove={onFieldMove}
                                    onSectionDelete={onSectionDelete}
                                    onSectionDuplicate={onSectionDuplicate}
                                    onSelectField={onSelectField}
                                    onSelectSection={onSelectSection}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

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

export function JsonEditorTab({ errorMessage, onChange, value }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex flex-col gap-3">
            <Label>{t("json_tab_title")}</Label>
            <Textarea rows={24} value={value} onChange={event => onChange(event.target.value)} />
            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
        </div>
    );
}

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
