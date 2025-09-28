"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadFile(file, folder = "", oldUrl) {
    // Validate file size (max 4.5MB for server uploads on Vercel)
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > MAX_SIZE) {
        throw new Error("Le fichier est trop volumineux (maximum 4,5 MB)");
    }

    // Validate file type for images
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP."
        );
    }

    try {
        const pathname = `${folder}/${file.name}`;
        const blob = await put(pathname, file, {
            access: "public",
            addRandomSuffix: true,
        });
        await deleteFile(oldUrl);
        revalidatePath("/");
        return blob.url;
    } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        throw new Error("Erreur lors de l'upload du fichier");
    }
}

export async function deleteFile(url) {
    if (url) {
        await del(url);
    }
}
