"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import ImageProfile from "@/components/image-profile";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Cropper,
    CropperCropArea,
    CropperDescription,
    CropperImage,
} from "@/components/ui/cropper";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deleteFile, uploadFile } from "@/actions/file.action";
import { updateOrganizationAction } from "@/actions/organization.action";
import { useTranslations } from "next-intl";

export default function ImageUpload({ organization }) {
    const fileInputRef = useRef(null);
    const { execute, isPending } = useServerAction();
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cropArea, setCropArea] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isCropping, setIsCropping] = useState(false);
    const [zoom, setZoom] = useState(1);
    const tManage = useTranslations("organization.manage");
    const tImageUpload = useTranslations("organization.image_upload");
    const zoomRange = useMemo(
        () => ({
            min: 1,
            max: 3,
            step: 0.01,
        }),
        []
    );

    const resetCropperState = useCallback(() => {
        setSelectedFile(null);
        setCropArea(null);
        setIsCropping(false);
        setZoom(1);
        setPreviewUrl(prev => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return "";
        });
    }, []);

    const handleDialogOpenChange = open => {
        setIsCropperOpen(open);
        if (!open) {
            resetCropperState();
        }
    };

    const handleFileUpload = async file => {
        if (!file || !organization?.id) return;

        await execute(
            async () => {
                const url = await uploadFile(
                    file,
                    "organization",
                    organization?.logo
                );
                await updateOrganizationAction({
                    organizationId: organization.id,
                    logo: url,
                });
            },
            {
                successMessage: tImageUpload("success_upload"),
            }
        );
    };

    const handleDeleteImage = async () => {
        if (!organization?.id || !organization?.logo) return;

        await execute(
            async () => {
                await deleteFile(organization.logo);
                await updateOrganizationAction({
                    organizationId: organization.id,
                    logo: "",
                });
            },
            {
                successMessage: tImageUpload("success_delete"),
            }
        );
    };

    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (file) {
            const nextPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(prev => {
                if (prev) {
                    URL.revokeObjectURL(prev);
                }
                return nextPreviewUrl;
            });
            setSelectedFile(file);
            setCropArea(null);
            setZoom(1);
            setIsCropperOpen(true);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = "";
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const createCroppedFile = useCallback(async () => {
        if (!selectedFile) return null;
        if (!cropArea) return selectedFile;

        const { width, height, x, y } = cropArea;
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = previewUrl;
        });

        const canvas = document.createElement("canvas");
        const baseWidth = Math.max(1, Math.round(width));
        const baseHeight = Math.max(1, Math.round(height));
        const maxCanvasSize = 500;
        const scale = Math.min(
            1,
            maxCanvasSize / Math.max(baseWidth, baseHeight)
        );
        const outputWidth = Math.max(1, Math.round(baseWidth * scale));
        const outputHeight = Math.max(1, Math.round(baseHeight * scale));
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error(tImageUpload("error_crop_context"));
        }

        ctx.drawImage(
            image,
            x,
            y,
            width,
            height,
            0,
            0,
            outputWidth,
            outputHeight
        );

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(value => {
                if (!value) {
                    reject(new Error(tImageUpload("error_crop_generate")));
                    return;
                }
                resolve(value);
            }, selectedFile.type || "image/png");
        });

        return new File([blob], selectedFile.name, {
            type: selectedFile.type || "image/png",
        });
    }, [cropArea, previewUrl, selectedFile, tImageUpload]);

    const handleCropConfirm = async () => {
        if (!selectedFile) return;

        // Capture selectedFile to avoid race conditions
        const currentFile = selectedFile;

        try {
            setIsCropping(true);
            const fileToUpload = (await createCroppedFile()) ?? currentFile;

            // Safety check: ensure we have a valid file before uploading
            if (!fileToUpload) {
                console.error("No file to upload after crop");
                return;
            }

            await handleFileUpload(fileToUpload);
            setIsCropperOpen(false);
            resetCropperState();
        } catch (error) {
            console.error(tImageUpload("error_crop_generate"), error);
        } finally {
            setIsCropping(false);
        }
    };

    const handleZoomSliderChange = event => {
        const nextZoom = Number(event.target.value);
        if (Number.isNaN(nextZoom)) return;
        setZoom(nextZoom);
    };

    if (!organization) {
        return (
            <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                <p>{tManage("no_org_error")}</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative w-fit">
                {/* Zone de drag & drop */}
                <div
                    className={cn(
                        "w-fit cursor-pointer rounded-full transition-colors",
                        "ring-primary/50 hover:ring-2",
                        (isPending || isCropping) &&
                            "pointer-events-none opacity-50"
                    )}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isPending}
                    />

                    <ImageProfile entity={organization} size="2xl" />
                </div>

                {/* Bouton de suppression si une image existe */}
                {organization.logo && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteImage}
                        className="text-destructive absolute -top-2 -right-4 rounded-full"
                        disabled={isPending}
                    >
                        <Trash2 />
                    </Button>
                )}
            </div>

            <Dialog open={isCropperOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {tImageUpload("cropper_title")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="bg-muted flex h-80 w-full items-center justify-center overflow-hidden rounded-lg">
                            {previewUrl ? (
                                <Cropper
                                    image={previewUrl}
                                    aspectRatio={1}
                                    zoom={zoom}
                                    minZoom={zoomRange.min}
                                    maxZoom={zoomRange.max}
                                    onZoomChange={setZoom}
                                    onCropChange={setCropArea}
                                    className="h-full w-full"
                                >
                                    <CropperDescription>
                                        {tImageUpload("cropper_description")}
                                    </CropperDescription>
                                    <CropperImage />
                                    <CropperCropArea className="rounded-full" />
                                </Cropper>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {tImageUpload("cropper_loading")}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="org-image-zoom-slider">
                                {tImageUpload("zoom_label")}
                            </Label>
                            <input
                                id="org-image-zoom-slider"
                                type="range"
                                min={zoomRange.min}
                                max={zoomRange.max}
                                step={zoomRange.step}
                                value={zoom}
                                onChange={handleZoomSliderChange}
                                disabled={isPending || isCropping}
                                className="accent-primary w-full cursor-pointer"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCropperOpen(false)}
                            disabled={isPending || isCropping}
                        >
                            {tImageUpload("cancel_button")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCropConfirm}
                            disabled={isPending || isCropping || !selectedFile}
                        >
                            {isCropping || isPending
                                ? tImageUpload("saving_button")
                                : tImageUpload("save_button")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
