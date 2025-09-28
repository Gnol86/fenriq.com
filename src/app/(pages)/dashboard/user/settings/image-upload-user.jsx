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
import { updateUserAction } from "@/actions/user.action";

export default function ImageUploadUser({ user }) {
    const fileInputRef = useRef(null);
    const { execute, isPending } = useServerAction();
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cropArea, setCropArea] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isCropping, setIsCropping] = useState(false);
    const [zoom, setZoom] = useState(1);
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
        if (!file || !user?.id) return;

        await execute(
            async () => {
                console.log("uploading user image");
                const url = await uploadFile(file, "user", user?.image);
                await updateUserAction({
                    image: url,
                });
            },
            {
                successMessage: "Image de profil mise à jour avec succès",
            }
        );
    };

    const handleDeleteImage = async () => {
        if (!user?.id || !user?.image) return;

        await execute(
            async () => {
                await deleteFile(user.image);
                await updateUserAction({
                    image: "",
                });
            },
            {
                successMessage: "Image de profil supprimée avec succès",
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
            throw new Error("Impossible de préparer le contexte de recadrage");
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
                    reject(
                        new Error(
                            "Erreur lors de la génération de l'image recadrée"
                        )
                    );
                    return;
                }
                resolve(value);
            }, selectedFile.type || "image/png");
        });

        return new File([blob], selectedFile.name, {
            type: selectedFile.type || "image/png",
        });
    }, [cropArea, previewUrl, selectedFile]);

    const handleCropConfirm = async () => {
        if (!selectedFile) return;

        try {
            setIsCropping(true);
            const fileToUpload = (await createCroppedFile()) ?? selectedFile;
            await handleFileUpload(fileToUpload);
            setIsCropperOpen(false);
            resetCropperState();
        } catch (error) {
            console.error("Erreur lors du recadrage de l'image", error);
        } finally {
            setIsCropping(false);
        }
    };

    const handleZoomSliderChange = event => {
        const nextZoom = Number(event.target.value);
        if (Number.isNaN(nextZoom)) return;
        setZoom(nextZoom);
    };

    if (!user) {
        return (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Aucun utilisateur trouvé.</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative w-fit">
                {/* Zone de drag & drop */}
                <div
                    className={cn(
                        "cursor-pointer transition-colors w-fit rounded-full",
                        "hover:ring-2 ring-primary/50",
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

                    <ImageProfile entity={user} size="2xl" />
                </div>

                {/* Bouton de suppression si une image existe */}
                {user.image && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteImage}
                        className="absolute -top-2 -right-4 rounded-full text-destructive"
                        disabled={isPending}
                    >
                        <Trash2 />
                    </Button>
                )}
            </div>

            <Dialog open={isCropperOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Recadrer l'image</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
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
                                        Déplacez l'image pour ajuster le
                                        cadrage.
                                    </CropperDescription>
                                    <CropperImage />
                                    <CropperCropArea className="rounded-full" />
                                </Cropper>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Chargement de l'image...
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="image-zoom-slider">Zoom</Label>
                            <input
                                id="image-zoom-slider"
                                type="range"
                                min={zoomRange.min}
                                max={zoomRange.max}
                                step={zoomRange.step}
                                value={zoom}
                                onChange={handleZoomSliderChange}
                                disabled={isPending || isCropping}
                                className="w-full cursor-pointer accent-primary"
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
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCropConfirm}
                            disabled={isPending || isCropping || !selectedFile}
                        >
                            {isCropping || isPending
                                ? "En cours..."
                                : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
