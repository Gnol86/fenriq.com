import { NextResponse } from "next/server";
import { deleteTemporaryChecklistPhoto } from "@project/lib/charroi/checklist-photo-cleanup";
import { getPublicChecklistAssignment } from "@project/lib/charroi/public-checklist";
import { publicChecklistDeleteUploadSchema } from "@project/lib/charroi/template-schema";

export async function DELETE(request, { params }) {
    const { token, photoId } = await params;
    const assignment = await getPublicChecklistAssignment(token);

    if (!assignment) {
        return NextResponse.json({ error: "Checklist introuvable" }, { status: 404 });
    }

    let payload;

    try {
        payload = publicChecklistDeleteUploadSchema.parse(await request.json());
    } catch (_error) {
        return NextResponse.json({ error: "Suppression invalide" }, { status: 400 });
    }

    try {
        const deletedPhoto = await deleteTemporaryChecklistPhoto({
            assignmentId: assignment.id,
            draftUploadKey: payload.draftUploadKey,
            photoId,
        });

        if (!deletedPhoto) {
            return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
        }

        return NextResponse.json({
            photoId: deletedPhoto.id,
            success: true,
        });
    } catch (error) {
        console.error("[charroi] Delete public checklist upload failed", {
            errorMessage: error?.message,
            errorName: error?.name,
            photoId,
        });

        return NextResponse.json(
            {
                error: "Impossible d'annuler la photo",
            },
            { status: 500 }
        );
    }
}
