"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import ImageProfile from "@/components/image-profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteFile, uploadFile } from "@/actions/file.action";
import { updateUserAction } from "@/actions/user.action";
import { useTranslations } from "next-intl";

export default function ImageUploadUser({ user }) {
    const fileInputRef = useRef(null);
    const { execute, isPending } = useServerAction();
    const tImageUpload = useTranslations("user.image_upload");

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
            console.error("DEBUG handleFileSelect: file selected", {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
            });
            handleFileUpload(file);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = "";
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
    );
}
