"use client";

import { useTranslations } from "next-intl";
import { createContext, useCallback, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const DialogContext = createContext(null);

export function DialogProvider({ children }) {
    const t = useTranslations("common.dialog");
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: "",
        description: "",
        variant: "default",
        resolve: null,
        onConfirm: null,
    });

    const confirm = useCallback(({ title, description, variant = "default" }, onConfirm) => {
        return new Promise(resolve => {
            setDialogState({
                isOpen: true,
                title,
                description,
                variant,
                resolve,
                onConfirm,
            });
        });
    }, []);

    const handleConfirm = useCallback(async () => {
        if (dialogState.onConfirm) {
            try {
                const result = await dialogState.onConfirm();
                dialogState.resolve?.(result);
            } catch (error) {
                dialogState.resolve?.(error);
            }
        } else {
            dialogState.resolve?.(true);
        }
        setDialogState(prev => ({ ...prev, isOpen: false }));
    }, [dialogState]);

    const handleCancel = useCallback(() => {
        if (dialogState.onConfirm) {
            dialogState.resolve?.(null);
        } else {
            dialogState.resolve?.(false);
        }
        setDialogState(prev => ({ ...prev, isOpen: false }));
    }, [dialogState]);

    const handleOpenChange = useCallback(
        open => {
            if (!open) {
                if (dialogState.onConfirm) {
                    dialogState.resolve?.(null);
                } else {
                    dialogState.resolve?.(false);
                }
                setDialogState(prev => ({ ...prev, isOpen: false }));
            }
        },
        [dialogState]
    );

    return (
        <DialogContext.Provider value={{ confirm }}>
            {children}
            <AlertDialog open={dialogState.isOpen} onOpenChange={handleOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
                        {dialogState.description && (
                            <AlertDialogDescription>
                                {dialogState.description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={cn(
                                dialogState.variant === "destructive" &&
                                    "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}
                        >
                            {t("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DialogContext.Provider>
    );
}
