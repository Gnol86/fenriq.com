"use client";

import {
    deletePublicChecklistUploadAction,
    submitPublicChecklistAction,
    uploadPublicChecklistPhotosAction,
} from "@project/actions/charroi-public.action";
import {
    buildChecklistPhotoCommentsPayload,
    getChecklistPhotoCommentValue,
} from "@project/lib/charroi/checklist-photo-comments";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";
import { ChecklistFormRenderer } from "./checklist-form-renderer";

function validateRequiredPhotoComments({ schema, responses, uploadedPhotosByFieldId, t }) {
    for (const section of schema.sections) {
        for (const field of section.fields) {
            if (field.type !== "photo" || field.photoCommentRequired !== true) {
                continue;
            }

            const uploadedPhotoMap = new Map(
                (uploadedPhotosByFieldId[field.id] ?? []).map(photo => [photo.id, photo])
            );

            for (const photoId of Array.isArray(responses[field.id]) ? responses[field.id] : []) {
                if (getChecklistPhotoCommentValue(uploadedPhotoMap.get(photoId)?.comment) === "") {
                    return t("photo_comment_required_error", {
                        field: field.label,
                    });
                }
            }
        }
    }

    return null;
}

export function PublicChecklistForm({ assignment }) {
    const t = useTranslations("project.charroi.public");
    const submitAction = useServerAction();
    const uploadAction = useServerAction();
    const [submitterName, setSubmitterName] = useState(assignment.initialSubmitterName);
    const [rememberSubmitterName, setRememberSubmitterName] = useState(
        assignment.hasRememberedSubmitterName
    );
    const [removedHistoricalPhotoIds, setRemovedHistoricalPhotoIds] = useState([]);
    const [responses, setResponses] = useState(assignment.initialResponses);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [pendingUploadedPhotoActionIds, setPendingUploadedPhotoActionIds] = useState([]);
    const [uploadedPhotosByFieldId, setUploadedPhotosByFieldId] = useState({});
    const [draftUploadKey] = useState(() => crypto.randomUUID());
    const isBusy = submitAction.isPending || uploadAction.isPending;

    const handleFileUpload = async (fieldId, fileList) => {
        const files = Array.from(fileList ?? []);

        if (files.length === 0 || isBusy) {
            return;
        }

        const formData = new FormData();
        formData.set("token", assignment.publicToken);
        formData.set("draftUploadKey", draftUploadKey);
        formData.set("fieldId", fieldId);

        for (const file of files) {
            formData.append("files", file);
        }

        const result = await uploadAction.execute(
            () => uploadPublicChecklistPhotosAction(formData),
            {
                errorMessage: t("upload_error"),
                refreshOnSuccess: false,
            }
        );

        if (!result.success) {
            return;
        }

        setUploadedPhotosByFieldId(current => ({
            ...current,
            [fieldId]: [...(current[fieldId] ?? []), ...result.data.photos],
        }));
        setResponses(current => ({
            ...current,
            [fieldId]: [...(current[fieldId] ?? []), ...result.data.photos.map(photo => photo.id)],
        }));
        toast.success(t("upload_success"));
    };

    const handleUploadedPhotoCancel = async (fieldId, photoId) => {
        if (isBusy || pendingUploadedPhotoActionIds.includes(photoId)) {
            return;
        }

        setPendingUploadedPhotoActionIds(current => [...current, photoId]);

        try {
            await deletePublicChecklistUploadAction({
                token: assignment.publicToken,
                photoId,
                draftUploadKey,
            });

            setUploadedPhotosByFieldId(current => ({
                ...current,
                [fieldId]: (current[fieldId] ?? []).filter(photo => photo.id !== photoId),
            }));
            setResponses(current => ({
                ...current,
                [fieldId]: (current[fieldId] ?? []).filter(
                    currentPhotoId => currentPhotoId !== photoId
                ),
            }));
        } catch (error) {
            toast.error(error?.message ?? t("cancel_uploaded_photo_error"));
        } finally {
            setPendingUploadedPhotoActionIds(current =>
                current.filter(currentPhotoId => currentPhotoId !== photoId)
            );
        }
    };

    const handleUploadedPhotoCommentChange = (fieldId, photoId, comment) => {
        setUploadedPhotosByFieldId(current => ({
            ...current,
            [fieldId]: (current[fieldId] ?? []).map(photo =>
                photo.id === photoId
                    ? {
                          ...photo,
                          comment,
                      }
                    : photo
            ),
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();

        if (isBusy) {
            return;
        }

        const photoCommentValidationError = validateRequiredPhotoComments({
            schema: assignment.parsedSchema,
            responses,
            uploadedPhotosByFieldId,
            t,
        });

        if (photoCommentValidationError) {
            toast.error(photoCommentValidationError);
            return;
        }

        const result = await submitAction.execute(
            () =>
                submitPublicChecklistAction({
                    token: assignment.publicToken,
                    submitterName,
                    rememberSubmitterName,
                    draftUploadKey,
                    removedHistoricalPhotoIds,
                    photoComments: buildChecklistPhotoCommentsPayload(uploadedPhotosByFieldId),
                    responses,
                }),
            {
                errorMessage: t("submit_error"),
                loadingMessage: t("submitting"),
                refreshOnSuccess: false,
                successMessage: t("submit_success"),
            }
        );

        if (!result.success) {
            return;
        }

        if ((result.data.photoCleanup?.pendingRetryCount ?? 0) > 0) {
            toast.error(
                t("photo_cleanup_pending_warning", {
                    count: result.data.photoCleanup.pendingRetryCount,
                })
            );
        }

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">{t("success_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("success_description")}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Label htmlFor="submitterName">{t("submitter_name_label")}</Label>
                <Input
                    id="submitterName"
                    value={submitterName}
                    onChange={event => setSubmitterName(event.target.value)}
                    placeholder={t("submitter_name_placeholder")}
                    required
                    disabled={isBusy}
                />
            </div>
            <div className="flex items-start gap-2 rounded-md border p-3">
                <Checkbox
                    id="rememberSubmitterName"
                    checked={rememberSubmitterName}
                    onCheckedChange={checked => setRememberSubmitterName(checked === true)}
                    disabled={isBusy}
                />
                <div className="flex flex-col gap-1">
                    <Label
                        htmlFor="rememberSubmitterName"
                        className="cursor-pointer text-sm leading-none font-medium"
                    >
                        {t("remember_submitter_name_label")}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                        {t("remember_submitter_name_description")}
                    </p>
                </div>
            </div>
            <ChecklistFormRenderer
                disabled={isBusy}
                schema={assignment.parsedSchema}
                responses={responses}
                onValueChange={(fieldId, value) =>
                    setResponses(current => ({
                        ...current,
                        [fieldId]: value,
                    }))
                }
                onFileUpload={handleFileUpload}
                historicalPhotosByFieldId={assignment.historicalPhotosByFieldId}
                removedHistoricalPhotoIds={removedHistoricalPhotoIds}
                onHistoricalPhotoRemove={photoId =>
                    setRemovedHistoricalPhotoIds(current =>
                        current.includes(photoId) ? current : [...current, photoId]
                    )
                }
                onHistoricalPhotoRestore={photoId =>
                    setRemovedHistoricalPhotoIds(current =>
                        current.filter(currentPhotoId => currentPhotoId !== photoId)
                    )
                }
                onUploadedPhotoCancel={handleUploadedPhotoCancel}
                onUploadedPhotoCommentChange={handleUploadedPhotoCommentChange}
                pendingUploadedPhotoActionIds={pendingUploadedPhotoActionIds}
                historicalPhotosLabel={t("historical_photos_label")}
                markPhotoForDeletionLabel={t("mark_photo_for_deletion_button")}
                removedHistoricalPhotoName={t("removed_historical_photo_name")}
                restoreHistoricalPhotoLabel={t("restore_historical_photo_button")}
                addPhotoButtonLabel={t("add_photo_button")}
                cancelUploadedPhotoButtonLabel={t("cancel_uploaded_photo_button")}
                photoCommentLabel={t("photo_comment_label")}
                photoCommentPlaceholder={t("photo_comment_placeholder")}
                uploadedPhotosLabel={t("uploaded_photos_label")}
                uploadedPhotosByFieldId={uploadedPhotosByFieldId}
                selectPlaceholder={t("select_placeholder")}
            />
            <Button type="submit" disabled={isBusy}>
                {submitAction.isPending ? t("submitting") : t("submit_button")}
            </Button>
        </form>
    );
}
