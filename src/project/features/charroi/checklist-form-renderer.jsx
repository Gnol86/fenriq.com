"use client";

import { ChecklistPhotoGallery } from "@project/components/charroi/checklist-photo-gallery";
import { createChecklistInitialResponses } from "@project/lib/charroi/public-checklist-prefill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_PHOTOS_BY_FIELD_ID = {};
const EMPTY_REMOVED_HISTORICAL_PHOTO_IDS = [];

export const createInitialResponses = createChecklistInitialResponses;

function ChecklistFieldControl({
    disabled,
    field,
    historicalPhotosByFieldId,
    historicalPhotosLabel,
    markPhotoForDeletionLabel,
    onFileUpload,
    onHistoricalPhotoRemove,
    onHistoricalPhotoRestore,
    onUploadedPhotoCancel,
    pendingUploadedPhotoActionIds,
    removedHistoricalPhotoIds,
    removedHistoricalPhotoName,
    restoreHistoricalPhotoLabel,
    addPhotoButtonLabel,
    cancelUploadedPhotoButtonLabel,
    onValueChange,
    responses,
    selectPlaceholder,
    uploadedPhotosLabel,
    uploadedPhotosByFieldId,
}) {
    const value = responses[field.id];

    switch (field.type) {
        case "text":
            return (
                <Input
                    id={field.id}
                    disabled={disabled}
                    value={value ?? ""}
                    onChange={event => onValueChange(field.id, event.target.value)}
                />
            );
        case "textarea":
            return (
                <Textarea
                    id={field.id}
                    disabled={disabled}
                    rows={4}
                    value={value ?? ""}
                    onChange={event => onValueChange(field.id, event.target.value)}
                />
            );
        case "number":
            return (
                <Input
                    id={field.id}
                    type="number"
                    disabled={disabled}
                    value={value ?? ""}
                    onChange={event => onValueChange(field.id, event.target.value)}
                />
            );
        case "single_select":
            return (
                <Select
                    disabled={disabled}
                    value={value ?? ""}
                    onValueChange={nextValue => onValueChange(field.id, nextValue)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={selectPlaceholder}>
                            {field.options.find(option => option.value === value)?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(option => (
                            <SelectItem key={option.id} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case "multi_select":
            return (
                <div className="flex flex-col gap-2">
                    {field.options.map(option => {
                        const checked = Array.isArray(value) && value.includes(option.value);

                        return (
                            <div key={option.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={checked}
                                    disabled={disabled}
                                    onCheckedChange={nextChecked =>
                                        onValueChange(
                                            field.id,
                                            nextChecked
                                                ? [...(value ?? []), option.value]
                                                : (value ?? []).filter(
                                                      item => item !== option.value
                                                  )
                                        )
                                    }
                                />
                                {option.label}
                            </div>
                        );
                    })}
                </div>
            );
        case "checkbox":
            return (
                <div className="flex items-start gap-2">
                    <Checkbox
                        checked={value === true}
                        disabled={disabled}
                        onCheckedChange={nextChecked =>
                            onValueChange(field.id, nextChecked === true)
                        }
                    />
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.description ? (
                            <span className="text-muted-foreground text-sm">
                                {field.description}
                            </span>
                        ) : null}
                    </div>
                </div>
            );
        case "photo": {
            const historicalPhotos = historicalPhotosByFieldId[field.id] ?? [];
            const fileInputId = `${field.id}-upload`;

            return (
                <div className="flex flex-col gap-2">
                    {historicalPhotos.length > 0 ? (
                        <ChecklistPhotoGallery
                            label={historicalPhotosLabel}
                            photos={historicalPhotos}
                            mutedPhotoIds={removedHistoricalPhotoIds}
                            mutedPhotoName={removedHistoricalPhotoName}
                            mutedPhotoNameClassName="text-destructive font-medium"
                            getPhotoActionLabel={photo =>
                                removedHistoricalPhotoIds.includes(photo.id)
                                    ? restoreHistoricalPhotoLabel
                                    : markPhotoForDeletionLabel
                            }
                            getPhotoActionVariant={photo =>
                                removedHistoricalPhotoIds.includes(photo.id) ? "ghost" : "outline"
                            }
                            onPhotoAction={photoId =>
                                removedHistoricalPhotoIds.includes(photoId)
                                    ? onHistoricalPhotoRestore(photoId)
                                    : onHistoricalPhotoRemove(photoId)
                            }
                        />
                    ) : null}
                    <Input
                        id={fileInputId}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        disabled={disabled}
                        onChange={event => onFileUpload(field.id, event.target.files)}
                    />
                    {(uploadedPhotosByFieldId[field.id] ?? []).length > 0 ? (
                        <ChecklistPhotoGallery
                            label={uploadedPhotosLabel}
                            actionLabel={cancelUploadedPhotoButtonLabel}
                            disabledPhotoActionIds={pendingUploadedPhotoActionIds}
                            onPhotoAction={photoId => onUploadedPhotoCancel(field.id, photoId)}
                            photos={uploadedPhotosByFieldId[field.id] ?? []}
                        />
                    ) : null}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        onClick={() => document.getElementById(fileInputId)?.click()}
                    >
                        {addPhotoButtonLabel}
                    </Button>
                </div>
            );
        }
        default:
            return null;
    }
}

export function ChecklistFormRenderer({
    className = "",
    disabled = false,
    hideFieldMeta = false,
    historicalPhotosByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
    historicalPhotosLabel = "",
    markPhotoForDeletionLabel = "",
    onFileUpload = () => {},
    onHistoricalPhotoRemove = () => {},
    onHistoricalPhotoRestore = () => {},
    onUploadedPhotoCancel = () => {},
    onValueChange = () => {},
    pendingUploadedPhotoActionIds = EMPTY_REMOVED_HISTORICAL_PHOTO_IDS,
    removedHistoricalPhotoIds = EMPTY_REMOVED_HISTORICAL_PHOTO_IDS,
    removedHistoricalPhotoName = "",
    restoreHistoricalPhotoLabel = "",
    addPhotoButtonLabel = "",
    cancelUploadedPhotoButtonLabel = "",
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
                                field={field}
                                historicalPhotosByFieldId={historicalPhotosByFieldId}
                                historicalPhotosLabel={historicalPhotosLabel}
                                markPhotoForDeletionLabel={markPhotoForDeletionLabel}
                                onFileUpload={onFileUpload}
                                onHistoricalPhotoRemove={onHistoricalPhotoRemove}
                                onHistoricalPhotoRestore={onHistoricalPhotoRestore}
                                onUploadedPhotoCancel={onUploadedPhotoCancel}
                                onValueChange={onValueChange}
                                pendingUploadedPhotoActionIds={pendingUploadedPhotoActionIds}
                                removedHistoricalPhotoIds={removedHistoricalPhotoIds}
                                removedHistoricalPhotoName={removedHistoricalPhotoName}
                                restoreHistoricalPhotoLabel={restoreHistoricalPhotoLabel}
                                addPhotoButtonLabel={addPhotoButtonLabel}
                                cancelUploadedPhotoButtonLabel={cancelUploadedPhotoButtonLabel}
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
