"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TemplateSettingsPanel({ form, readOnly = false }) {
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
                            <Input {...field} disabled={readOnly} />
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
                            <Textarea {...field} disabled={readOnly} rows={3} />
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
                            <Checkbox
                                checked={field.value}
                                disabled={readOnly}
                                onCheckedChange={field.onChange}
                            />
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
