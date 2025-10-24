import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { deleteFileOrga, deleteFileUser } from "@root/src/actions/file.action";
import { updateOrganizationAction } from "@root/src/actions/organization.action";
import { updateUserAction } from "@root/src/actions/user.action";
import {
    requireActiveOrganization,
    requireAuth,
} from "@root/src/lib/access-control";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

const hostUrl = `${process.env.AWS_S3_PROTOCOL}://${process.env.AWS_S3_HOSTNAME}/${process.env.AWS_S3_BUCKET}`;

export async function POST(request) {
    try {
        const t = await getTranslations("file");

        // Parser le FormData
        const formData = await request.formData();
        const file = formData.get("file");
        const type = formData.get("type") ?? "";
        const field =
            type === "user" ? "image" : type === "orga" ? "logo" : null;

        if (type === "user") {
            await requireAuth();
        } else if (type === "orga") {
            await requireActiveOrganization();
        } else {
            notFound();
        }

        // Valider le fichier
        if (!file) {
            return NextResponse.json(
                { error: t("error_no_file") },
                { status: 400 }
            );
        }

        // Valider la taille (max 4.5MB pour Vercel)
        const MAX_SIZE = 4.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: t("error_file_too_large", { maxSize: 4.5 }) },
                { status: 400 }
            );
        }

        // Valider le type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: t("error_unsupported_type") },
                { status: 400 }
            );
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const filename = `${timestamp}-${randomSuffix}-${file.name}`;
        const key = field ? `${field}/${filename}` : filename;

        // Convertir le fichier en buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Uploader vers S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // Générer l'URL publique
        const url = `${hostUrl}/${key}`;

        if (type === "user") {
            await deleteFileUser();
            await updateUserAction({ [field]: url });
        } else if (type === "orga") {
            await deleteFileOrga();
            await updateOrganizationAction({ [field]: url });
        }

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de l'upload:", error);

        const t = await getTranslations("file");

        return NextResponse.json(
            { error: t("error_upload_failed") },
            { status: 500 }
        );
    }
}
