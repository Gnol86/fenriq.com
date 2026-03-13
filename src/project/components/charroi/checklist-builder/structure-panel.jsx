"use client";

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SectionStructureBlock } from "./section-structure-block";

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
