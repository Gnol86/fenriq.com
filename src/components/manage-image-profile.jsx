"use client";

import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropPreview,
} from "@/components/image-crop";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { deleteFileOrga, deleteFileUser } from "../actions/file.action";
import { updateOrganizationAction } from "../actions/organization.action";
import { updateUserAction } from "../actions/user.action";
import { useServerAction } from "../hooks/use-server-action";
import ImageProfile from "./image-profile";
import { Button } from "./ui/button";

export default function ManageImageProfile({
    entity,
    user = false,
    orga = false,
    size = "md",
}) {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { isPending, execute } = useServerAction();
    const tImageUpload = useTranslations("user.image_upload");

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

    const handleClickDelete = async () => {
        await execute(
            async () => {
                if (user) {
                    await deleteFileUser();
                    await updateUserAction({
                        image: "",
                    });
                } else if (orga) {
                    await deleteFileOrga();
                    await updateOrganizationAction({
                        logo: "",
                    });
                }
            },
            {
                successMessage: tImageUpload("success_delete"),
            }
        );
    };

    const handleClickEdit = () => {
        fileInputRef.current?.click();
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

    const handleCropComplete = async croppedImage => {
        if (!croppedImage || !entity?.id || !selectedFile) return;

        await execute(
            async () => {
                const file = dataURLtoFile(croppedImage, selectedFile.name);
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", user ? "user" : orga ? "orga" : null);

                await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
            },
            {
                successMessage: tImageUpload("success_upload"),
            }
        );

        setDialogOpen(false);
        setSelectedFile(null);
    };

    const handleCancelCrop = () => {
        setDialogOpen(false);
        setSelectedFile(null);
    };

    if (!(user || orga)) return null;
    if (!entity) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            <div onClick={handleClickEdit} className="relative w-fit">
                <ImageProfile entity={entity} size={size} />
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isPending}
                />
            </div>
            {(entity?.image || entity?.logo) && (
                <Button
                    onClick={handleClickDelete}
                    size="icon"
                    variant="destructive"
                >
                    <Trash2 />
                </Button>
            )}
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
                        <ImageCrop file={selectedFile} aspect={1}>
                            <ImageCropContent />
                            <div className="flex w-full justify-center">
                                <ImageCropPreview className="h-20 w-20" />
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelCrop}
                                    disabled={isPending}
                                >
                                    {tImageUpload("cancel_button")}
                                </Button>
                                <ImageCropApply
                                    size="default"
                                    variant="default"
                                    onClick={croppedImage =>
                                        handleCropComplete(croppedImage)
                                    }
                                    asChild
                                >
                                    <Button>
                                        {isPending
                                            ? tImageUpload("saving_button")
                                            : tImageUpload("save_button")}
                                    </Button>
                                </ImageCropApply>
                            </div>
                        </ImageCrop>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
