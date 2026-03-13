"use client";

import { createChecklistInitialResponses } from "@project/lib/charroi/public-checklist-prefill";
import { Label } from "@/components/ui/label";
import { ChecklistFieldControl } from "./checklist-field-control";

const EMPTY_PHOTOS_BY_FIELD_ID = {};
const EMPTY_REMOVED_HISTORICAL_PHOTO_IDS = [];

export const createInitialResponses = createChecklistInitialResponses;

export function ChecklistFormRenderer({
    className = "",
    disabled = false,
    draftTextEntriesByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
    hideFieldMeta = false,
    historicalPhotosByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
    historicalTextEntriesByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
    historicalTextEntriesLabel = "",
    historicalPhotosLabel = "",
    markTextEntryForDeletionLabel = "",
    markPhotoForDeletionLabel = "",
    onDraftTextEntryAdd = () => {},
    onDraftTextEntryChange = () => {},
    onDraftTextEntryRemove = () => {},
    onFileUpload = () => {},
    onHistoricalPhotoRemove = () => {},
    onHistoricalPhotoRestore = () => {},
    onHistoricalTextEntryRemove = () => {},
    onHistoricalTextEntryRestore = () => {},
    onUploadedPhotoCancel = () => {},
    onUploadedPhotoCommentChange = () => {},
    onValueChange = () => {},
    pendingUploadedPhotoActionIds = EMPTY_REMOVED_HISTORICAL_PHOTO_IDS,
    photoCommentLabel = "",
    photoCommentPlaceholder = "",
    removedHistoricalTextEntryIds = EMPTY_REMOVED_HISTORICAL_PHOTO_IDS,
    removedHistoricalTextEntryName = "",
    removedHistoricalPhotoIds = EMPTY_REMOVED_HISTORICAL_PHOTO_IDS,
    removedHistoricalPhotoName = "",
    restoreHistoricalTextEntryLabel = "",
    restoreHistoricalPhotoLabel = "",
    addTextEntryButtonLabel = "",
    addPhotoButtonLabel = "",
    cancelUploadedPhotoButtonLabel = "",
    draftTextEntriesLabel = "",
    removeDraftTextEntryButtonLabel = "",
    textEntryPlaceholder = "",
    responses,
    schema,
    selectPlaceholder,
    uploadedPhotosLabel = "",
    uploadedPhotosByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
}) {
    return (
        <div className={`flex flex-col gap-6 ${className}`}>
            {schema.sections.map(section => (
                <div key={section.id} className="flex flex-col gap-4 rounded-lg border p-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-medium">{section.title}</h2>
                        {section.description ? (
                            <p className="text-muted-foreground text-sm">{section.description}</p>
                        ) : null}
                    </div>
                    {section.fields.map(field => (
                        <div key={field.id} className="flex flex-col gap-2">
                            {field.type !== "checkbox" && !hideFieldMeta ? (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    {field.description ? (
                                        <p className="text-muted-foreground text-sm">
                                            {field.description}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                            <ChecklistFieldControl
                                disabled={disabled}
                                draftTextEntriesByFieldId={draftTextEntriesByFieldId}
                                field={field}
                                historicalPhotosByFieldId={historicalPhotosByFieldId}
                                historicalTextEntriesByFieldId={historicalTextEntriesByFieldId}
                                historicalTextEntriesLabel={historicalTextEntriesLabel}
                                historicalPhotosLabel={historicalPhotosLabel}
                                markTextEntryForDeletionLabel={markTextEntryForDeletionLabel}
                                markPhotoForDeletionLabel={markPhotoForDeletionLabel}
                                onDraftTextEntryAdd={onDraftTextEntryAdd}
                                onDraftTextEntryChange={onDraftTextEntryChange}
                                onDraftTextEntryRemove={onDraftTextEntryRemove}
                                onFileUpload={onFileUpload}
                                onHistoricalPhotoRemove={onHistoricalPhotoRemove}
                                onHistoricalPhotoRestore={onHistoricalPhotoRestore}
                                onHistoricalTextEntryRemove={onHistoricalTextEntryRemove}
                                onHistoricalTextEntryRestore={onHistoricalTextEntryRestore}
                                onUploadedPhotoCancel={onUploadedPhotoCancel}
                                onUploadedPhotoCommentChange={onUploadedPhotoCommentChange}
                                onValueChange={onValueChange}
                                pendingUploadedPhotoActionIds={pendingUploadedPhotoActionIds}
                                photoCommentLabel={photoCommentLabel}
                                photoCommentPlaceholder={photoCommentPlaceholder}
                                removedHistoricalTextEntryIds={removedHistoricalTextEntryIds}
                                removedHistoricalTextEntryName={removedHistoricalTextEntryName}
                                removedHistoricalPhotoIds={removedHistoricalPhotoIds}
                                removedHistoricalPhotoName={removedHistoricalPhotoName}
                                restoreHistoricalTextEntryLabel={restoreHistoricalTextEntryLabel}
                                restoreHistoricalPhotoLabel={restoreHistoricalPhotoLabel}
                                addTextEntryButtonLabel={addTextEntryButtonLabel}
                                addPhotoButtonLabel={addPhotoButtonLabel}
                                cancelUploadedPhotoButtonLabel={cancelUploadedPhotoButtonLabel}
                                draftTextEntriesLabel={draftTextEntriesLabel}
                                removeDraftTextEntryButtonLabel={removeDraftTextEntryButtonLabel}
                                textEntryPlaceholder={textEntryPlaceholder}
                                responses={responses}
                                selectPlaceholder={selectPlaceholder}
                                uploadedPhotosLabel={uploadedPhotosLabel}
                                uploadedPhotosByFieldId={uploadedPhotosByFieldId}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
