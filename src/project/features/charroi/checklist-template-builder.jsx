"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createChecklistTemplateAction,
    updateChecklistTemplateAction,
} from "@project/actions/charroi.action";
import { useUnsavedChangesGuard } from "@project/hooks/use-unsaved-changes-guard";
import {
    createChecklistField,
    createChecklistOption,
    createChecklistRule,
    createChecklistRuleCondition,
    createChecklistSection,
    DEFAULT_TEMPLATE_SCHEMA,
    FIELD_PRESETS,
} from "@project/lib/charroi/checklist-builder-defaults";
import {
    buildSchemaFromValues,
    getFieldLocation,
    getReferencedCategoryCount,
    getTemplateFormDefaults,
    parseSchemaText,
    reorderItems,
    serializeSchema,
} from "@project/lib/charroi/checklist-builder-utils";
import { CHECKLIST_FIELD_TYPES, CHECKLIST_RULE_OPERATORS } from "@project/lib/charroi/constants";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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
import { useServerAction } from "@/hooks/use-server-action";
import { ChecklistFormRenderer, createInitialResponses } from "./checklist-form-renderer";

function transformToStyle(transform, transition) {
    if (!transform) {
        return {
            transition,
        };
    }

    return {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
    };
}

function createBuilderFormSchema(t) {
    return z.object({
        name: z.string().trim().min(1, t("validation_name_required")),
        description: z.string().trim().optional(),
        isActive: z.boolean().default(true),
        sections: z.array(z.any()).default([]),
        rules: z.array(z.any()).default([]),
    });
}

function safelyBuildSchema(values) {
    try {
        return buildSchemaFromValues(values);
    } catch {
        return {
            sections: values.sections ?? [],
            rules: values.rules ?? [],
        };
    }
}

function duplicateField(field) {
    return {
        ...field,
        id: createChecklistField(field.type).id,
        options: field.options.map(option => ({
            ...option,
            id: createChecklistOption().id,
        })),
    };
}

function duplicateSection(section) {
    return {
        ...section,
        id: createChecklistSection().id,
        fields: section.fields.map(duplicateField),
    };
}

function duplicateRule(rule) {
    return {
        ...rule,
        id: createChecklistRule().id,
        conditions: rule.conditions.map(condition => ({
            ...condition,
            id: createChecklistRuleCondition().id,
        })),
    };
}

function getFieldTypeLabel(type) {
    const labels = {
        text: "Texte",
        textarea: "Texte long",
        number: "Nombre",
        single_select: "Choix simple",
        multi_select: "Choix multiple",
        checkbox: "Case à cocher",
        photo: "Photo",
    };

    return labels[type] ?? type;
}

function normalizeFieldForType(field, nextType) {
    const baseField = {
        ...field,
        type: nextType,
    };

    if (nextType === "single_select" || nextType === "multi_select") {
        return {
            ...baseField,
            options: field.options.length > 0 ? field.options : [createChecklistOption()],
        };
    }

    return {
        ...baseField,
        options: [],
    };
}

function SortableBlock({ children, id, isSelected = false, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            style={transformToStyle(transform, transition)}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`rounded-lg border bg-background ${isSelected ? "ring-2 ring-ring" : ""} ${
                isDragging ? "opacity-70" : ""
            }`}
            onClick={onClick}
            onKeyDown={
                onClick
                    ? event => {
                          if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onClick(event);
                          }
                      }
                    : undefined
            }
        >
            {children({ attributes, listeners })}
        </div>
    );
}

function SortableHandle({ attributes, listeners }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <span className="sr-only">Réordonner</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
            >
                <path d="M10 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM10 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM10 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
        </Button>
    );
}

function InlineEditableText({
    activeEditor,
    as = "text",
    className = "",
    id,
    onCommit,
    onEdit,
    placeholder,
    value,
}) {
    const isEditing = activeEditor === id;
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    if (isEditing) {
        if (as === "textarea") {
            return (
                <Textarea
                    autoFocus
                    value={draft}
                    rows={2}
                    placeholder={placeholder}
                    onBlur={() => onCommit(draft)}
                    onChange={event => setDraft(event.target.value)}
                />
            );
        }

        return (
            <Input
                autoFocus
                value={draft}
                placeholder={placeholder}
                onBlur={() => onCommit(draft)}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        onCommit(draft);
                    }
                }}
            />
        );
    }

    return (
        <div
            className={className}
            role="button"
            tabIndex={0}
            onDoubleClick={event => {
                event.stopPropagation();
                onEdit(id);
            }}
            onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onEdit(id);
                }
            }}
        >
            {value || placeholder}
        </div>
    );
}

function FieldPresetPicker({ disabled, onPick, title }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button type="button" variant="outline" size="sm" nativeButton={false} />}
            >
                {title}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {FIELD_PRESETS.map(preset => (
                    <DropdownMenuItem
                        key={preset.id}
                        disabled={disabled}
                        onClick={() => onPick(preset.factory())}
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

function SectionStructureBlock({
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

function TemplateInspector({ form }) {
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

function SectionInspector({ onChange, onDelete, onDuplicate, section }) {
    const t = useTranslations("project.charroi.builder");

    if (!section) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{t("section_panel_title")}</h3>
                    <p className="text-muted-foreground text-sm">
                        {t("section_panel_description")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                        {t("duplicate_section")}
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                        {t("delete_section")}
                    </Button>
                </div>
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

function FieldInspector({ field, onChange, onDelete, onDuplicate, onOptionsChange }) {
    const t = useTranslations("project.charroi.builder");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const hasOptions = field && (field.type === "single_select" || field.type === "multi_select");

    if (!field) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{t("field_panel_title")}</h3>
                    <p className="text-muted-foreground text-sm">{t("field_panel_description")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                        {t("duplicate_field")}
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                        {t("delete_field")}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("field_type_label")}</Label>
                <Select value={field.type} onValueChange={value => onChange("type", value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CHECKLIST_FIELD_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                                {getFieldTypeLabel(type)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("field_label_label")}</Label>
                <Input
                    value={field.label}
                    onChange={event => onChange("label", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("field_description_label")}</Label>
                <Textarea
                    rows={3}
                    value={field.description}
                    onChange={event => onChange("description", event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("field_placeholder_label")}</Label>
                <Input
                    value={field.placeholder}
                    onChange={event => onChange("placeholder", event.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={field.required}
                    onCheckedChange={value => onChange("required", value === true)}
                />
                <Label>{t("field_required_label")}</Label>
            </div>
            {hasOptions && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <Label>{t("options_title")}</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onOptionsChange([...field.options, createChecklistOption()])
                            }
                        >
                            {t("add_option")}
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

                            onOptionsChange(
                                reorderItems(field.options, event.active.id, event.over.id)
                            );
                        }}
                    >
                        <SortableContext
                            items={field.options.map(option => option.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-2">
                                {field.options.map(option => (
                                    <SortableBlock key={option.id} id={option.id}>
                                        {({ attributes, listeners }) => (
                                            <div className="flex flex-col gap-2 p-2">
                                                <div className="flex items-center gap-2">
                                                    <SortableHandle
                                                        attributes={attributes}
                                                        listeners={listeners}
                                                    />
                                                    <Input
                                                        value={option.label}
                                                        onChange={event =>
                                                            onOptionsChange(
                                                                field.options.map(currentOption =>
                                                                    currentOption.id === option.id
                                                                        ? {
                                                                              ...currentOption,
                                                                              label: event.target
                                                                                  .value,
                                                                          }
                                                                        : currentOption
                                                                )
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10" />
                                                    <Input
                                                        value={option.value}
                                                        onChange={event =>
                                                            onOptionsChange(
                                                                field.options.map(currentOption =>
                                                                    currentOption.id === option.id
                                                                        ? {
                                                                              ...currentOption,
                                                                              value: event.target
                                                                                  .value,
                                                                          }
                                                                        : currentOption
                                                                )
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            onOptionsChange(
                                                                field.options.filter(
                                                                    currentOption =>
                                                                        currentOption.id !==
                                                                        option.id
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            {t("delete_option")}
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
        </div>
    );
}

function RuleInspector({
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
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{t("rule_panel_title")}</h3>
                    <p className="text-muted-foreground text-sm">{t("rule_panel_description")}</p>
                </div>
                <div className="flex items-center gap-2">
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
                        <SelectValue />
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
                                const selectedFieldType = fieldOptions.find(
                                    option => option.id === condition.fieldId
                                )?.type;
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
                                                                />
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
                                                                <SelectValue />
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
                                                {!shouldHideValue && (
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
                                                        {needsSecondValue && (
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
                                                        )}
                                                    </div>
                                                )}
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

function BuilderCanvas({
    activeEditor,
    onCommitFieldMeta,
    onCommitSectionMeta,
    onFieldSelect,
    onInlineEdit,
    onSectionSelect,
    schema,
    selectedFieldId,
    selectedSectionId,
}) {
    const t = useTranslations("project.charroi.builder");
    const previewResponses = useMemo(() => createInitialResponses(schema), [schema]);

    return (
        <div className="flex flex-col gap-4">
            {schema.sections.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-sm">
                    {t("empty_canvas")}
                </div>
            ) : (
                schema.sections.map(section => (
                    <div
                        key={section.id}
                        role="button"
                        tabIndex={0}
                        className={`flex flex-col gap-4 rounded-lg border p-4 ${
                            selectedSectionId === section.id ? "ring-2 ring-ring" : ""
                        }`}
                        onClick={() => onSectionSelect(section.id)}
                        onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onSectionSelect(section.id);
                            }
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <InlineEditableText
                                id={`section-title-${section.id}`}
                                activeEditor={activeEditor}
                                className="font-medium"
                                placeholder={t("section_title_placeholder")}
                                value={section.title}
                                onEdit={onInlineEdit}
                                onCommit={value => onCommitSectionMeta(section.id, "title", value)}
                            />
                            <InlineEditableText
                                id={`section-description-${section.id}`}
                                activeEditor={activeEditor}
                                as="textarea"
                                className="text-muted-foreground text-sm"
                                placeholder={t("section_description_placeholder")}
                                value={section.description}
                                onEdit={onInlineEdit}
                                onCommit={value =>
                                    onCommitSectionMeta(section.id, "description", value)
                                }
                            />
                        </div>
                        {section.fields.map(field => (
                            <div
                                key={field.id}
                                role="button"
                                tabIndex={0}
                                className={`rounded-lg border p-3 ${
                                    selectedFieldId === field.id ? "ring-2 ring-ring" : ""
                                }`}
                                onClick={event => {
                                    event.stopPropagation();
                                    onFieldSelect(field.id);
                                }}
                                onKeyDown={event => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onFieldSelect(field.id);
                                    }
                                }}
                            >
                                {field.type !== "checkbox" ? (
                                    <div className="mb-2 flex flex-col gap-1">
                                        <InlineEditableText
                                            id={`field-label-${field.id}`}
                                            activeEditor={activeEditor}
                                            className="text-sm font-medium"
                                            placeholder={t("field_label_placeholder")}
                                            value={field.label}
                                            onEdit={onInlineEdit}
                                            onCommit={value =>
                                                onCommitFieldMeta(field.id, "label", value)
                                            }
                                        />
                                        <InlineEditableText
                                            id={`field-description-${field.id}`}
                                            activeEditor={activeEditor}
                                            as="textarea"
                                            className="text-muted-foreground text-sm"
                                            placeholder={t("field_description_placeholder")}
                                            value={field.description}
                                            onEdit={onInlineEdit}
                                            onCommit={value =>
                                                onCommitFieldMeta(field.id, "description", value)
                                            }
                                        />
                                    </div>
                                ) : null}
                                <ChecklistFormRenderer
                                    className="gap-0"
                                    disabled
                                    hideFieldMeta
                                    schema={{
                                        sections: [
                                            {
                                                id: section.id,
                                                title: "",
                                                description: "",
                                                fields: [field],
                                            },
                                        ],
                                    }}
                                    responses={previewResponses}
                                    selectPlaceholder={t("select_placeholder")}
                                />
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

function JsonEditorTab({ errorMessage, onChange, value }) {
    const t = useTranslations("project.charroi.builder");

    return (
        <div className="flex flex-col gap-3">
            <Label>{t("json_tab_title")}</Label>
            <Textarea rows={24} value={value} onChange={event => onChange(event.target.value)} />
            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
        </div>
    );
}

function BuilderTabNavigation({ activeTab, onChange }) {
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

function ChecklistTemplateBuilderInner({ categories, template }) {
    const t = useTranslations("project.charroi.builder");
    const { execute, isPending } = useServerAction();
    const router = useRouter();
    const formSchema = createBuilderFormSchema(t);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: getTemplateFormDefaults(template, DEFAULT_TEMPLATE_SCHEMA),
    });
    const sectionsArray = useFieldArray({
        control: form.control,
        keyName: "formKey",
        name: "sections",
    });
    const rulesArray = useFieldArray({
        control: form.control,
        keyName: "formKey",
        name: "rules",
    });
    const sections =
        useWatch({
            control: form.control,
            name: "sections",
        }) ?? [];
    const rules =
        useWatch({
            control: form.control,
            name: "rules",
        }) ?? [];
    const [activeTab, setActiveTab] = useState("visual");
    const [inlineEditor, setInlineEditor] = useState(null);
    const [jsonError, setJsonError] = useState("");
    const [jsonValue, setJsonValue] = useState(() =>
        serializeSchema(
            safelyBuildSchema(getTemplateFormDefaults(template, DEFAULT_TEMPLATE_SCHEMA))
        )
    );
    const [previewMode, setPreviewMode] = useState("desktop");
    const [selection, setSelection] = useState({ kind: "template" });
    const [version, setVersion] = useState(template?.version ?? 1);
    const sectionsSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        })
    );
    const currentSchema = useMemo(() => safelyBuildSchema({ sections, rules }), [rules, sections]);
    const fieldOptions = useMemo(
        () =>
            currentSchema.sections.flatMap(section =>
                section.fields.map(field => ({
                    id: field.id,
                    label: field.label,
                    sectionId: section.id,
                    sectionTitle: section.title,
                    type: field.type,
                }))
            ),
        [currentSchema]
    );

    useEffect(() => {
        if (activeTab === "json" && jsonError) {
            return;
        }

        setJsonValue(serializeSchema(currentSchema));
    }, [activeTab, currentSchema, jsonError]);

    useEffect(() => {
        if (selection.kind === "section") {
            const stillExists = sections.some(section => section.id === selection.id);

            if (!stillExists) {
                setSelection({ kind: "template" });
            }
        }

        if (selection.kind === "field") {
            const location = getFieldLocation(sections, selection.id);

            if (!location) {
                setSelection({ kind: "template" });
            }
        }

        if (selection.kind === "rule") {
            const stillExists = rules.some(rule => rule.id === selection.id);

            if (!stillExists) {
                setSelection({ kind: "template" });
            }
        }
    }, [rules, sections, selection]);

    useUnsavedChangesGuard(form.formState.isDirty, t("unsaved_changes_message"));

    const updateSection = (sectionId, updater) => {
        const sectionIndex = sections.findIndex(section => section.id === sectionId);

        if (sectionIndex === -1) {
            return;
        }

        const currentSection = sections[sectionIndex];
        form.setValue(`sections.${sectionIndex}`, updater(currentSection), {
            shouldDirty: true,
        });
    };

    const updateRules = updater => {
        const nextRules = updater(rules);

        rulesArray.replace(nextRules);
        form.setValue("rules", nextRules, {
            shouldDirty: true,
        });
    };

    const updateField = (fieldId, updater) => {
        const location = getFieldLocation(sections, fieldId);

        if (!location) {
            return;
        }

        const currentField = sections[location.sectionIndex].fields[location.fieldIndex];
        form.setValue(
            `sections.${location.sectionIndex}.fields.${location.fieldIndex}`,
            updater(currentField),
            {
                shouldDirty: true,
            }
        );
    };

    const selectedSection =
        selection.kind === "section"
            ? (sections.find(section => section.id === selection.id) ?? null)
            : null;
    const selectedField =
        selection.kind === "field"
            ? (sections
                  .flatMap(section => section.fields)
                  .find(field => field.id === selection.id) ?? null)
            : null;
    const selectedRule =
        selection.kind === "rule" ? (rules.find(rule => rule.id === selection.id) ?? null) : null;

    const onSave = async values => {
        let schemaJson;

        try {
            schemaJson = buildSchemaFromValues({
                sections: values.sections,
                rules: values.rules,
            });
            setJsonError("");
        } catch (error) {
            const message = error?.issues?.[0]?.message ?? t("validation_schema_invalid");
            setJsonError(message);
            setActiveTab("json");
            toast.error(message);
            return;
        }

        const result = await execute(
            () =>
                template
                    ? updateChecklistTemplateAction({
                          templateId: template.id,
                          name: values.name,
                          description: values.description ?? "",
                          isActive: values.isActive,
                          schemaJson,
                      })
                    : createChecklistTemplateAction({
                          name: values.name,
                          description: values.description ?? "",
                          isActive: values.isActive,
                          schemaJson,
                      }),
            {
                successMessage: template ? t("save_success_update") : t("save_success_create"),
                refreshOnSuccess: false,
            }
        );

        if (!result.success) {
            return;
        }

        if (!template) {
            router.replace(`/dashboard/charroi/checklists/${result.data.id}/edit`);
            return;
        }

        setVersion(result.data?.version ?? version + 1);
        form.reset({
            ...values,
            sections: schemaJson.sections,
            rules: schemaJson.rules,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">
                            {template ? template.name : t("create_page_title")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {t("header_summary", {
                                sections: currentSchema.sections.length,
                                fields: currentSchema.sections.reduce(
                                    (total, section) => total + section.fields.length,
                                    0
                                ),
                                rules: currentSchema.rules.length,
                                categories: getReferencedCategoryCount(currentSchema),
                                version,
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (
                                    form.formState.isDirty &&
                                    !window.confirm(t("unsaved_changes_message"))
                                ) {
                                    return;
                                }

                                router.push("/dashboard/charroi/checklists");
                            }}
                        >
                            {t("back_button")}
                        </Button>
                        <Button type="submit" disabled={isPending || Boolean(jsonError)}>
                            {isPending ? t("saving") : t("save_button")}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <BuilderTabNavigation activeTab={activeTab} onChange={setActiveTab} />

                    {activeTab === "visual" ? (
                        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3 rounded-lg border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="font-medium">{t("structure_title")}</h2>
                                            <p className="text-muted-foreground text-sm">
                                                {t("structure_description")}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const nextSection = createChecklistSection({
                                                    fields: [],
                                                });
                                                sectionsArray.append(nextSection);
                                                setSelection({
                                                    kind: "section",
                                                    id: nextSection.id,
                                                });
                                            }}
                                        >
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
                                                if (
                                                    !event.over ||
                                                    event.active.id === event.over.id
                                                ) {
                                                    return;
                                                }

                                                const oldIndex = sections.findIndex(
                                                    section => section.id === event.active.id
                                                );
                                                const newIndex = sections.findIndex(
                                                    section => section.id === event.over.id
                                                );

                                                if (oldIndex !== -1 && newIndex !== -1) {
                                                    sectionsArray.move(oldIndex, newIndex);
                                                }
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
                                                            section={section}
                                                            selectedFieldId={
                                                                selection.kind === "field"
                                                                    ? selection.id
                                                                    : null
                                                            }
                                                            selectedSectionId={
                                                                selection.kind === "section"
                                                                    ? selection.id
                                                                    : null
                                                            }
                                                            onAddField={(sectionId, field) =>
                                                                updateSection(
                                                                    sectionId,
                                                                    currentSection => ({
                                                                        ...currentSection,
                                                                        fields: [
                                                                            ...currentSection.fields,
                                                                            field,
                                                                        ],
                                                                    })
                                                                )
                                                            }
                                                            onDuplicateField={(
                                                                sectionId,
                                                                fieldId
                                                            ) =>
                                                                updateSection(
                                                                    sectionId,
                                                                    currentSection => {
                                                                        const fieldIndex =
                                                                            currentSection.fields.findIndex(
                                                                                field =>
                                                                                    field.id ===
                                                                                    fieldId
                                                                            );

                                                                        if (fieldIndex === -1) {
                                                                            return currentSection;
                                                                        }

                                                                        const nextFields = [
                                                                            ...currentSection.fields,
                                                                        ];
                                                                        nextFields.splice(
                                                                            fieldIndex + 1,
                                                                            0,
                                                                            duplicateField(
                                                                                currentSection
                                                                                    .fields[
                                                                                    fieldIndex
                                                                                ]
                                                                            )
                                                                        );

                                                                        return {
                                                                            ...currentSection,
                                                                            fields: nextFields,
                                                                        };
                                                                    }
                                                                )
                                                            }
                                                            onFieldDelete={(sectionId, fieldId) =>
                                                                updateSection(
                                                                    sectionId,
                                                                    currentSection => ({
                                                                        ...currentSection,
                                                                        fields: currentSection.fields.filter(
                                                                            field =>
                                                                                field.id !== fieldId
                                                                        ),
                                                                    })
                                                                )
                                                            }
                                                            onFieldMove={(
                                                                sectionId,
                                                                activeId,
                                                                overId
                                                            ) =>
                                                                updateSection(
                                                                    sectionId,
                                                                    currentSection => ({
                                                                        ...currentSection,
                                                                        fields: reorderItems(
                                                                            currentSection.fields,
                                                                            activeId,
                                                                            overId
                                                                        ),
                                                                    })
                                                                )
                                                            }
                                                            onSectionDelete={sectionId => {
                                                                const sectionIndex =
                                                                    sections.findIndex(
                                                                        section =>
                                                                            section.id === sectionId
                                                                    );

                                                                if (sectionIndex !== -1) {
                                                                    sectionsArray.remove(
                                                                        sectionIndex
                                                                    );
                                                                }
                                                            }}
                                                            onSectionDuplicate={sectionId => {
                                                                const sectionIndex =
                                                                    sections.findIndex(
                                                                        section =>
                                                                            section.id === sectionId
                                                                    );

                                                                if (sectionIndex !== -1) {
                                                                    sectionsArray.insert(
                                                                        sectionIndex + 1,
                                                                        duplicateSection(
                                                                            sections[sectionIndex]
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            onSelectField={fieldId =>
                                                                setSelection({
                                                                    kind: "field",
                                                                    id: fieldId,
                                                                })
                                                            }
                                                            onSelectSection={sectionId =>
                                                                setSelection({
                                                                    kind: "section",
                                                                    id: sectionId,
                                                                })
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 rounded-lg border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="font-medium">{t("rules_title")}</h2>
                                            <p className="text-muted-foreground text-sm">
                                                {t("rules_description")}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const nextRule = createChecklistRule();
                                                rulesArray.append(nextRule);
                                                setSelection({ kind: "rule", id: nextRule.id });
                                            }}
                                        >
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
                                            selectedRuleId={
                                                selection.kind === "rule" ? selection.id : null
                                            }
                                            onDuplicateRule={ruleId => {
                                                const ruleIndex = rules.findIndex(
                                                    rule => rule.id === ruleId
                                                );

                                                if (ruleIndex !== -1) {
                                                    rulesArray.insert(
                                                        ruleIndex + 1,
                                                        duplicateRule(rules[ruleIndex])
                                                    );
                                                }
                                            }}
                                            onRuleDelete={ruleId => {
                                                const ruleIndex = rules.findIndex(
                                                    rule => rule.id === ruleId
                                                );

                                                if (ruleIndex !== -1) {
                                                    rulesArray.remove(ruleIndex);
                                                }
                                            }}
                                            onRuleMove={(activeId, overId) => {
                                                const oldIndex = rules.findIndex(
                                                    rule => rule.id === activeId
                                                );
                                                const newIndex = rules.findIndex(
                                                    rule => rule.id === overId
                                                );

                                                if (oldIndex !== -1 && newIndex !== -1) {
                                                    rulesArray.move(oldIndex, newIndex);
                                                }
                                            }}
                                            onRuleSelect={ruleId =>
                                                setSelection({ kind: "rule", id: ruleId })
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 rounded-lg border p-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-medium">{t("canvas_title")}</h2>
                                    <p className="text-muted-foreground text-sm">
                                        {t("canvas_description")}
                                    </p>
                                </div>
                                <BuilderCanvas
                                    activeEditor={inlineEditor}
                                    schema={currentSchema}
                                    selectedFieldId={
                                        selection.kind === "field" ? selection.id : null
                                    }
                                    selectedSectionId={
                                        selection.kind === "section" ? selection.id : null
                                    }
                                    onFieldSelect={fieldId =>
                                        setSelection({ kind: "field", id: fieldId })
                                    }
                                    onInlineEdit={setInlineEditor}
                                    onSectionSelect={sectionId =>
                                        setSelection({ kind: "section", id: sectionId })
                                    }
                                    onCommitFieldMeta={(fieldId, key, value) => {
                                        updateField(fieldId, field => ({
                                            ...field,
                                            [key]: value,
                                        }));
                                        setInlineEditor(null);
                                    }}
                                    onCommitSectionMeta={(sectionId, key, value) => {
                                        updateSection(sectionId, section => ({
                                            ...section,
                                            [key]: value,
                                        }));
                                        setInlineEditor(null);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <TemplateInspector form={form} />
                                {selection.kind === "section" ? (
                                    <SectionInspector
                                        section={selectedSection}
                                        onChange={(key, value) =>
                                            updateSection(selectedSection.id, currentSection => ({
                                                ...currentSection,
                                                [key]: value,
                                            }))
                                        }
                                        onDelete={() => {
                                            const sectionIndex = sections.findIndex(
                                                section => section.id === selectedSection.id
                                            );

                                            if (sectionIndex !== -1) {
                                                sectionsArray.remove(sectionIndex);
                                            }
                                        }}
                                        onDuplicate={() => {
                                            const sectionIndex = sections.findIndex(
                                                section => section.id === selectedSection.id
                                            );

                                            if (sectionIndex !== -1) {
                                                sectionsArray.insert(
                                                    sectionIndex + 1,
                                                    duplicateSection(selectedSection)
                                                );
                                            }
                                        }}
                                    />
                                ) : null}
                                {selection.kind === "field" ? (
                                    <FieldInspector
                                        field={selectedField}
                                        onChange={(key, value) =>
                                            updateField(selectedField.id, field => {
                                                if (key === "type") {
                                                    return normalizeFieldForType(field, value);
                                                }

                                                return {
                                                    ...field,
                                                    [key]: value,
                                                };
                                            })
                                        }
                                        onDelete={() => {
                                            const location = getFieldLocation(
                                                sections,
                                                selectedField.id
                                            );

                                            if (!location) {
                                                return;
                                            }

                                            updateSection(
                                                sections[location.sectionIndex].id,
                                                currentSection => ({
                                                    ...currentSection,
                                                    fields: currentSection.fields.filter(
                                                        field => field.id !== selectedField.id
                                                    ),
                                                })
                                            );
                                        }}
                                        onDuplicate={() => {
                                            const location = getFieldLocation(
                                                sections,
                                                selectedField.id
                                            );

                                            if (!location) {
                                                return;
                                            }

                                            updateSection(
                                                sections[location.sectionIndex].id,
                                                currentSection => {
                                                    const nextFields = [...currentSection.fields];
                                                    nextFields.splice(
                                                        location.fieldIndex + 1,
                                                        0,
                                                        duplicateField(selectedField)
                                                    );

                                                    return {
                                                        ...currentSection,
                                                        fields: nextFields,
                                                    };
                                                }
                                            );
                                        }}
                                        onOptionsChange={nextOptions =>
                                            updateField(selectedField.id, field => ({
                                                ...field,
                                                options: nextOptions,
                                            }))
                                        }
                                    />
                                ) : null}
                                {selection.kind === "rule" ? (
                                    <RuleInspector
                                        categories={categories}
                                        fieldOptions={fieldOptions}
                                        rule={selectedRule}
                                        onChange={(key, value) =>
                                            updateRules(currentRules =>
                                                currentRules.map(rule =>
                                                    rule.id === selectedRule.id
                                                        ? {
                                                              ...rule,
                                                              [key]: value,
                                                          }
                                                        : rule
                                                )
                                            )
                                        }
                                        onConditionsChange={nextConditions =>
                                            updateRules(currentRules =>
                                                currentRules.map(rule =>
                                                    rule.id === selectedRule.id
                                                        ? {
                                                              ...rule,
                                                              conditions: nextConditions,
                                                          }
                                                        : rule
                                                )
                                            )
                                        }
                                        onDelete={() => {
                                            const ruleIndex = rules.findIndex(
                                                rule => rule.id === selectedRule.id
                                            );

                                            if (ruleIndex !== -1) {
                                                rulesArray.remove(ruleIndex);
                                            }
                                        }}
                                        onDuplicate={() => {
                                            const ruleIndex = rules.findIndex(
                                                rule => rule.id === selectedRule.id
                                            );

                                            if (ruleIndex !== -1) {
                                                rulesArray.insert(
                                                    ruleIndex + 1,
                                                    duplicateRule(selectedRule)
                                                );
                                            }
                                        }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {activeTab === "preview" ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={previewMode === "desktop" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreviewMode("desktop")}
                                >
                                    {t("preview_desktop")}
                                </Button>
                                <Button
                                    type="button"
                                    variant={previewMode === "mobile" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreviewMode("mobile")}
                                >
                                    {t("preview_mobile")}
                                </Button>
                            </div>
                            <div
                                className={`rounded-lg border p-4 ${
                                    previewMode === "mobile" ? "mx-auto w-full max-w-md" : "w-full"
                                }`}
                            >
                                <ChecklistFormRenderer
                                    disabled
                                    schema={currentSchema}
                                    responses={createInitialResponses(currentSchema)}
                                    selectPlaceholder={t("select_placeholder")}
                                />
                            </div>
                        </div>
                    ) : null}

                    {activeTab === "json" ? (
                        <JsonEditorTab
                            value={jsonValue}
                            errorMessage={jsonError}
                            onChange={value => {
                                setJsonValue(value);

                                try {
                                    const parsed = parseSchemaText(value);
                                    setJsonError("");
                                    sectionsArray.replace(parsed.sections);
                                    rulesArray.replace(parsed.rules);
                                } catch (error) {
                                    setJsonError(
                                        error?.issues?.[0]?.message ??
                                            t("validation_schema_invalid")
                                    );
                                }
                            }}
                        />
                    ) : null}
                </div>
            </form>
        </Form>
    );
}

export function ChecklistTemplateBuilder(props) {
    return <ChecklistTemplateBuilderInner {...props} />;
}
