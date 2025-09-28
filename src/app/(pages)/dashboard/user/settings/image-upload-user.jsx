"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import ImageProfile from "@/components/image-profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteFile, uploadFile } from "@/actions/file.action";
import { updateUserAction } from "@/actions/user.action";

export default function ImageUploadUser({ user }) {
    const fileInputRef = useRef(null);
    const { execute, isPending } = useServerAction();

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
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Aucun utilisateur trouvé.</p>
            </div>
        );
    }

    return (
        <div className="relative w-fit">
            {/* Zone de drag & drop */}
            <div
                className={cn(
                    "cursor-pointer transition-colors w-fit rounded-full",
                    "hover:ring-2 ring-primary/50",
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
                    className="absolute -top-2 -right-4 rounded-full text-destructive"
                    disabled={isPending}
                >
                    <Trash2 />
                </Button>
            )}
        </div>
    );
}
