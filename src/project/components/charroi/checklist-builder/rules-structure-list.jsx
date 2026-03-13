"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SortableBlock } from "./sortable-block";
import { SortableHandle } from "./sortable-handle";

export function RulesStructureList({
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
            id="checklist-builder-rules-dnd"
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
