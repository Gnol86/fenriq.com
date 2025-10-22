"use server";

import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

const hostUrl = `${process.env.AWS_S3_PROTOCOL}://${process.env.AWS_S3_HOSTNAME}/${process.env.AWS_S3_BUCKET}`;

export async function uploadFile(file, folder = "", oldUrl) {
    const t = await getTranslations("file");

    // Validate file exists
    if (!file) {
        console.error("uploadFile error: file is null or undefined");
        throw new Error(t("error_no_file"));
    }

    // Validate file size (max 4.5MB for server uploads on Vercel)
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > MAX_SIZE) {
        throw new Error(t("error_file_too_large", { maxSize: 4.5 }));
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
        throw new Error(t("error_unsupported_type"));
    }

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const filename = `${timestamp}-${randomSuffix}-${file.name}`;
        const key = folder ? `${folder}/${filename}` : filename;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // Generate public URL
        const url = `${hostUrl}/${key}`;

        // Delete old file if exists
        await deleteFile(oldUrl);
        revalidatePath("/");

        return url;
    } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        throw new Error(t("error_upload_failed"));
    }
}

export async function deleteFile(url) {
    if (!url) return;

    try {
        // Extract key from URL
        // URL format: https://bucket.s3.region.amazonaws.com/key
        const key = url.replace(`${hostUrl}/`, "");

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        // Don't throw error for delete failures - it's not critical
    }
}
