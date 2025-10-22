"use client";

import { deleteFile, uploadFile } from "@/actions/file.action";
import { updateUserAction } from "@/actions/user.action";
import ImageProfile from "@/components/image-profile";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";
import { useServerAction } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

export default function ImageUploadUser({ user }) {
    const fileInputRef = useRef(null);
    const { execute, isPending } = useServerAction();
    const tImageUpload = useTranslations("user.image_upload");

    const [selectedFile, setSelectedFile] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [croppedImageDataUrl, setCroppedImageDataUrl] = useState(null);

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleFileUpload = async file => {
        if (!file || !user?.id) return;

        await execute(
            async () => {
                const url = await uploadFile(file, "user", user?.image);
                await updateUserAction({
                    image: url,
                });
            },
            {
                successMessage: tImageUpload("success_upload"),
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
                successMessage: tImageUpload("success_delete"),
            }
        );
    };

    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setDialogOpen(true);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = "";
    };

    const handleCropComplete = async () => {
        if (!croppedImageDataUrl || !selectedFile) return;

        const croppedFile = dataURLtoFile(
            croppedImageDataUrl,
            selectedFile.name
        );

        setDialogOpen(false);
        setSelectedFile(null);
        setCroppedImageDataUrl(null);

        await handleFileUpload(croppedFile);
    };

    const handleCancelCrop = () => {
        setDialogOpen(false);
        setSelectedFile(null);
        setCroppedImageDataUrl(null);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    if (!user) {
        return (
            <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                <p>{tImageUpload("no_user")}</p>
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
                        isPending && "pointer-events-none opacity-50"
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
                        className="text-destructive absolute -top-2 -right-4 rounded-full"
                        disabled={isPending}
                    >
                        <Trash2 />
                    </Button>
                )}
            </div>

            {/* Dialog pour recadrer l'image */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {tImageUpload("cropper_title")}
                        </DialogTitle>
                        <DialogDescription>
                            {tImageUpload("cropper_description")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFile && (
                        <ImageCrop
                            file={selectedFile}
                            aspect={1}
                            circularCrop
                            onCrop={dataUrl => setCroppedImageDataUrl(dataUrl)}
                        >
                            <ImageCropContent />
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <ImageCropReset />
                                <ImageCropApply />
                            </div>
                        </ImageCrop>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelCrop}
                            disabled={isPending}
                        >
                            {tImageUpload("cancel_button")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCropComplete}
                            disabled={isPending || !croppedImageDataUrl}
                        >
                            {isPending
                                ? tImageUpload("saving_button")
                                : tImageUpload("save_button")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
