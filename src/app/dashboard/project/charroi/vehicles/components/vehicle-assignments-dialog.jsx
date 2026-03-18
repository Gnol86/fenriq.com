"use client";

import {
    createChecklistAssignmentAction,
    deleteChecklistAssignmentAction,
    regenerateChecklistAssignmentTokenAction,
    updateChecklistAssignmentAction,
} from "@project/actions/charroi.action";
import { Copy, Link2, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

function buildPublicAssignmentUrl(publicBaseUrl, assignment) {
    return `${publicBaseUrl}/${assignment.publicToken}`;
}

function sanitizeQrFileNamePart(value, fallback) {
    const normalizedValue = String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalizedValue || fallback;
}

function buildQrCodeFileName({ checklistName, plateNumber, publicToken }) {
    const safePlateNumber = sanitizeQrFileNamePart(plateNumber, "vehicule");
    const safeChecklistName = sanitizeQrFileNamePart(
        checklistName,
        sanitizeQrFileNamePart(publicToken, "checklist")
    );

    return `${safePlateNumber}-${safeChecklistName}.png`;
}

export function VehicleAssignmentsDialog({
    canCreateAssignments,
    canDeleteAssignments,
    canUpdateAssignments,
    canViewAssignments,
    publicBaseUrl,
    templates,
    vehicle,
}) {
    const t = useTranslations("project.charroi.vehicles");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const [downloadingAssignmentId, setDownloadingAssignmentId] = useState(null);
    const [templateId, setTemplateId] = useState("");
    const availableTemplates = useMemo(() => {
        const assignedTemplateIds = new Set(
            vehicle.assignments.map(assignment => assignment.checklistTemplateId)
        );

        return templates.filter(template => !assignedTemplateIds.has(template.id));
    }, [templates, vehicle.assignments]);

    if (!canViewAssignments) {
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

    const handleDownloadQrCode = async assignment => {
        const publicUrl = buildPublicAssignmentUrl(publicBaseUrl, assignment);

        setDownloadingAssignmentId(assignment.id);

        try {
            const qrCodeModule = await import("qrcode");
            const QRCode = qrCodeModule.default ?? qrCodeModule;
            const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
                type: "image/png",
                errorCorrectionLevel: "H",
                margin: 2,
                width: 1024,
            });
            const downloadLink = document.createElement("a");

            downloadLink.href = qrCodeDataUrl;
            downloadLink.download = buildQrCodeFileName({
                plateNumber: vehicle.plateNumber,
                checklistName: assignment.checklistName,
                publicToken: assignment.publicToken,
            });
            downloadLink.click();

            toast.success(t("qr_downloaded"));
        } catch (error) {
            console.error("[charroi] Unable to download QR code", {
                assignmentId: assignment.id,
                errorMessage: error instanceof Error ? error.message : String(error),
            });
            toast.error(t("qr_download_error"));
        }

        setDownloadingAssignmentId(currentAssignmentId =>
            currentAssignmentId === assignment.id ? null : currentAssignmentId
        );
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
                <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-3 rounded-lg border p-4">
                        <Label>{t("assignment_template_label")}</Label>
                        <Select
                            value={templateId}
                            onValueChange={setTemplateId}
                            disabled={isPending || !canCreateAssignments}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("assignment_template_placeholder")}>
                                    {
                                        availableTemplates.find(
                                            template => template.id === templateId
                                        )?.name
                                    }
                                </SelectValue>
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
                            disabled={isPending || !templateId || !canCreateAssignments}
                        >
                            {t("assignment_add_button")}
                        </Button>
                    </div>
                    <div className="flex min-w-0 flex-col gap-3">
                        {vehicle.assignments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">{t("no_assignments")}</p>
                        ) : (
                            vehicle.assignments.map(assignment => {
                                const publicUrl = buildPublicAssignmentUrl(
                                    publicBaseUrl,
                                    assignment
                                );
                                const isDownloadingQrCode =
                                    downloadingAssignmentId === assignment.id;

                                return (
                                    <div
                                        key={assignment.id}
                                        className="flex min-w-0 flex-col gap-3 rounded-lg border p-4"
                                    >
                                        <div className="flex min-w-0 items-start justify-between gap-2">
                                            <div className="flex min-w-0 flex-col gap-1">
                                                <span className="truncate font-medium">
                                                    {assignment.checklistName}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {assignment.isActive
                                                        ? t("status_active")
                                                        : t("status_inactive")}
                                                </span>
                                            </div>
                                            <ButtonGroup className="shrink-0">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isPending || !canUpdateAssignments}
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
                                                    disabled={isPending || !canUpdateAssignments}
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
                                                    variant="outline"
                                                    size="icon-sm"
                                                    title={t("qr_download_button")}
                                                    aria-label={t("qr_download_button")}
                                                    disabled={isPending || isDownloadingQrCode}
                                                    onClick={() => handleDownloadQrCode(assignment)}
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    disabled={!canDeleteAssignments}
                                                    onClick={() =>
                                                        handleDeleteAssignment(assignment)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                        <div
                                            title={publicUrl}
                                            className="text-muted-foreground min-w-0 max-w-full rounded-md border bg-muted/40 px-3 py-2 text-xs"
                                        >
                                            <span className="block truncate">{publicUrl}</span>
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
