export function getChecklistPhotoCommentValue(comment) {
    return typeof comment === "string" ? comment.trim() : "";
}

export function getChecklistPhotoDisplayName(photo) {
    return getChecklistPhotoCommentValue(photo?.comment);
}

export function buildChecklistPhotoCommentsPayload(uploadedPhotosByFieldId) {
    return Object.values(uploadedPhotosByFieldId ?? {}).reduce((accumulator, photos) => {
        for (const photo of photos ?? []) {
            accumulator[photo.id] = photo.comment ?? "";
        }

        return accumulator;
    }, {});
}

export function validateChecklistPhotoComments({
    fieldMap,
    photoComments,
    sanitizedResponses,
    uploadedPhotoMap,
}) {
    const normalizedPhotoComments = Object.entries(photoComments ?? {}).reduce(
        (accumulator, [photoId, comment]) => {
            accumulator[photoId] = getChecklistPhotoCommentValue(comment);
            return accumulator;
        },
        {}
    );

    for (const photoId of Object.keys(normalizedPhotoComments)) {
        if (!uploadedPhotoMap.has(photoId)) {
            throw new Error("Un commentaire photo est invalide");
        }
    }

    const referencedPhotoIds = [];

    for (const [fieldId, value] of Object.entries(sanitizedResponses)) {
        const field = fieldMap.get(fieldId);

        if (field?.type !== "photo") {
            continue;
        }

        for (const photoId of Array.isArray(value) ? value : []) {
            const photo = uploadedPhotoMap.get(photoId);

            if (!photo || photo.fieldId !== fieldId) {
                throw new Error("Une photo associée à la checklist est invalide");
            }

            referencedPhotoIds.push(photoId);

            if (
                field.photoCommentRequired === true &&
                getChecklistPhotoCommentValue(normalizedPhotoComments[photoId]) === ""
            ) {
                throw new Error(
                    `Le commentaire est requis pour chaque photo du champ "${field.label}"`
                );
            }
        }
    }

    return {
        normalizedPhotoComments,
        referencedPhotoIds: [...new Set(referencedPhotoIds)],
    };
}
