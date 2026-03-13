"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createChecklistOption } from "@project/lib/charroi/checklist-builder-defaults";
import { reorderItems } from "@project/lib/charroi/checklist-builder-utils";
import { CHECKLIST_FIELD_TYPES } from "@project/lib/charroi/constants";
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
import { SortableBlock } from "./sortable-block";
import { SortableHandle } from "./sortable-handle";

export function FieldInspectorForm({
    field,
    getFieldTypeLabel,
    onChange,
    onDelete,
    onDuplicate,
    onOptionsChange,
}) {
    const t = useTranslations("project.charroi.builder");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const hasOptions = field && (field.type === "single_select" || field.type === "multi_select");
    const hasPhotoCommentOption = field?.type === "photo";

    if (!field) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                    {t("duplicate_field")}
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                    {t("delete_field")}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{t("field_type_label")}</Label>
                <Select value={field.type} onValueChange={value => onChange("type", value)}>
                    <SelectTrigger>
                        <SelectValue>{getFieldTypeLabel(field.type)}</SelectValue>
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
            {hasPhotoCommentOption ? (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={field.photoCommentRequired === true}
                        onCheckedChange={value => onChange("photoCommentRequired", value === true)}
                    />
                    <Label>{t("photo_comment_required_label")}</Label>
                </div>
            ) : null}
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
                        id={`checklist-builder-field-${field.id}-options-dnd`}
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
