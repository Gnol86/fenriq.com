"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    createChecklistCategoryAction,
    updateChecklistCategoryAction,
} from "@project/actions/charroi.action";
import { checklistCategoryInputSchema } from "@project/lib/charroi/template-schema";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";

export function CategoryFormDialog({ canManage, category = null, trigger = null }) {
    const t = useTranslations("project.charroi.categories");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(checklistCategoryInputSchema),
        defaultValues: {
            name: category?.name ?? "",
            description: category?.description ?? "",
            defaultDeliveryMode: category?.defaultDeliveryMode ?? "IMMEDIATE",
            defaultDigestCron: category?.defaultDigestCron ?? "",
            timeZone: category?.timeZone ?? "Europe/Brussels",
            isActive: category?.isActive ?? true,
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.reset({
            name: category?.name ?? "",
            description: category?.description ?? "",
            defaultDeliveryMode: category?.defaultDeliveryMode ?? "IMMEDIATE",
            defaultDigestCron: category?.defaultDigestCron ?? "",
            timeZone: category?.timeZone ?? "Europe/Brussels",
            isActive: category?.isActive ?? true,
        });
    }, [category, form, open]);

    if (!canManage) {
        return null;
    }

    const onSubmit = async values => {
        const result = await execute(
            () =>
                category
                    ? updateChecklistCategoryAction({
                          categoryId: category.id,
                          ...values,
                      })
                    : createChecklistCategoryAction(values),
            {
                successMessage: category ? t("category_updated") : t("category_created"),
            }
        );

        if (result.success) {
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger render={trigger} />
            ) : (
                <DialogTrigger nativeButton render={<Button size="sm" />}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("create_button")}
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? t("edit_title") : t("create_title")}</DialogTitle>
                    <DialogDescription>
                        {category ? t("edit_description") : t("create_description")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("name_label")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} />
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
                                        <Textarea {...field} disabled={isPending} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="defaultDeliveryMode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("delivery_mode_label")}</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {field.value === "IMMEDIATE"
                                                        ? t("delivery_mode_immediate")
                                                        : t("delivery_mode_digest")}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="IMMEDIATE">
                                                {t("delivery_mode_immediate")}
                                            </SelectItem>
                                            <SelectItem value="DIGEST">
                                                {t("delivery_mode_digest")}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="defaultDigestCron"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("digest_cron_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t("digest_cron_placeholder")}
                                            disabled={isPending}
                                        />
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
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="flex flex-col gap-1">
                                        <FormLabel>{t("active_label")}</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="timeZone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("timezone_label")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {category ? t("save_button") : t("create_button")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
