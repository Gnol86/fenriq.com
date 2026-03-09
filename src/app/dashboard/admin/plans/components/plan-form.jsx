"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { createPlanAction, updatePlanAction } from "@/actions/plan.action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";

function createPlanSchema(t) {
    return z.object({
        name: z.string().min(1, t("validation_name_required")).min(2, t("validation_name_min")),
        description: z.string().optional(),
        priceId: z
            .string()
            .min(1, t("validation_price_id_required"))
            .startsWith("price_", t("validation_price_id_format")),
        annualDiscountPriceId: z
            .string()
            .optional()
            .refine(val => !val || val.startsWith("price_"), t("validation_price_id_format")),
        freeTrial: z
            .string()
            .optional()
            .refine(val => !val || parseInt(val, 10) > 0, t("validation_free_trial_positive")),
        showInPricingPage: z.boolean().default(true),
        limits: z.array(
            z.object({
                name: z.string().min(1, t("validation_limit_name_required")),
                value: z
                    .string()
                    .min(1, t("validation_limit_value_required"))
                    .refine(val => parseInt(val, 10) > 0, t("validation_limit_value_positive")),
            })
        ),
    });
}

function parsePlanLimits(plan) {
    if (!plan?.limits) {
        return [];
    }

    try {
        return Object.entries(JSON.parse(plan.limits)).map(([name, value]) => ({
            name,
            value: value.toString(),
        }));
    } catch (error) {
        console.error("Failed to parse plan limits", error);
        return [];
    }
}

function parseFreeTrial(plan) {
    if (!plan?.freeTrial) {
        return "";
    }

    try {
        return JSON.parse(plan.freeTrial).days?.toString() ?? "";
    } catch (error) {
        console.error("Failed to parse free trial", error);
        return "";
    }
}

function getActionData(values) {
    const limits = values.limits.reduce((acc, limit) => {
        acc[limit.name] = parseInt(limit.value, 10);
        return acc;
    }, {});

    const description = values.description.trim();
    const annualDiscountPriceId = values.annualDiscountPriceId.trim();
    const freeTrial = values.freeTrial.trim();

    return {
        name: values.name,
        description: description ? description : null,
        priceId: values.priceId,
        annualDiscountPriceId: annualDiscountPriceId ? annualDiscountPriceId : null,
        limits,
        freeTrial: freeTrial ? freeTrial : null,
        showInPricingPage: values.showInPricingPage,
    };
}

function PlanBasicFields({ form, t, isPending }) {
    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("form_name_label")}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t("form_name_placeholder")}
                                disabled={isPending}
                                {...field}
                            />
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
                        <FormLabel>{t("form_description_label")}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t("form_description_placeholder")}
                                rows={4}
                                disabled={isPending}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t("form_description_description")}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="priceId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("form_price_id_label")}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t("form_price_id_placeholder")}
                                disabled={isPending}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t("form_price_id_description")}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="annualDiscountPriceId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("form_annual_discount_label")}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t("form_annual_discount_placeholder")}
                                disabled={isPending}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t("form_annual_discount_description")}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="freeTrial"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("form_free_trial_label")}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder={t("form_free_trial_placeholder")}
                                disabled={isPending}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t("form_free_trial_description")}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="showInPricingPage"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isPending}
                            />
                        </FormControl>
                        <div className="flex flex-col gap-1">
                            <FormLabel>{t("form_show_in_pricing_label")}</FormLabel>
                            <FormDescription>
                                {t("form_show_in_pricing_description")}
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </>
    );
}

function PlanLimitsFields({ form, fields, append, remove, t, isPending }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">{t("form_limits_title")}</h3>
                <p className="text-muted-foreground text-sm">{t("form_limits_description")}</p>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name={`limits.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                {index === 0 && (
                                    <FormLabel>{t("form_limit_name_placeholder")}</FormLabel>
                                )}
                                <FormControl>
                                    <Input
                                        placeholder={t("form_limit_name_placeholder")}
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`limits.${index}.value`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                {index === 0 && (
                                    <FormLabel>{t("form_limit_value_placeholder")}</FormLabel>
                                )}
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder={t("form_limit_value_placeholder")}
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        disabled={isPending}
                        onClick={() => remove(index)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => append({ name: "", value: "" })}
                className="w-fit"
            >
                <Plus className="mr-2 h-4 w-4" />
                {t("form_add_limit")}
            </Button>
        </div>
    );
}

function PlanSubmitButton({ isEditMode, isPending, t }) {
    const label = isPending
        ? isEditMode
            ? t("form_submitting_edit")
            : t("form_submitting")
        : isEditMode
          ? t("form_submit_button_edit")
          : t("form_submit_button");

    return (
        <Button type="submit" disabled={isPending} className="w-fit">
            {label}
        </Button>
    );
}

export default function PlanForm({ plan = null, trigger = null }) {
    const t = useTranslations("admin.plans");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const isEditMode = !!plan;
    const formSchema = createPlanSchema(t);
    const parsedLimits = parsePlanLimits(plan);
    const parsedFreeTrial = parseFreeTrial(plan);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: plan?.name ?? "",
            description: plan?.description ?? "",
            priceId: plan?.priceId ?? "",
            annualDiscountPriceId: plan?.annualDiscountPriceId ?? "",
            freeTrial: parsedFreeTrial,
            showInPricingPage: plan?.showInPricingPage ?? true,
            limits: parsedLimits,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "limits",
    });

    const onSubmit = async values => {
        const actionData = getActionData(values);

        const result = await execute(
            () =>
                isEditMode
                    ? updatePlanAction({ planId: plan.id, ...actionData })
                    : createPlanAction(actionData),
            {
                successMessage: isEditMode ? t("success_updated") : t("success_created"),
                errorMessage: isEditMode ? t("error_update") : t("error_create"),
            }
        );

        if (!result.success) {
            return;
        }

        setOpen(false);
        if (!isEditMode) {
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger render={trigger} />
            ) : (
                <DialogTrigger nativeButton render={<Button size="icon" />}>
                    <Plus />
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t("form_title_edit") : t("form_title")}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? t("form_description_edit") : t("form_description")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <PlanBasicFields form={form} t={t} isPending={isPending} />
                        <PlanLimitsFields
                            form={form}
                            fields={fields}
                            append={append}
                            remove={remove}
                            t={t}
                            isPending={isPending}
                        />
                        <PlanSubmitButton isEditMode={isEditMode} isPending={isPending} t={t} />
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
