"use client";

import { createChecklistInitialResponses } from "@project/lib/charroi/public-checklist-prefill";
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

export const createInitialResponses = createChecklistInitialResponses;

function ChecklistFieldControl({
    disabled,
    field,
    onFileUpload,
    previousPhotosByFieldId,
    previousPhotosHelpText,
    previousPhotosLabel,
    onValueChange,
    responses,
    selectPlaceholder,
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
        case "photo":
            return (
                <div className="flex flex-col gap-2">
                    {(previousPhotosByFieldId[field.id] ?? []).length > 0 ? (
                        <div className="flex flex-col gap-2 rounded-md border p-3">
                            <span className="text-sm font-medium">{previousPhotosLabel}</span>
                            <div className="flex flex-col gap-1">
                                {(previousPhotosByFieldId[field.id] ?? []).map(photo => (
                                    <a
                                        key={photo.id}
                                        href={photo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm underline"
                                    >
                                        {photo.originalName}
                                    </a>
                                ))}
                            </div>
                            {previousPhotosHelpText ? (
                                <p className="text-muted-foreground text-xs">
                                    {previousPhotosHelpText}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                    <Input
                        id={field.id}
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={disabled}
                        onChange={event => onFileUpload(field.id, event.target.files)}
                    />
                    <div className="flex flex-col gap-1">
                        {(uploadedPhotosByFieldId[field.id] ?? []).map(photo => (
                            <a
                                key={photo.id}
                                href={photo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm underline"
                            >
                                {photo.originalName}
                            </a>
                        ))}
                    </div>
                </div>
            );
        default:
            return null;
    }
}

export function ChecklistFormRenderer({
    className = "",
    disabled = false,
    hideFieldMeta = false,
    onFileUpload = () => {},
    onValueChange = () => {},
    previousPhotosByFieldId = EMPTY_PHOTOS_BY_FIELD_ID,
    previousPhotosHelpText = "",
    previousPhotosLabel = "",
    responses,
    schema,
    selectPlaceholder,
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
                                onFileUpload={onFileUpload}
                                onValueChange={onValueChange}
                                previousPhotosByFieldId={previousPhotosByFieldId}
                                previousPhotosHelpText={previousPhotosHelpText}
                                previousPhotosLabel={previousPhotosLabel}
                                responses={responses}
                                selectPlaceholder={selectPlaceholder}
                                uploadedPhotosByFieldId={uploadedPhotosByFieldId}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
