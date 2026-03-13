"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const EMPTY_PHOTOS = [];
const EMPTY_DISABLED_PHOTO_ACTION_IDS = [];
const EMPTY_MUTED_PHOTO_IDS = [];

export function ChecklistPhotoGallery({
    actionLabel = "",
    actionVariant = "outline",
    emptyLabel = "",
    disabledPhotoActionIds = EMPTY_DISABLED_PHOTO_ACTION_IDS,
    getPhotoActionLabel = null,
    getPhotoActionVariant = null,
    label = "",
    mutedPhotoIds = EMPTY_MUTED_PHOTO_IDS,
    mutedPhotoName = "",
    mutedPhotoNameClassName = "",
    onPhotoAction = null,
    photos = EMPTY_PHOTOS,
}) {
    const [activePhoto, setActivePhoto] = useState(null);

    if (photos.length === 0) {
        return emptyLabel ? <span>{emptyLabel}</span> : null;
    }

    return (
        <>
            <div className="flex flex-col gap-3">
                {label ? (
                    <span className="text-foreground text-xs font-medium uppercase tracking-wide">
                        {label}
                    </span>
                ) : null}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map(photo => {
                        const isMuted = mutedPhotoIds.includes(photo.id);
                        const resolvedActionLabel = getPhotoActionLabel?.(photo) ?? actionLabel;
                        const resolvedActionVariant =
                            getPhotoActionVariant?.(photo) ?? actionVariant;

                        return (
                            <div
                                key={photo.id}
                                className="flex flex-col gap-2 rounded-md border p-2"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActivePhoto(photo)}
                                    className="flex flex-col gap-2 text-left"
                                >
                                    <div
                                        className={cn(
                                            "bg-muted relative aspect-square overflow-hidden rounded-md border",
                                            isMuted ? "grayscale" : ""
                                        )}
                                    >
                                        <Image
                                            src={photo.url}
                                            alt={photo.originalName}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 180px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <span
                                        className={cn(
                                            "truncate text-xs",
                                            isMuted ? mutedPhotoNameClassName : ""
                                        )}
                                    >
                                        {isMuted && mutedPhotoName
                                            ? mutedPhotoName
                                            : photo.originalName}
                                    </span>
                                </button>
                                {onPhotoAction && resolvedActionLabel ? (
                                    <Button
                                        type="button"
                                        variant={resolvedActionVariant}
                                        size="xs"
                                        disabled={disabledPhotoActionIds.includes(photo.id)}
                                        onClick={() => onPhotoAction(photo.id)}
                                    >
                                        {resolvedActionLabel}
                                    </Button>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
            <Dialog
                open={activePhoto != null}
                onOpenChange={open => {
                    if (!open) {
                        setActivePhoto(null);
                    }
                }}
            >
                <DialogContent className="!grid h-[calc(100dvh-2rem)] !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] grid-rows-[auto,minmax(0,1fr)] gap-3 !p-3 sm:h-[calc(100dvh-4rem)] sm:!w-[calc(100vw-4rem)] sm:!max-w-[calc(100vw-4rem)]">
                    <DialogTitle className="pr-10 text-sm">{activePhoto?.originalName}</DialogTitle>
                    <div className="bg-muted flex min-h-0 items-center justify-center overflow-hidden rounded-md border p-2">
                        {activePhoto ? (
                            <Image
                                src={activePhoto.url}
                                alt={activePhoto.originalName}
                                width={1920}
                                height={1080}
                                sizes="100vw"
                                className="h-auto max-h-full w-auto max-w-full object-contain"
                                priority
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
