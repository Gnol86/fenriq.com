"use client";

import {
    deleteChecklistTemplateAction,
    duplicateChecklistTemplateAction,
} from "@project/actions/charroi.action";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export function TemplatesManager({
    canCreate,
    canDelete,
    canDuplicate,
    canEdit,
    createDisabled = false,
    emptyMessage,
    mutationsDisabled = false,
    templates,
}) {
    const t = useTranslations("project.charroi.checklists");
    const { execute } = useServerAction();

    const handleDelete = template => {
        dialogManager.confirm({
            title: t("delete_title"),
            description: t("delete_description", {
                name: template.name,
            }),
            action: {
                label: t("delete_button"),
                variant: "destructive",
                onClick: async () => {
                    await deleteChecklistTemplateAction({
                        templateId: template.id,
                    });
                },
                successMessage: t("template_deleted"),
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {canCreate && (
                <div className="flex items-center justify-end">
                    <Link
                        href={createDisabled ? "#" : "/dashboard/project/charroi/checklists/new"}
                        onClick={event => {
                            if (createDisabled) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <Button size="sm" disabled={createDisabled}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("create_button")}
                        </Button>
                    </Link>
                </div>
            )}
            <div className="flex flex-col gap-3">
                {templates.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {emptyMessage ?? t("empty_state")}
                    </p>
                ) : (
                    templates.map(template => (
                        <div
                            key={template.id}
                            className="flex items-start justify-between gap-4 rounded-lg border p-4"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">{template.name}</span>
                                <span className="text-muted-foreground text-sm">
                                    {template.description || t("no_description")}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {t("summary_line", {
                                        assignments: template.assignmentsCount,
                                        fields: template.fieldsCount,
                                        rules: template.rulesCount,
                                        version: template.version,
                                    })}
                                </span>
                            </div>
                            {(canEdit || canDuplicate || canDelete) && (
                                <ButtonGroup>
                                    {canEdit ? (
                                        mutationsDisabled ? (
                                            <Button size="icon-sm" variant="outline" disabled>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                nativeButton={false}
                                                render={
                                                    <Link
                                                        href={`/dashboard/project/charroi/checklists/${template.id}/edit`}
                                                    />
                                                }
                                                size="icon-sm"
                                                variant="outline"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )
                                    ) : null}
                                    {canDuplicate ? (
                                        <Button
                                            variant="outline"
                                            size="icon-sm"
                                            disabled={mutationsDisabled}
                                            onClick={() =>
                                                execute(
                                                    () =>
                                                        duplicateChecklistTemplateAction({
                                                            templateId: template.id,
                                                        }),
                                                    {
                                                        successMessage: t("template_duplicated"),
                                                    }
                                                )
                                            }
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                    {canDelete ? (
                                        <Button
                                            variant="destructive"
                                            size="icon-sm"
                                            disabled={mutationsDisabled}
                                            onClick={() => handleDelete(template)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </ButtonGroup>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
