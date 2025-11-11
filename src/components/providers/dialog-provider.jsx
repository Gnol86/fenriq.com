"use client";

import { useTranslations } from "next-intl";
import { createContext, useCallback, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/modal";
import { Button } from "@/components/ui/button";
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
            <Modal open={dialogState.isOpen} onOpenChange={handleOpenChange}>
                <ModalContent showCloseButton={false}>
                    <ModalHeader>
                        <ModalTitle>{dialogState.title}</ModalTitle>
                        {dialogState.description && (
                            <ModalDescription>{dialogState.description}</ModalDescription>
                        )}
                    </ModalHeader>
                    <ModalFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={cn(
                                dialogState.variant === "destructive" &&
                                    "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}
                        >
                            {t("confirm")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </DialogContext.Provider>
    );
}
