"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistFormRenderer } from "./checklist-form-renderer";

export function PublicChecklistForm({ assignment }) {
    const t = useTranslations("project.charroi.public");
    const [submitterName, setSubmitterName] = useState(assignment.initialSubmitterName);
    const [rememberSubmitterName, setRememberSubmitterName] = useState(
        assignment.hasRememberedSubmitterName
    );
    const [responses, setResponses] = useState(assignment.initialResponses);
    const [isPending, setIsPending] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [uploadedPhotosByFieldId, setUploadedPhotosByFieldId] = useState({});
    const [draftUploadKey] = useState(() => crypto.randomUUID());

    const handleFileUpload = async (fieldId, fileList) => {
        const files = Array.from(fileList ?? []);

        if (files.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.set("draftUploadKey", draftUploadKey);
        formData.set("fieldId", fieldId);

        for (const file of files) {
            formData.append("files", file);
        }

        const response = await fetch(`/api/public/checklists/${assignment.publicToken}/uploads`, {
            method: "POST",
            body: formData,
        });
        const payload = await response.json();

        if (!response.ok) {
            toast.error(payload.error ?? t("upload_error"));
            return;
        }

        setUploadedPhotosByFieldId(current => ({
            ...current,
            [fieldId]: [...(current[fieldId] ?? []), ...payload.photos],
        }));
        setResponses(current => ({
            ...current,
            [fieldId]: [...(current[fieldId] ?? []), ...payload.photos.map(photo => photo.id)],
        }));
        toast.success(t("upload_success"));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setIsPending(true);

        const response = await fetch(`/api/public/checklists/${assignment.publicToken}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                submitterName,
                rememberSubmitterName,
                draftUploadKey,
                responses,
            }),
        });
        const payload = await response.json();

        setIsPending(false);

        if (!response.ok) {
            toast.error(payload.error ?? t("submit_error"));
            return;
        }

        toast.success(t("submit_success"));
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
                />
            </div>
            <div className="flex items-start gap-2 rounded-md border p-3">
                <Checkbox
                    id="rememberSubmitterName"
                    checked={rememberSubmitterName}
                    onCheckedChange={checked => setRememberSubmitterName(checked === true)}
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
                schema={assignment.parsedSchema}
                responses={responses}
                onValueChange={(fieldId, value) =>
                    setResponses(current => ({
                        ...current,
                        [fieldId]: value,
                    }))
                }
                onFileUpload={handleFileUpload}
                previousPhotosByFieldId={assignment.previousPhotosByFieldId}
                previousPhotosHelpText={t("previous_photos_hint")}
                previousPhotosLabel={t("previous_photos_label")}
                uploadedPhotosByFieldId={uploadedPhotosByFieldId}
                selectPlaceholder={t("select_placeholder")}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? t("submitting") : t("submit_button")}
            </Button>
        </form>
    );
}
