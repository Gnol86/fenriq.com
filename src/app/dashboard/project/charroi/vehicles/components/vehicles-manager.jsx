"use client";

import { deleteVehicleAction } from "@project/actions/charroi.action";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";
import { VehicleAssignmentsDialog } from "./vehicle-assignments-dialog";
import { VehicleFormDialog } from "./vehicle-form-dialog";

export function VehiclesManager({
    canCreateAssignments,
    canCreateVehicle,
    canDeleteAssignments,
    canDeleteVehicle,
    canUpdateAssignments,
    canUpdateVehicle,
    canViewAssignments,
    createVehicleDisabled,
    emptyMessage,
    publicBaseUrl,
    templates,
    updateVehicleDisabled,
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
                <VehicleFormDialog canManage={canCreateVehicle} disabled={createVehicleDisabled} />
            </div>
            <div className="flex flex-col gap-3">
                {vehicles.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {emptyMessage ?? t("empty_state")}
                    </p>
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
                                        canCreateAssignments={
                                            canCreateAssignments && !updateVehicleDisabled
                                        }
                                        canDeleteAssignments={
                                            canDeleteAssignments && !updateVehicleDisabled
                                        }
                                        canUpdateAssignments={
                                            canUpdateAssignments && !updateVehicleDisabled
                                        }
                                        canViewAssignments={canViewAssignments}
                                        publicBaseUrl={publicBaseUrl}
                                        templates={templates}
                                        vehicle={vehicle}
                                    />
                                    <VehicleFormDialog
                                        canManage={canUpdateVehicle}
                                        disabled={updateVehicleDisabled}
                                        vehicle={vehicle}
                                        trigger={
                                            <Button
                                                variant="outline"
                                                size="icon-sm"
                                                disabled={updateVehicleDisabled}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                    />
                                    {canDeleteVehicle && (
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
