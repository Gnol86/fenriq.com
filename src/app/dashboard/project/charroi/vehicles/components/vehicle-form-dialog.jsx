"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createVehicleAction, updateVehicleAction } from "@project/actions/charroi.action";
import { checklistVehicleInputSchema } from "@project/lib/charroi/template-schema";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useServerAction } from "@/hooks/use-server-action";

export function VehicleFormDialog({ canManage, trigger, vehicle = null }) {
    const t = useTranslations("project.charroi.vehicles");
    const formSchema = checklistVehicleInputSchema.extend({
        plateNumber: z.string().trim().min(1, t("validation_plate_required")),
    });
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            plateNumber: vehicle?.plateNumber ?? "",
            name: vehicle?.name ?? "",
            brand: vehicle?.brand ?? "",
            model: vehicle?.model ?? "",
            isActive: vehicle?.isActive ?? true,
        },
    });

    if (!canManage) {
        return null;
    }

    const onSubmit = async values => {
        const result = await execute(
            () =>
                vehicle
                    ? updateVehicleAction({
                          vehicleId: vehicle.id,
                          ...values,
                      })
                    : createVehicleAction(values),
            {
                successMessage: vehicle ? t("vehicle_updated") : t("vehicle_created"),
            }
        );

        if (!result.success) {
            return;
        }

        setOpen(false);
        if (!vehicle) {
            form.reset({
                plateNumber: "",
                name: "",
                brand: "",
                model: "",
                isActive: true,
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={nextOpen => {
                setOpen(nextOpen);
                if (nextOpen) {
                    form.reset({
                        plateNumber: vehicle?.plateNumber ?? "",
                        name: vehicle?.name ?? "",
                        brand: vehicle?.brand ?? "",
                        model: vehicle?.model ?? "",
                        isActive: vehicle?.isActive ?? true,
                    });
                }
            }}
        >
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
                    <DialogTitle>{vehicle ? t("edit_title") : t("create_title")}</DialogTitle>
                    <DialogDescription>
                        {vehicle ? t("edit_description") : t("create_description")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="plateNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("plate_label")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("brand_label")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} />
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
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("model_label")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {vehicle ? t("save_button") : t("create_button")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
