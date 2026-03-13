"use client";

import { useTranslations } from "next-intl";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";

export function RuleCategoryCombobox({ categories, onChange, value }) {
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
