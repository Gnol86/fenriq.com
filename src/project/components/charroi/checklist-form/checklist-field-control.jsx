"use client";

import { ChecklistPhotoGallery } from "@project/components/charroi/checklist-photo-gallery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ChecklistFieldControl({
    disabled,
    draftTextEntriesByFieldId,
    field,
    historicalPhotosByFieldId,
    historicalTextEntriesByFieldId,
    historicalTextEntriesLabel,
    historicalPhotosLabel,
    markTextEntryForDeletionLabel,
    markPhotoForDeletionLabel,
    onDraftTextEntryAdd,
    onDraftTextEntryChange,
    onDraftTextEntryRemove,
    onFileUpload,
    onHistoricalPhotoRemove,
    onHistoricalPhotoRestore,
    onHistoricalTextEntryRemove,
    onHistoricalTextEntryRestore,
    onUploadedPhotoCancel,
    onUploadedPhotoCommentChange,
    pendingUploadedPhotoActionIds,
    photoCommentLabel,
    photoCommentPlaceholder,
    removedHistoricalTextEntryIds,
    removedHistoricalTextEntryName,
    removedHistoricalPhotoIds,
    removedHistoricalPhotoName,
    restoreHistoricalTextEntryLabel,
    restoreHistoricalPhotoLabel,
    addTextEntryButtonLabel,
    addPhotoButtonLabel,
    cancelUploadedPhotoButtonLabel,
    draftTextEntriesLabel,
    removeDraftTextEntryButtonLabel,
    textEntryPlaceholder,
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
            const uploadedPhotos = uploadedPhotosByFieldId[field.id] ?? [];
            const disabledHistoricalPhotoActionIds = disabled
                ? historicalPhotos.map(photo => photo.id)
                : [];
            const disabledUploadedPhotoActionIds = disabled
                ? uploadedPhotos.map(photo => photo.id)
                : pendingUploadedPhotoActionIds;

            return (
                <div className="flex flex-col gap-2">
                    {historicalPhotos.length > 0 ? (
                        <ChecklistPhotoGallery
                            label={historicalPhotosLabel}
                            photos={historicalPhotos}
                            disabledPhotoActionIds={disabledHistoricalPhotoActionIds}
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
                            disabledPhotoActionIds={disabledUploadedPhotoActionIds}
                            onPhotoAction={photoId => onUploadedPhotoCancel(field.id, photoId)}
                            photos={uploadedPhotos}
                            renderPhotoDetails={photo => (
                                <Input
                                    value={photo.comment ?? ""}
                                    placeholder={photoCommentPlaceholder}
                                    aria-label={photoCommentLabel}
                                    disabled={
                                        disabled || pendingUploadedPhotoActionIds.includes(photo.id)
                                    }
                                    onChange={event =>
                                        onUploadedPhotoCommentChange(
                                            field.id,
                                            photo.id,
                                            event.target.value
                                        )
                                    }
                                />
                            )}
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
        case "text_list": {
            const historicalTextEntries = historicalTextEntriesByFieldId[field.id] ?? [];
            const draftTextEntries = draftTextEntriesByFieldId[field.id] ?? [];

            return (
                <div className="flex flex-col gap-3">
                    {historicalTextEntries.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {historicalTextEntriesLabel ? (
                                <span className="text-foreground text-xs font-medium uppercase tracking-wide">
                                    {historicalTextEntriesLabel}
                                </span>
                            ) : null}
                            {historicalTextEntries.map(entry => {
                                const isRemoved = removedHistoricalTextEntryIds.includes(entry.id);

                                return (
                                    <div
                                        key={entry.id}
                                        className="flex flex-col gap-2 rounded-md border p-3"
                                    >
                                        <p
                                            className={`whitespace-pre-wrap text-sm ${
                                                isRemoved
                                                    ? "text-muted-foreground line-through"
                                                    : ""
                                            }`}
                                        >
                                            {entry.text}
                                        </p>
                                        {isRemoved && removedHistoricalTextEntryName ? (
                                            <span className="text-destructive text-xs font-medium">
                                                {removedHistoricalTextEntryName}
                                            </span>
                                        ) : null}
                                        <Button
                                            type="button"
                                            variant={isRemoved ? "ghost" : "outline"}
                                            size="xs"
                                            disabled={disabled}
                                            onClick={() =>
                                                isRemoved
                                                    ? onHistoricalTextEntryRestore(
                                                          field.id,
                                                          entry.id
                                                      )
                                                    : onHistoricalTextEntryRemove(
                                                          field.id,
                                                          entry.id
                                                      )
                                            }
                                        >
                                            {isRemoved
                                                ? restoreHistoricalTextEntryLabel
                                                : markTextEntryForDeletionLabel}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                    {draftTextEntries.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {draftTextEntriesLabel ? (
                                <span className="text-foreground text-xs font-medium uppercase tracking-wide">
                                    {draftTextEntriesLabel}
                                </span>
                            ) : null}
                            {draftTextEntries.map(entry => (
                                <div
                                    key={entry.id}
                                    className="flex flex-col gap-2 rounded-md border p-3"
                                >
                                    <Textarea
                                        rows={3}
                                        value={entry.text}
                                        placeholder={textEntryPlaceholder}
                                        disabled={disabled}
                                        onChange={event =>
                                            onDraftTextEntryChange(
                                                field.id,
                                                entry.id,
                                                event.target.value
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        disabled={disabled}
                                        onClick={() => onDraftTextEntryRemove(field.id, entry.id)}
                                    >
                                        {removeDraftTextEntryButtonLabel}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        onClick={() => onDraftTextEntryAdd(field.id)}
                    >
                        {addTextEntryButtonLabel}
                    </Button>
                </div>
            );
        }
        default:
            return null;
    }
}
