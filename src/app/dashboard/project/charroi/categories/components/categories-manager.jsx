"use client";

import { deleteChecklistCategoryAction } from "@project/actions/charroi.action";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";
import { CategoryFormDialog } from "./category-form-dialog";

export function CategoriesManager({ canManage, categories, emptyMessage }) {
    const t = useTranslations("project.charroi.categories");

    const handleDelete = category => {
        dialogManager.confirm({
            title: t("delete_title"),
            description: t("delete_description", { name: category.name }),
            action: {
                label: t("delete_button"),
                variant: "destructive",
                onClick: async () => {
                    await deleteChecklistCategoryAction({
                        categoryId: category.id,
                    });
                },
                successMessage: t("category_deleted"),
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                <CategoryFormDialog canManage={canManage} />
            </div>
            <div className="flex flex-col gap-3">
                {categories.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {emptyMessage ?? t("empty_state")}
                    </p>
                ) : (
                    categories.map(category => (
                        <div
                            key={category.id}
                            className="flex items-start justify-between gap-4 rounded-lg border p-4"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">{category.name}</span>
                                <span className="text-muted-foreground text-sm">
                                    {category.description || t("no_description")}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {category.defaultDeliveryMode === "IMMEDIATE"
                                        ? t("delivery_mode_immediate")
                                        : `${t("delivery_mode_digest")} - ${
                                              category.defaultDigestCron || t("no_cron")
                                          }`}
                                </span>
                            </div>
                            {canManage && (
                                <ButtonGroup>
                                    <CategoryFormDialog
                                        canManage={canManage}
                                        category={category}
                                        trigger={
                                            <Button variant="outline" size="icon-sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={() => handleDelete(category)}
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
