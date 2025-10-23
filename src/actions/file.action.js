"use server";

import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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
