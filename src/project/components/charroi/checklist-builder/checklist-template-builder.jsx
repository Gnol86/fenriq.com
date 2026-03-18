"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    createChecklistTemplateAction,
    updateChecklistTemplateAction,
} from "@project/actions/charroi.action";
import {
    ChecklistFormRenderer,
    createInitialResponses,
} from "@project/components/charroi/checklist-form/checklist-form-renderer";
import { useUnsavedChangesGuard } from "@project/hooks/use-unsaved-changes-guard";
import {
    createChecklistRule,
    createChecklistSection,
    DEFAULT_TEMPLATE_SCHEMA,
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
import {
    buildChecklistBuilderFieldOptions,
    duplicateField,
    duplicateRule,
    duplicateSection,
    getFieldTypeLabel,
    normalizeFieldForType,
    sanitizeRulesForFieldOptions,
} from "@project/lib/charroi/checklist-template-builder-helpers";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useServerAction } from "@/hooks/use-server-action";
import { BuilderTabNavigation } from "./builder-tab-navigation";
import { JsonEditorTab } from "./json-editor-tab";
import { RulesPanel } from "./rules-panel";
import { SelectedFieldDialog } from "./selected-field-dialog";
import { SelectedRuleDialog } from "./selected-rule-dialog";
import { SelectedSectionDialog } from "./selected-section-dialog";
import { StructurePanel } from "./structure-panel";
import { TemplateSettingsPanel } from "./template-settings-panel";

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

function findItemIndex(items, id) {
    return items.findIndex(item => item.id === id);
}

function resolveSelection(selection, selectedSection, selectedField, selectedRule) {
    if (selection.kind === "section" && selectedSection) {
        return selection;
    }

    if (selection.kind === "field" && selectedField) {
        return selection;
    }

    if (selection.kind === "rule" && selectedRule) {
        return selection;
    }

    return { kind: "template" };
}

export function ChecklistTemplateBuilder({ categories, readOnly = false, template }) {
    const t = useTranslations("project.charroi.builder");
    const { execute, isPending } = useServerAction();
    const router = useRouter();
    const formSchema = createBuilderFormSchema(t);
    const defaultValues = getTemplateFormDefaults(template, DEFAULT_TEMPLATE_SCHEMA);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
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
    const [jsonDraft, setJsonDraft] = useState(() =>
        serializeSchema(safelyBuildSchema(defaultValues))
    );
    const [jsonError, setJsonError] = useState("");
    const [previewMode, setPreviewMode] = useState("desktop");
    const [selection, setSelection] = useState({ kind: "template" });
    const [version, setVersion] = useState(template?.version ?? 1);
    const currentSchema = useMemo(() => safelyBuildSchema({ sections, rules }), [rules, sections]);
    const serializedSchema = useMemo(() => serializeSchema(currentSchema), [currentSchema]);
    const fieldOptions = useMemo(
        () => buildChecklistBuilderFieldOptions(currentSchema),
        [currentSchema]
    );
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
    const resolvedSelection = resolveSelection(
        selection,
        selectedSection,
        selectedField,
        selectedRule
    );
    const selectedSectionId = resolvedSelection.kind === "section" ? resolvedSelection.id : null;
    const selectedFieldId = resolvedSelection.kind === "field" ? resolvedSelection.id : null;
    const selectedRuleId = resolvedSelection.kind === "rule" ? resolvedSelection.id : null;
    const jsonEditorValue = activeTab === "json" && jsonError ? jsonDraft : serializedSchema;

    useUnsavedChangesGuard(form.formState.isDirty, t("unsaved_changes_message"));

    const clearSelection = () => setSelection({ kind: "template" });
    const selectSection = sectionId => setSelection({ kind: "section", id: sectionId });
    const selectField = fieldId => setSelection({ kind: "field", id: fieldId });
    const selectRule = ruleId => setSelection({ kind: "rule", id: ruleId });

    const updateSection = (sectionId, updater) => {
        const sectionIndex = findItemIndex(sections, sectionId);

        if (sectionIndex === -1) {
            return;
        }

        const currentSection = sections[sectionIndex];
        form.setValue(`sections.${sectionIndex}`, updater(currentSection), {
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

    useEffect(() => {
        const nextRules = sanitizeRulesForFieldOptions({
            fieldOptions,
            rules,
        });

        if (JSON.stringify(nextRules) !== JSON.stringify(rules)) {
            rulesArray.replace(nextRules);
            form.setValue("rules", nextRules, {
                shouldDirty: true,
            });
        }
    }, [fieldOptions, form, rules, rulesArray]);

    const updateRules = updater => {
        const nextRules = updater(rules);

        rulesArray.replace(nextRules);
        form.setValue("rules", nextRules, {
            shouldDirty: true,
        });
    };

    const deleteSection = sectionId => {
        const sectionIndex = findItemIndex(sections, sectionId);

        if (sectionIndex !== -1) {
            sectionsArray.remove(sectionIndex);
        }
    };

    const duplicateSectionById = sectionId => {
        const sectionIndex = findItemIndex(sections, sectionId);

        if (sectionIndex !== -1) {
            sectionsArray.insert(sectionIndex + 1, duplicateSection(sections[sectionIndex]));
        }
    };

    const deleteField = (sectionId, fieldId) =>
        updateSection(sectionId, currentSection => ({
            ...currentSection,
            fields: currentSection.fields.filter(field => field.id !== fieldId),
        }));

    const duplicateFieldById = (sectionId, fieldId) =>
        updateSection(sectionId, currentSection => {
            const fieldIndex = findItemIndex(currentSection.fields, fieldId);

            if (fieldIndex === -1) {
                return currentSection;
            }

            const nextFields = [...currentSection.fields];
            nextFields.splice(fieldIndex + 1, 0, duplicateField(currentSection.fields[fieldIndex]));

            return {
                ...currentSection,
                fields: nextFields,
            };
        });

    const deleteSelectedField = () => {
        if (!selectedField) {
            return;
        }

        const location = getFieldLocation(sections, selectedField.id);

        if (!location) {
            return;
        }

        deleteField(sections[location.sectionIndex].id, selectedField.id);
        clearSelection();
    };

    const duplicateSelectedField = () => {
        if (!selectedField) {
            return;
        }

        const location = getFieldLocation(sections, selectedField.id);

        if (!location) {
            return;
        }

        duplicateFieldById(sections[location.sectionIndex].id, selectedField.id);
    };

    const addSection = () => {
        const nextSection = createChecklistSection({
            fields: [],
        });

        sectionsArray.append(nextSection);
        selectSection(nextSection.id);
    };

    const addRule = () => {
        const nextRule = createChecklistRule();

        rulesArray.append(nextRule);
        selectRule(nextRule.id);
    };

    const duplicateRuleById = ruleId => {
        const ruleIndex = findItemIndex(rules, ruleId);

        if (ruleIndex !== -1) {
            rulesArray.insert(ruleIndex + 1, duplicateRule(rules[ruleIndex]));
        }
    };

    const deleteRule = ruleId => {
        const ruleIndex = findItemIndex(rules, ruleId);

        if (ruleIndex !== -1) {
            rulesArray.remove(ruleIndex);
        }
    };

    const updateSelectedRule = (key, value) => {
        if (!selectedRule) {
            return;
        }

        updateRules(currentRules =>
            currentRules.map(rule =>
                rule.id === selectedRule.id
                    ? {
                          ...rule,
                          [key]: value,
                      }
                    : rule
            )
        );
    };

    const updateSelectedRuleConditions = nextConditions => {
        if (!selectedRule) {
            return;
        }

        updateRules(currentRules =>
            currentRules.map(rule =>
                rule.id === selectedRule.id
                    ? {
                          ...rule,
                          conditions: nextConditions,
                      }
                    : rule
            )
        );
    };

    const onTabChange = nextTab => {
        setActiveTab(nextTab);

        if (nextTab !== "visual") {
            if (resolvedSelection.kind !== "template") {
                clearSelection();
            }
        }

        if (nextTab !== "json") {
            setJsonDraft(serializedSchema);
            setJsonError("");
        }
    };

    const onJsonChange = value => {
        if (readOnly) {
            return;
        }

        setJsonDraft(value);

        try {
            const parsed = parseSchemaText(value);
            setJsonError("");
            sectionsArray.replace(parsed.sections);
            rulesArray.replace(parsed.rules);
        } catch (error) {
            setJsonError(error?.issues?.[0]?.message ?? t("validation_schema_invalid"));
        }
    };

    const onSave = async values => {
        if (readOnly) {
            return;
        }

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
            setJsonDraft(serializedSchema);
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
            router.replace(`/dashboard/project/charroi/checklists/${result.data.id}/edit`);
            return;
        }

        setVersion(result.data?.version ?? version + 1);
        setJsonDraft(serializeSchema(schemaJson));
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

                                router.push("/dashboard/project/charroi/checklists");
                            }}
                        >
                            {t("back_button")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={readOnly || isPending || Boolean(jsonError)}
                        >
                            {isPending ? t("saving") : t("save_button")}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <BuilderTabNavigation activeTab={activeTab} onChange={onTabChange} />

                    {activeTab === "visual" ? (
                        <div className="flex flex-col gap-4">
                            <TemplateSettingsPanel form={form} readOnly={readOnly} />

                            <StructurePanel
                                getFieldTypeLabel={getFieldTypeLabel}
                                readOnly={readOnly}
                                sections={sections}
                                selectedFieldId={selectedFieldId}
                                selectedSectionId={selectedSectionId}
                                onAddSection={addSection}
                                onAddField={(sectionId, field) =>
                                    updateSection(sectionId, currentSection => ({
                                        ...currentSection,
                                        fields: [...currentSection.fields, field],
                                    }))
                                }
                                onDuplicateField={duplicateFieldById}
                                onFieldDelete={deleteField}
                                onFieldMove={(sectionId, activeId, overId) =>
                                    updateSection(sectionId, currentSection => ({
                                        ...currentSection,
                                        fields: reorderItems(
                                            currentSection.fields,
                                            activeId,
                                            overId
                                        ),
                                    }))
                                }
                                onSectionDelete={deleteSection}
                                onSectionDuplicate={duplicateSectionById}
                                onSectionsReorder={(activeId, overId) => {
                                    const oldIndex = findItemIndex(sections, activeId);
                                    const newIndex = findItemIndex(sections, overId);

                                    if (oldIndex !== -1 && newIndex !== -1) {
                                        sectionsArray.move(oldIndex, newIndex);
                                    }
                                }}
                                onSelectField={selectField}
                                onSelectSection={selectSection}
                            />

                            <RulesPanel
                                readOnly={readOnly}
                                rules={rules}
                                selectedRuleId={selectedRuleId}
                                onAddRule={addRule}
                                onDeleteRule={ruleId => {
                                    deleteRule(ruleId);

                                    if (ruleId === selectedRuleId) {
                                        clearSelection();
                                    }
                                }}
                                onDuplicateRule={ruleId => duplicateRuleById(ruleId)}
                                onRuleMove={(activeId, overId) => {
                                    const oldIndex = findItemIndex(rules, activeId);
                                    const newIndex = findItemIndex(rules, overId);

                                    if (oldIndex !== -1 && newIndex !== -1) {
                                        rulesArray.move(oldIndex, newIndex);
                                    }
                                }}
                                onRuleSelect={selectRule}
                            />

                            <SelectedRuleDialog
                                categories={categories}
                                fieldOptions={fieldOptions}
                                readOnly={readOnly}
                                selectedRule={selectedRuleId ? selectedRule : null}
                                onChangeRule={updateSelectedRule}
                                onClose={clearSelection}
                                onConditionsChange={updateSelectedRuleConditions}
                                onDeleteRule={ruleId => {
                                    deleteRule(ruleId);
                                    clearSelection();
                                }}
                                onDuplicateRule={ruleId => duplicateRuleById(ruleId)}
                            />

                            <SelectedSectionDialog
                                readOnly={readOnly}
                                section={selectedSectionId ? selectedSection : null}
                                onChange={(key, value) =>
                                    updateSection(selectedSection.id, currentSection => ({
                                        ...currentSection,
                                        [key]: value,
                                    }))
                                }
                                onClose={clearSelection}
                                onDelete={() => {
                                    deleteSection(selectedSection.id);
                                    clearSelection();
                                }}
                                onDuplicate={() => duplicateSectionById(selectedSection.id)}
                            />

                            <SelectedFieldDialog
                                field={selectedFieldId ? selectedField : null}
                                getFieldTypeLabel={getFieldTypeLabel}
                                readOnly={readOnly}
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
                                onClose={clearSelection}
                                onDelete={deleteSelectedField}
                                onDuplicate={duplicateSelectedField}
                                onOptionsChange={nextOptions =>
                                    updateField(selectedField.id, field => ({
                                        ...field,
                                        options: nextOptions,
                                    }))
                                }
                            />
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
                            value={jsonEditorValue}
                            errorMessage={jsonError}
                            readOnly={readOnly}
                            onChange={onJsonChange}
                        />
                    ) : null}
                </div>
            </form>
        </Form>
    );
}
