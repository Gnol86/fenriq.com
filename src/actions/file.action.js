"use server";

import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth, requirePermission } from "../lib/access-control";

const hostUrl = `${process.env.AWS_S3_PROTOCOL}://${process.env.AWS_S3_HOSTNAME}/${process.env.AWS_S3_BUCKET}`;

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

export async function deleteFileUser() {
    const { user } = await requireAuth();
    const url = user.image;

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
    }
}

export async function deleteFileOrga() {
    const { organization } = await requirePermission({
        permissions: { organization: ["update"] },
    });
    const url = organization.logo;

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
    }
}
