"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldPresetPicker } from "./field-preset-picker";
import { SortableBlock } from "./sortable-block";
import { SortableHandle } from "./sortable-handle";

export function SectionStructureBlock({
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
                        id={`checklist-builder-section-${section.id}-fields-dnd`}
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
