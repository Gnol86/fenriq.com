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

export function TemplatesManager({ canCreate, canManage, templates }) {
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
                    <Link href="/dashboard/charroi/checklists/new">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("create_button")}
                        </Button>
                    </Link>
                </div>
            )}
            <div className="flex flex-col gap-3">
                {templates.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("empty_state")}</p>
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
                            {canManage && (
                                <ButtonGroup>
                                    <Link
                                        href={`/dashboard/charroi/checklists/${template.id}/edit`}
                                    >
                                        <Button variant="outline" size="icon-sm">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
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
                                    <Button
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={() => handleDelete(template)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </ButtonGroup>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
