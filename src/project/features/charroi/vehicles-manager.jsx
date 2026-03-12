"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    createChecklistAssignmentAction,
    createVehicleAction,
    deleteChecklistAssignmentAction,
    deleteVehicleAction,
    regenerateChecklistAssignmentTokenAction,
    updateChecklistAssignmentAction,
    updateVehicleAction,
} from "@project/actions/charroi.action";
import { checklistVehicleInputSchema } from "@project/lib/charroi/template-schema";
import { Copy, Link2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServerAction } from "@/hooks/use-server-action";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

function VehicleFormDialog({ canManage, trigger, vehicle = null }) {
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

function VehicleAssignmentsDialog({ canManageAssignments, publicBaseUrl, templates, vehicle }) {
    const t = useTranslations("project.charroi.vehicles");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const [templateId, setTemplateId] = useState("");
    const availableTemplates = useMemo(() => {
        const assignedTemplateIds = new Set(
            vehicle.assignments.map(assignment => assignment.checklistTemplateId)
        );

        return templates.filter(template => !assignedTemplateIds.has(template.id));
    }, [templates, vehicle.assignments]);

    if (!canManageAssignments) {
        return null;
    }

    const handleCreateAssignment = async () => {
        if (!templateId) {
            return;
        }

        const result = await execute(
            () =>
                createChecklistAssignmentAction({
                    vehicleId: vehicle.id,
                    checklistTemplateId: templateId,
                    isActive: true,
                }),
            {
                successMessage: t("assignment_created"),
            }
        );

        if (result.success) {
            setTemplateId("");
        }
    };

    const handleDeleteAssignment = assignment => {
        dialogManager.confirm({
            title: t("assignment_delete_title"),
            description: t("assignment_delete_description", {
                name: assignment.checklistName,
            }),
            action: {
                label: t("delete_button"),
                variant: "destructive",
                onClick: async () => {
                    await deleteChecklistAssignmentAction({
                        assignmentId: assignment.id,
                    });
                },
                successMessage: t("assignment_deleted"),
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton render={<Button variant="outline" size="sm" />}>
                <Link2 className="mr-2 h-4 w-4" />
                {t("assignments_button")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("assignments_title", { plate: vehicle.plateNumber })}
                    </DialogTitle>
                    <DialogDescription>{t("assignments_description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 rounded-lg border p-4">
                        <Label>{t("assignment_template_label")}</Label>
                        <Select
                            value={templateId}
                            onValueChange={setTemplateId}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("assignment_template_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTemplates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            onClick={handleCreateAssignment}
                            disabled={isPending || !templateId}
                        >
                            {t("assignment_add_button")}
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {vehicle.assignments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">{t("no_assignments")}</p>
                        ) : (
                            vehicle.assignments.map(assignment => {
                                const publicUrl = `${publicBaseUrl}/${assignment.publicToken}`;

                                return (
                                    <div
                                        key={assignment.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">
                                                    {assignment.checklistName}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {assignment.isActive
                                                        ? t("status_active")
                                                        : t("status_inactive")}
                                                </span>
                                            </div>
                                            <ButtonGroup>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        execute(
                                                            () =>
                                                                updateChecklistAssignmentAction({
                                                                    assignmentId: assignment.id,
                                                                    isActive: !assignment.isActive,
                                                                }),
                                                            {
                                                                successMessage: assignment.isActive
                                                                    ? t("assignment_disabled")
                                                                    : t("assignment_enabled"),
                                                            }
                                                        )
                                                    }
                                                >
                                                    {assignment.isActive
                                                        ? t("disable_button")
                                                        : t("enable_button")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon-sm"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        execute(
                                                            () =>
                                                                regenerateChecklistAssignmentTokenAction(
                                                                    {
                                                                        assignmentId: assignment.id,
                                                                    }
                                                                ),
                                                            {
                                                                successMessage: t(
                                                                    "assignment_token_regenerated"
                                                                ),
                                                            }
                                                        )
                                                    }
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon-sm"
                                                    onClick={async () => {
                                                        await navigator.clipboard.writeText(
                                                            publicUrl
                                                        );
                                                        toast.success(t("link_copied"));
                                                    }}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        handleDeleteAssignment(assignment)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                        <div className="text-muted-foreground rounded-md border bg-muted/40 px-3 py-2 text-xs">
                                            {publicUrl}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function VehiclesManager({
    canManageAssignments,
    canManageVehicles,
    publicBaseUrl,
    templates,
    vehicles,
}) {
    const t = useTranslations("project.charroi.vehicles");

    const handleDeleteVehicle = vehicle => {
        dialogManager.confirm({
            title: t("delete_title"),
            description: t("delete_description", {
                plate: vehicle.plateNumber,
            }),
            action: {
                label: t("delete_button"),
                variant: "destructive",
                onClick: async () => {
                    await deleteVehicleAction({
                        vehicleId: vehicle.id,
                    });
                },
                successMessage: t("vehicle_deleted"),
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                <VehicleFormDialog canManage={canManageVehicles} />
            </div>
            <div className="flex flex-col gap-3">
                {vehicles.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("empty_state")}</p>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} className="flex flex-col gap-3 rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{vehicle.plateNumber}</span>
                                    <span className="text-muted-foreground text-sm">
                                        {[vehicle.name, vehicle.brand, vehicle.model]
                                            .filter(Boolean)
                                            .join(" - ") || t("no_vehicle_details")}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {vehicle.isActive
                                            ? t("status_active")
                                            : t("status_inactive")}
                                    </span>
                                </div>
                                <ButtonGroup>
                                    <VehicleAssignmentsDialog
                                        canManageAssignments={canManageAssignments}
                                        publicBaseUrl={publicBaseUrl}
                                        templates={templates}
                                        vehicle={vehicle}
                                    />
                                    <VehicleFormDialog
                                        canManage={canManageVehicles}
                                        vehicle={vehicle}
                                        trigger={
                                            <Button variant="outline" size="icon-sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                    />
                                    {canManageVehicles && (
                                        <Button
                                            variant="destructive"
                                            size="icon-sm"
                                            onClick={() => handleDeleteVehicle(vehicle)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {vehicle.assignments.length === 0 ? (
                                    <span className="text-muted-foreground">
                                        {t("no_assignments")}
                                    </span>
                                ) : (
                                    vehicle.assignments.map(assignment => (
                                        <span
                                            key={assignment.id}
                                            className="rounded-md border px-2 py-1"
                                        >
                                            {assignment.checklistName}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
