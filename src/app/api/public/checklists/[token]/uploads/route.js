import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { s3Client } from "@/lib/s3";
import { CHECKLIST_MAX_UPLOAD_SIZE, CHECKLIST_UPLOAD_ALLOWED_TYPES } from "@project/lib/charroi/constants";
import { getPublicChecklistAssignment } from "@project/lib/charroi/public-checklist";
import {
    buildChecklistPhotoStorageKey,
    buildChecklistPhotoUrl,
} from "@project/lib/charroi/utils";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
    try {
        const { token } = await params;
        const assignment = await getPublicChecklistAssignment(token);

        if (!assignment) {
            return NextResponse.json({ error: "Checklist introuvable" }, { status: 404 });
        }

        const formData = await request.formData();
        const draftUploadKey = String(formData.get("draftUploadKey") ?? "").trim();
        const fieldId = String(formData.get("fieldId") ?? "").trim();
        const files = formData
            .getAll("files")
            .filter(file => typeof file?.arrayBuffer === "function");
        const photoField = assignment.parsedSchema.sections
            .flatMap(section => section.fields)
            .find(field => field.id === fieldId && field.type === "photo");

        if (!draftUploadKey || !fieldId || !photoField || files.length === 0) {
            return NextResponse.json({ error: "Upload invalide" }, { status: 400 });
        }

        const uploadedPhotos = [];

        for (const file of files) {
            if (file.size > CHECKLIST_MAX_UPLOAD_SIZE) {
                return NextResponse.json(
                    {
                        error: "Le fichier dépasse la taille maximale autorisée",
                    },
                    { status: 400 }
                );
            }

            if (!CHECKLIST_UPLOAD_ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    {
                        error: "Le type de fichier n'est pas supporté",
                    },
                    { status: 400 }
                );
            }

            const storageKey = buildChecklistPhotoStorageKey({
                assignmentId: assignment.id,
                originalName: file.name,
            });
            const buffer = Buffer.from(await file.arrayBuffer());

            await s3Client.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: storageKey,
                    Body: buffer,
                    ContentType: file.type,
                })
            );

            const photo = await prisma.checklistPhoto.create({
                data: {
                    organizationId: assignment.organizationId,
                    assignmentId: assignment.id,
                    fieldId,
                    tempUploadKey: draftUploadKey,
                    url: buildChecklistPhotoUrl(storageKey),
                    storageKey,
                    originalName: file.name,
                    mimeType: file.type,
                    size: file.size,
                },
            });

            uploadedPhotos.push(photo);
        }

        return NextResponse.json({
            photos: uploadedPhotos,
        });
    } catch (error) {
        console.error("[charroi] Upload public checklist failed", {
            errorMessage: error?.message,
            errorName: error?.name,
        });

        return NextResponse.json(
            {
                error: "Impossible d'envoyer les photos",
            },
            { status: 500 }
        );
    }
}
