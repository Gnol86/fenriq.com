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

export default function PlanForm({ plan = null, trigger = null }) {
    const t = useTranslations("admin.plans");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);

    const isEditMode = !!plan;

    const formSchema = z.object({
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

    // Préparer les limites pour le mode édition
    const parsedLimits = plan?.limits
        ? Object.entries(JSON.parse(plan.limits)).map(([name, value]) => ({
              name,
              value: value.toString(),
          }))
        : [];

    // Préparer le freeTrial pour le mode édition
    const parsedFreeTrial = plan?.freeTrial ? JSON.parse(plan.freeTrial).days.toString() : "";

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
        // Convertir les limites en objet
        const limitsObject = values.limits.reduce((acc, limit) => {
            acc[limit.name] = parseInt(limit.value, 10);
            return acc;
        }, {});

        const actionData = {
            name: values.name,
            description: values.description || null,
            priceId: values.priceId,
            annualDiscountPriceId: values.annualDiscountPriceId || null,
            limits: limitsObject,
            freeTrial: values.freeTrial || null,
            showInPricingPage: values.showInPricingPage,
        };

        await execute(
            () =>
                isEditMode
                    ? updatePlanAction({ planId: plan.id, ...actionData })
                    : createPlanAction(actionData),
            {
                successMessage: isEditMode ? t("success_updated") : t("success_created"),
                errorMessage: isEditMode ? t("error_update") : t("error_create"),
            }
        );

        // Fermer le dialog et réinitialiser le formulaire après succès
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
                        {/* Nom du plan */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form_name_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("form_name_placeholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
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
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("form_description_description")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price ID */}
                        <FormField
                            control={form.control}
                            name="priceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form_price_id_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("form_price_id_placeholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("form_price_id_description")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Annual Discount Price ID */}
                        <FormField
                            control={form.control}
                            name="annualDiscountPriceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form_annual_discount_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("form_annual_discount_placeholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("form_annual_discount_description")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Free Trial */}
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
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("form_free_trial_description")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Show in Pricing Page */}
                        <FormField
                            control={form.control}
                            name="showInPricingPage"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start gap-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
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

                        {/* Limits */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium">{t("form_limits_title")}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {t("form_limits_description")}
                                </p>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`limits.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                {index === 0 && (
                                                    <FormLabel>
                                                        {t("form_limit_name_placeholder")}
                                                    </FormLabel>
                                                )}
                                                <FormControl>
                                                    <Input
                                                        placeholder={t(
                                                            "form_limit_name_placeholder"
                                                        )}
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
                                                    <FormLabel>
                                                        {t("form_limit_value_placeholder")}
                                                    </FormLabel>
                                                )}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder={t(
                                                            "form_limit_value_placeholder"
                                                        )}
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
                                onClick={() => append({ name: "", value: "" })}
                                className="w-fit"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t("form_add_limit")}
                            </Button>
                        </div>

                        <Button type="submit" disabled={isPending} className="w-fit">
                            {isPending
                                ? isEditMode
                                    ? t("form_submitting_edit")
                                    : t("form_submitting")
                                : isEditMode
                                  ? t("form_submit_button_edit")
                                  : t("form_submit_button")}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
