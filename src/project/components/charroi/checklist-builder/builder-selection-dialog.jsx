"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function BuilderSelectionDialog({
    children,
    contentClassName = "",
    description,
    onClose,
    open,
    title,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={nextOpen => {
                if (!nextOpen) {
                    onClose();
                }
            }}
        >
            {open ? (
                <DialogContent
                    className={`grid-rows-[auto_minmax(0,1fr)] overflow-hidden sm:max-h-[85vh] ${contentClassName}`}
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
                        {children}
                    </div>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}
